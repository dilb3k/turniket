import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useNavigate } from 'react-router-dom';
import { DESCRIPTOR_LENGTH, MODEL_SOURCES } from '../lib/turnstile/constants';
import { createUserApi } from '../lib/turnstile/usersApi';

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

export function useRegister() {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('Register modeli yuklanmoqda...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [form, setForm] = useState({
    name: '',
    className: '',
    rollNumber: '',
  });
  const navigate = useNavigate();

  const loadModels = useCallback(async () => {
    let lastError = null;

    for (const source of MODEL_SOURCES) {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(source),
          faceapi.nets.faceLandmark68Net.loadFromUri(source),
          faceapi.nets.faceRecognitionNet.loadFromUri(source),
        ]);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Face model yuklanmadi');
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        await loadModels();
        setModelsLoaded(true);
        setStatus("Register tayyor. Endi user qo'shishingiz mumkin.");
      } catch (error) {
        console.error(error);
        setStatus('Xato: model yuklanmadi.');
      } finally {
        setIsBootstrapping(false);
      }
    };

    boot();
  }, [loadModels]);

  const detectSingleFaceDescriptor = useCallback(async () => {
    const video = webcamRef.current?.video;

    if (!video || video.readyState < 2) {
      throw new Error('Kamera hali tayyor emas.');
    }

    const detections = await faceapi
      .detectAllFaces(video, DETECTOR_OPTIONS)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length === 0) {
      throw new Error('Yuz topilmadi. Kameraga aniq qarang.');
    }

    if (detections.length > 1) {
      throw new Error("Register uchun kadrda faqat 1 ta odam bo'lishi kerak.");
    }

    const descriptor = detections[0].descriptor;
    if (!descriptor || descriptor.length !== DESCRIPTOR_LENGTH) {
      throw new Error("Yuz descriptor o'lchami xato.");
    }

    return Array.from(descriptor);
  }, []);

  const onInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!form.name.trim() || !form.className.trim() || !form.rollNumber.trim()) {
        setStatus("Ro'yxatdan o'tish uchun barcha maydonni to'ldiring.");
        return;
      }

      if (!modelsLoaded) {
        setStatus('Model hali tayyor emas.');
        return;
      }

      setRegistering(true);

      try {
        const descriptor = await detectSingleFaceDescriptor();
        const payload = {
          name: form.name.trim(),
          class: form.className.trim(),
          rollNumber: form.rollNumber.trim(),
          descriptor,
          lastPassedAt: null,
          passHistory: [],
        };

        await createUserApi(payload);
        setStatus(`Yangi user qo'shildi: ${payload.name}`);
        setForm({ name: '', className: '', rollNumber: '' });

        setTimeout(() => navigate('/'), 600);
      } catch (error) {
        console.error(error);
        setStatus(error.message || "Ro'yxatdan o'tishda xato.");
      } finally {
        setRegistering(false);
      }
    },
    [detectSingleFaceDescriptor, form, modelsLoaded, navigate]
  );

  const videoConstraints = useMemo(
    () => ({
      width: 720,
      height: 560,
      facingMode: 'user',
    }),
    []
  );

  return {
    webcamRef,
    status,
    form,
    registering,
    modelsLoaded,
    isBootstrapping,
    videoConstraints,
    onInputChange,
    onSubmit,
  };
}
