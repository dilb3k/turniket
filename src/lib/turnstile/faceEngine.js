import * as faceapi from 'face-api.js';
import { MODEL_SOURCES } from './constants';

let modelLoadPromise = null;
let loadedSource = null;

export const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

export async function loadFaceModelsOnce() {
  if (modelLoadPromise) {
    return modelLoadPromise;
  }

  modelLoadPromise = (async () => {
    let lastError = null;

    for (const source of MODEL_SOURCES) {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(source),
          faceapi.nets.faceLandmark68Net.loadFromUri(source),
          faceapi.nets.faceRecognitionNet.loadFromUri(source),
        ]);
        loadedSource = source;
        return source;
      } catch (error) {
        lastError = error;
      }
    }

    modelLoadPromise = null;
    throw lastError || new Error('Face model yuklanmadi');
  })();

  return modelLoadPromise;
}

export function getLoadedModelSource() {
  return loadedSource;
}
