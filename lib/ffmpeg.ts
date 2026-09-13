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
  onProgress?: (ratio: number, status?: string) => void
): Promise<{ url: string; size: number }> => {
  const ffmpegInstance = await getFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.gif';
  
  await ffmpegInstance.writeFile(inputName, await fetchFile(videoFile));

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
      if (onProgress && duration > 0) {
        let calculatedProgress = time / (duration * 1000000);
        if (calculatedProgress < 0) calculatedProgress = 0;
        if (calculatedProgress > 1) calculatedProgress = 1;
        onProgress(calculatedProgress, i > 0 ? `재압축 중... (${Math.round(calculatedProgress * 100)}%)` : undefined);
      }
    };

    ffmpegInstance.on('progress', progressHandler);

    const vfCommand = `fps=${profile.fps},scale=${profile.scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

    await ffmpegInstance.exec([
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', inputName,
      '-vf', vfCommand,
      '-loop', '0',
      outputName,
    ]);

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
