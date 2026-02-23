import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useNavigate } from 'react-router-dom';
import { DESCRIPTOR_LENGTH } from '../lib/turnstile/constants';
import { compactDescriptor } from '../lib/turnstile/descriptors';
import { DETECTOR_OPTIONS, loadFaceModelsOnce } from '../lib/turnstile/faceEngine';
import { createUserApi, fetchUsersApi } from '../lib/turnstile/usersApi';

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

  useEffect(() => {
    const boot = async () => {
      try {
        await loadFaceModelsOnce();
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
  }, []);

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

    return compactDescriptor(Array.from(descriptor));
  }, []);

  const onInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onClassQuickPick = useCallback((className) => {
    setForm((prev) => ({ ...prev, className }));
  }, []);

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const name = form.name.trim();
      const className = form.className.trim();
      const rollNumber = form.rollNumber.trim();

      if (!name || !className || !rollNumber) {
        setStatus("Ro'yxatdan o'tish uchun barcha maydonni to'ldiring.");
        return;
      }

      if (!modelsLoaded) {
        setStatus('Model hali tayyor emas.');
        return;
      }

      setRegistering(true);

      try {
        const existing = await fetchUsersApi();
        const duplicate = existing.find(
          (item) =>
            String(item.class || '').trim().toLowerCase() === className.toLowerCase() &&
            String(item.rollNumber || '').trim().toLowerCase() === rollNumber.toLowerCase()
        );

        if (duplicate) {
          throw new Error('Bu sinf va rollNumber bilan user allaqachon mavjud.');
        }

        const descriptor = await detectSingleFaceDescriptor();
        const payload = {
          name,
          class: className,
          rollNumber,
          descriptor,
          lastPassedAt: null,
          passHistory: [],
        };

        await createUserApi(payload);
        setStatus(`Yangi user qo'shildi: ${payload.name}`);
        setForm({ name: '', className: '', rollNumber: '' });

        setTimeout(() => navigate('/'), 400);
      } catch (error) {
        console.error(error);
        setStatus(error.message || "Ro'yxatdan o'tishda xato.");
      } finally {
        setRegistering(false);
      }
    },
    [detectSingleFaceDescriptor, form, modelsLoaded, navigate]
  );

  const classQuickPicks = useMemo(
    () => ['5-A', '6-A', '7-A', '8-A', '9-A', '10-A', '11-A', '11-B'],
    []
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
    classQuickPicks,
    onInputChange,
    onClassQuickPick,
    onSubmit,
  };
}
