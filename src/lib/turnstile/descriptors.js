import * as faceapi from 'face-api.js';
import { DESCRIPTOR_LENGTH } from './constants';

export function buildDescriptors(list) {
  let skipped = 0;

  const descriptors = list
    .map((user) => {
      const raw = Array.isArray(user.descriptor) ? user.descriptor : [];
      const normalized = raw
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
        .slice(0, DESCRIPTOR_LENGTH);

      if (normalized.length !== DESCRIPTOR_LENGTH || !user.id) {
        skipped += 1;
        return null;
      }

      return new faceapi.LabeledFaceDescriptors(String(user.id), [new Float32Array(normalized)]);
    })
    .filter(Boolean);

  return { descriptors, skipped };
}

export function normalizeDescriptor(rawDescriptor) {
  const raw = Array.isArray(rawDescriptor) ? rawDescriptor : [];
  return raw
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .slice(0, DESCRIPTOR_LENGTH);
}

export function compactDescriptor(rawDescriptor) {
  return normalizeDescriptor(rawDescriptor).map((value) => Number(value.toFixed(6)));
}
