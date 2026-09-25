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

export const convertToGif = async (
  videoFile: File,
  startTime: number,
  duration: number,
  quality: 'high' | 'normal' | 'low',
  textOverlay: string,
  speed: number,
  logoFile: File | null,
  videoFilter: 'none' | 'grayscale' | 'sepia' | 'bright',
  onProgress?: (ratio: number, status?: string) => void
): Promise<{ url: string; size: number }> => {
  const ffmpegInstance = await getFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.gif';
  const logoName = 'logo.png';
  
  await ffmpegInstance.writeFile(inputName, await fetchFile(videoFile));

  if (logoFile) {
    await ffmpegInstance.writeFile(logoName, await fetchFile(logoFile));
  }

  // If text overlay is provided, we need to load the font
  let fontFilter = '';
  if (textOverlay.trim()) {
    try {
      const fontUrl = '/fonts/NanumGothic.ttf';
      await ffmpegInstance.writeFile('font.ttf', await fetchFile(fontUrl));
      // Escape text properly for ffmpeg drawtext filter
      const safeText = textOverlay.replace(/'/g, "\\'").replace(/:/g, "\\:");
      fontFilter = `,drawtext=fontfile=font.ttf:text='${safeText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-(text_h*1.5):borderw=3:bordercolor=black`;
    } catch (e) {
      console.warn("Failed to load font for text overlay", e);
    }
  }

  // Playback speed filter (setpts = 1/speed * PTS)
  // When speed is 2.0 (fast), setpts=0.5*PTS.
  const ptsFactor = 1.0 / speed;
  const speedFilter = speed !== 1.0 ? `setpts=${ptsFactor}*PTS,` : '';

  // Actual expected output duration (for progress calculation)
  const expectedOutputDuration = duration / speed;

  const TARGET_SIZE_MB = 19.5; // Aim slightly below 20MB
  const MAX_BYTES = TARGET_SIZE_MB * 1024 * 1024;
  
  // Define fallback profiles for 'normal' (Naver Blog) to guarantee < 20MB
  const profiles = quality === 'normal' 
    ? [
        { fps: 10, scale: 480 },
        { fps: 8, scale: 360 },
        { fps: 6, scale: 280 }
      ]
    : quality === 'high' 
      ? [{ fps: 15, scale: 640 }]
      : [{ fps: 8, scale: 320 }]; // low

  let finalData: Uint8Array | null = null;
  
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    
    // Status update for retries
    if (i > 0 && onProgress) {
      onProgress(0, `20MB 초과! 용량을 맞추기 위해 재압축 중... (시도 ${i+1}/${profiles.length})`);
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

    // Build color filter string
    let colorFilterStr = '';
    if (videoFilter === 'grayscale') {
      colorFilterStr = ',hue=s=0';
    } else if (videoFilter === 'sepia') {
      colorFilterStr = ',colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
    } else if (videoFilter === 'bright') {
      colorFilterStr = ',eq=brightness=0.05:contrast=1.1:saturation=1.2';
    }

    // Build the filtergraph
    let filterGraph = `[0:v]${speedFilter}fps=${profile.fps},scale=${profile.scale}:-1:flags=lanczos${colorFilterStr}${fontFilter}[v_base];`;
    
    if (logoFile) {
      // Scale logo to a maximum of 25% of the video width
      const logoScaleWidth = Math.round(profile.scale * 0.25);
      filterGraph += `[1:v]scale=${logoScaleWidth}:-1[logo_scaled];`;
      // Overlay logo at the bottom right with 15px padding
      filterGraph += `[v_base][logo_scaled]overlay=W-w-15:H-h-15[v_overlay];`;
    }

    const lastNode = logoFile ? '[v_overlay]' : '[v_base]';
    filterGraph += `${lastNode}split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

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
    
    // If it's under 20MB (or if we are not on 'normal' quality, or if it's the last fallback profile), break and return
    if (sizeBytes <= MAX_BYTES || quality !== 'normal' || i === profiles.length - 1) {
      break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gifBlob = new Blob([finalData as any], { type: 'image/gif' });
  const gifUrl = URL.createObjectURL(gifBlob);

  return { url: gifUrl, size: gifBlob.size };
};
