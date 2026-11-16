import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const getFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) {
    return ffmpeg;
  }
  
  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
};

export interface SubtitleConfig {
  text: string;
  font?: 'Jua' | 'Gaegu' | 'BlackHanSans' | 'NanumGothic';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
  borderWidth?: 'none' | 'thin' | 'bold' | 'heavy';
  borderColor?: string;
  position?: 'bottom' | 'center' | 'top';
}

export interface EmoticonOverlayConfig {
  file: File;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'above-text';
  size?: 'small' | 'medium' | 'large';
}

export type QualityPreset = 'high' | 'normal' | 'community' | 'low';

export interface MosaicBox {
  id: string;
  xPercent: number; // 0 ~ 100
  yPercent: number; // 0 ~ 100
  widthPercent: number; // 0 ~ 100
  heightPercent: number; // 0 ~ 100
  type?: 'blur' | 'pixel';
  label?: string;
}

export interface ExtraConvertOptions {
  isBoomerang?: boolean;
  textWatermark?: string;
  mosaicBoxes?: MosaicBox[];
}

export const convertToGif = async (
  videoFile: File,
  startTime: number,
  duration: number,
  quality: QualityPreset,
  textOverlay: string | SubtitleConfig,
  speed: number,
  logoFile: File | null,
  videoFilter: 'none' | 'grayscale' | 'sepia' | 'bright',
  onProgress?: (ratio: number, status?: string) => void,
  emoticonConfig?: EmoticonOverlayConfig | null,
  options?: ExtraConvertOptions
): Promise<{ url: string; size: number; webpUrl?: string | null; webpSize?: number | null }> => {
  const ffmpegInstance = await getFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.gif';
  const logoName = 'logo.png';
  const emoticonName = 'emoticon.png';
  
  await ffmpegInstance.writeFile(inputName, await fetchFile(videoFile));

  if (logoFile) {
    await ffmpegInstance.writeFile(logoName, await fetchFile(logoFile));
  }

  if (emoticonConfig?.file) {
    await ffmpegInstance.writeFile(emoticonName, await fetchFile(emoticonConfig.file));
  }

  const isBoomerang = !!options?.isBoomerang;
  const textWatermark = options?.textWatermark?.trim() || '';

  // Parse text overlay options
  const subtitle: SubtitleConfig = typeof textOverlay === 'string' 
    ? { text: textOverlay } 
    : textOverlay || { text: '' };

  const rawText = subtitle.text || '';
  const fontChoice = subtitle.font || 'Jua';
  const fontColor = subtitle.color || '#FFE812';
  const borderColor = subtitle.borderColor || 'black';
  const borderPreset = subtitle.borderWidth || 'bold';
  const sizePreset = subtitle.size || 'medium';
  const positionPreset = subtitle.position || 'bottom';

  const fontFileMap: Record<string, string> = {
    Jua: '/fonts/Jua.ttf',
    Gaegu: '/fonts/Gaegu.ttf',
    BlackHanSans: '/fonts/BlackHanSans.ttf',
    NanumGothic: '/fonts/NanumGothic.ttf',
  };

  // If text overlay or text watermark is provided, load font
  let hasValidFont = false;
  if (rawText.trim() || textWatermark) {
    try {
      const fontUrl = fontFileMap[fontChoice] || '/fonts/Jua.ttf';
      await ffmpegInstance.writeFile('font.ttf', await fetchFile(fontUrl));
      hasValidFont = true;
    } catch (e) {
      console.warn("Failed to load font, fallback to NanumGothic", e);
      try {
        await ffmpegInstance.writeFile('font.ttf', await fetchFile('/fonts/NanumGothic.ttf'));
        hasValidFont = true;
      } catch (err) {
        console.warn("Font fallback also failed", err);
      }
    }
  }

  // Playback speed filter (setpts = 1/speed * PTS)
  const ptsFactor = 1.0 / speed;
  const speedFilter = speed !== 1.0 ? `setpts=${ptsFactor}*PTS,` : '';

  // Expected output duration for progress
  const expectedOutputDuration = (duration / speed) * (isBoomerang ? 2 : 1);

  // Community preset guarantees < 10MB, Normal guarantees < 20MB
  const isTargetConstrained = quality === 'community' || quality === 'normal';
  const TARGET_SIZE_MB = quality === 'community' ? 9.8 : 19.5;
  const MAX_BYTES = TARGET_SIZE_MB * 1024 * 1024;
  
  const profiles = quality === 'community'
    ? [
        { fps: 10, scale: 380 },
        { fps: 8, scale: 300 },
        { fps: 6, scale: 240 }
      ]
    : quality === 'normal' 
      ? [
          { fps: 10, scale: 480 },
          { fps: 8, scale: 360 },
          { fps: 6, scale: 280 }
        ]
      : quality === 'high' 
        ? [{ fps: 15, scale: 640 }]
        : [{ fps: 8, scale: 320 }]; // low

  let finalData: Uint8Array | null = null;
  const limitLabel = quality === 'community' ? '10MB' : '20MB';
  
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    
    // Status update for retries
    if (i > 0 && onProgress) {
      onProgress(0, `${limitLabel} 초과! 최적 규격으로 재압축 중... (${i+1}/${profiles.length})`);
    }

    const progressHandler = ({ time }: { time: number }) => {
      if (onProgress && expectedOutputDuration > 0) {
        let calculatedProgress = time / (expectedOutputDuration * 1000000);
        if (calculatedProgress < 0) calculatedProgress = 0;
        if (calculatedProgress > 1) calculatedProgress = 1;
        onProgress(calculatedProgress, i > 0 ? `재압축 중... (${Math.round(calculatedProgress * 100)}%)` : undefined);
      }
    };

    ffmpegInstance.on('progress', progressHandler);

    // Color filter string
    let colorFilterStr = '';
    if (videoFilter === 'grayscale') {
      colorFilterStr = ',hue=s=0';
    } else if (videoFilter === 'sepia') {
      colorFilterStr = ',colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
    } else if (videoFilter === 'bright') {
      colorFilterStr = ',eq=brightness=0.05:contrast=1.1:saturation=1.2';
    }

    // Build base video pipeline (Speed, FPS, Scale, Color)
    const basePipeline = `[0:v]${speedFilter}fps=${profile.fps},scale=${profile.scale}:-1:flags=lanczos${colorFilterStr}`;
    let filterGraph = '';

    if (isBoomerang) {
      // Boomerang: Forward + Reverse Concat
      filterGraph += `${basePipeline}[v_base_orig];[v_base_orig]split[fwd][rev_in];[rev_in]reverse[rev];[fwd][rev]concat=n=2:v=1[v_base];`;
    } else {
      filterGraph += `${basePipeline}[v_base];`;
    }
    let currentNode = '[v_base]';

    // 0. Mosaic & Blur Masking Boxes (얼굴/번호판/정보 가리기)
    const mosaicBoxes = options?.mosaicBoxes || [];
    if (mosaicBoxes.length > 0) {
      mosaicBoxes.forEach((box, idx) => {
        const xFrac = (Math.max(0, Math.min(99, box.xPercent)) / 100).toFixed(4);
        const yFrac = (Math.max(0, Math.min(99, box.yPercent)) / 100).toFixed(4);
        const wFrac = (Math.max(1, Math.min(100 - box.xPercent, box.widthPercent)) / 100).toFixed(4);
        const hFrac = (Math.max(1, Math.min(100 - box.yPercent, box.heightPercent)) / 100).toFixed(4);

        const nextNode = `[v_mosaic_${idx}]`;
        const splitMain = `[m_main_${idx}]`;
        const splitCrop = `[m_crop_${idx}]`;
        const blurred = `[m_blur_${idx}]`;

        if (box.type === 'pixel') {
          // 픽셀 모자이크: 영역 축소 후 최근접 이웃 보간으로 복원
          filterGraph += `${currentNode}split${splitMain}${splitCrop};`;
          filterGraph += `${splitCrop}crop=w='max(8,round(iw*${wFrac}))':h='max(8,round(ih*${hFrac}))':x='round(iw*${xFrac})':y='round(ih*${yFrac})',scale=iw/7:ih/7:flags=neighbor,scale='max(8,round(iw*7))':'max(8,round(ih*7))':flags=neighbor${blurred};`;
          filterGraph += `${splitMain}${blurred}overlay=x='round(main_w*${xFrac})':y='round(main_h*${yFrac})'${nextNode};`;
        } else {
          // 가우시안/박스 블러: 부드러운 흐림 효과
          filterGraph += `${currentNode}split${splitMain}${splitCrop};`;
          filterGraph += `${splitCrop}crop=w='max(8,round(iw*${wFrac}))':h='max(8,round(ih*${hFrac}))':x='round(iw*${xFrac})':y='round(ih*${yFrac})',boxblur=12:2${blurred};`;
          filterGraph += `${splitMain}${blurred}overlay=x='round(main_w*${xFrac})':y='round(main_h*${yFrac})'${nextNode};`;
        }
        currentNode = nextNode;
      });
    }

    // 1. Text Subtitle
    if (hasValidFont && rawText.trim()) {
      const safeText = rawText.replace(/'/g, "\\'").replace(/:/g, "\\:");
      
      let sizeRatio = 0.095;
      if (sizePreset === 'small') sizeRatio = 0.07;
      else if (sizePreset === 'large') sizeRatio = 0.12;
      else if (sizePreset === 'xlarge') sizeRatio = 0.15;
      const dynamicFontSize = Math.max(18, Math.round(profile.scale * sizeRatio));

      let borderW = 4;
      if (borderPreset === 'none') borderW = 0;
      else if (borderPreset === 'thin') borderW = 2;
      else if (borderPreset === 'heavy') borderW = 6;

      let yExpr = 'h-(text_h*1.6)';
      if (positionPreset === 'top') {
        yExpr = 'text_h*0.8';
      } else if (positionPreset === 'center') {
        yExpr = '(h-text_h)/2';
      }

      const cleanFontColor = fontColor.startsWith('#') ? fontColor : `#${fontColor}`;
      const cleanBorderColor = borderColor.startsWith('#') ? borderColor : borderColor;

      filterGraph += `${currentNode}drawtext=fontfile=font.ttf:text='${safeText}':fontcolor=${cleanFontColor}:fontsize=${dynamicFontSize}:x=(w-text_w)/2:y=${yExpr}:borderw=${borderW}:bordercolor=${cleanBorderColor}[v_sub];`;
      currentNode = '[v_sub]';
    }

    // 2. Text Watermark (Copyright / Blog watermark)
    if (hasValidFont && textWatermark) {
      const safeWatermark = textWatermark.replace(/'/g, "\\'").replace(/:/g, "\\:");
      const wmFontSize = Math.max(12, Math.round(profile.scale * 0.045));
      filterGraph += `${currentNode}drawtext=fontfile=font.ttf:text='${safeWatermark}':fontcolor=white@0.8:fontsize=${wmFontSize}:x=w-text_w-12:y=h-text_h-10:shadowcolor=black@0.7:shadowx=1:shadowy=1[v_wm];`;
      currentNode = '[v_wm]';
    }

    // 3. Logo Image Overlay
    if (logoFile) {
      const logoScaleWidth = Math.round(profile.scale * 0.22);
      filterGraph += `[1:v]scale=${logoScaleWidth}:-1[logo_scaled];`;
      filterGraph += `${currentNode}[logo_scaled]overlay=W-w-15:H-h-15[v_logo];`;
      currentNode = '[v_logo]';
    }

    // 4. Palette generation and dithering
    filterGraph += `${currentNode}split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

    const args = [
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', inputName,
    ];

    if (logoFile) {
      args.push('-i', logoName);
    }

    args.push('-filter_complex', filterGraph, '-loop', '0', outputName);

    await ffmpegInstance.exec(args);

    ffmpegInstance.off('progress', progressHandler);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalData = (await ffmpegInstance.readFile(outputName)) as any;
    const sizeBytes = finalData?.length || 0;
    
    // If constrained and under max bytes (or last fallback), stop retrying
    if (!isTargetConstrained || sizeBytes <= MAX_BYTES || i === profiles.length - 1) {
      break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gifBlob = new Blob([finalData as any], { type: 'image/gif' });
  const gifUrl = URL.createObjectURL(gifBlob);

  // Try creating WebP format simultaneously for ultra-lightweight high quality download
  let webpUrl: string | null = null;
  let webpSize: number | null = null;
  try {
    const webpOutputName = 'output.webp';
    await ffmpegInstance.exec(['-i', outputName, '-loop', '0', webpOutputName]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webpData = (await ffmpegInstance.readFile(webpOutputName)) as any;
    if (webpData && webpData.length > 0) {
      const webpBlob = new Blob([webpData], { type: 'image/webp' });
      webpUrl = URL.createObjectURL(webpBlob);
      webpSize = webpBlob.size;
    }
  } catch (webpErr) {
    console.warn('WebP export skipped or failed:', webpErr);
  }

  return { 
    url: gifUrl, 
    size: gifBlob.size,
    webpUrl,
    webpSize
  };
};
