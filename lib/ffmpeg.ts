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
  onProgress?: (ratio: number) => void
): Promise<string> => {
  const ffmpegInstance = await getFFmpeg();
  
  const progressHandler = ({ time }: { time: number }) => {
    if (onProgress && duration > 0) {
      let calculatedProgress = time / (duration * 1000000);
      if (calculatedProgress < 0) calculatedProgress = 0;
      if (calculatedProgress > 1) calculatedProgress = 1;
      
      onProgress(calculatedProgress);
    }
  };

  ffmpegInstance.on('progress', progressHandler);

  const inputName = 'input.mp4';
  const outputName = 'output.gif';

  await ffmpegInstance.writeFile(inputName, await fetchFile(videoFile));

  // Convert video to GIF using FFmpeg
  await ffmpegInstance.exec([
    '-ss',
    startTime.toString(),
    '-t',
    duration.toString(),
    '-i',
    inputName,
    '-vf',
    'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
    '-loop',
    '0',
    outputName,
  ]);

  const data = await ffmpegInstance.readFile(outputName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gifBlob = new Blob([data as any], { type: 'image/gif' });
  const gifUrl = URL.createObjectURL(gifBlob);

  // Cleanup listener
  ffmpegInstance.off('progress', progressHandler);

  return gifUrl;
};
