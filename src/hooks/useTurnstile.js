import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  DESCRIPTOR_LENGTH,
  ENTRY_COOLDOWN_MS,
  FACE_MATCH_THRESHOLD,
  MODEL_SOURCES,
} from '../lib/turnstile/constants';
import { buildDescriptors } from '../lib/turnstile/descriptors';
import { fetchUsersApi, patchUserApi } from '../lib/turnstile/usersApi';

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

export function useTurnstile() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const scanActiveRef = useRef(false);
  const modelReadyRef = useRef(false);
  const lastEntryByUserRef = useRef({});

  const [status, setStatus] = useState('Modellar yuklanmoqda...');
  const [warning, setWarning] = useState('');
  const [users, setUsers] = useState([]);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [recognizedAt, setRecognizedAt] = useState(null);
  const [entryLogs, setEntryLogs] = useState([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const usersById = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[String(user.id)] = user;
      return acc;
    }, {});
  }, [users]);

  const matcher = useMemo(() => {
    if (labeledDescriptors.length === 0) {
      return null;
    }

    return new faceapi.FaceMatcher(labeledDescriptors, 0.6);
  }, [labeledDescriptors]);

  const loadModels = useCallback(async () => {
    let lastError = null;

    for (const source of MODEL_SOURCES) {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(source),
          faceapi.nets.faceLandmark68Net.loadFromUri(source),
          faceapi.nets.faceRecognitionNet.loadFromUri(source),
        ]);
        return source;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Face model yuklanmadi');
  }, []);

  const fetchUsers = useCallback(async () => {
    const list = await fetchUsersApi();
    const { descriptors, skipped } = buildDescriptors(list);

    setUsers(list);
    setLabeledDescriptors(descriptors);

    if (descriptors.length === 0) {
      setStatus("Tizimda yaroqli user yo'q. Avval register qiling.");
    } else {
      setStatus("O'quvchilar yuklandi. Kameraga qarang.");
    }

    setWarning(
      skipped > 0
        ? `Ogohlantirish: ${skipped} ta user descriptor yaroqsiz, tanishda ishlatilmaydi.`
        : ''
    );
  }, []);

  const patchUserEntryTime = useCallback(async (userId, passedAtIso) => {
    let patchPayload = null;

    setUsers((prev) => {
      const next = prev.map((item) => {
        if (String(item.id) !== String(userId)) {
          return item;
        }

        const currentHistory = Array.isArray(item.passHistory) ? item.passHistory : [];
        patchPayload = {
          lastPassedAt: passedAtIso,
          passHistory: [...currentHistory, passedAtIso].slice(-100),
        };

        return {
          ...item,
          ...patchPayload,
        };
      });

      return next;
    });

    if (!patchPayload) {
      return;
    }

    try {
      await patchUserApi(userId, patchPayload);
    } catch (error) {
      console.error('Entry time saqlashda xato:', error);
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      let modelOk = false;
      try {
        setStatus('Modellar yuklanmoqda... (15-40 soniya)');
        const loadedFrom = await loadModels();
        modelOk = true;
        setStatus(`Modellar tayyor (${loadedFrom}). O'quvchilar ro'yxati yuklanmoqda...`);
        await fetchUsers();
      } catch (error) {
        console.error(error);
        setStatus('Xato: model yoki users yuklanmadi. json-serverni tekshiring.');
        setWarning('');
      } finally {
        modelReadyRef.current = modelOk;
        setIsBootstrapping(false);
      }
    };

    boot();
  }, [fetchUsers, loadModels]);

  useEffect(() => {
    return () => {
      scanActiveRef.current = false;
      modelReadyRef.current = false;
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const detectAndMatch = useCallback(async () => {
    if (!modelReadyRef.current || !matcher) {
      return;
    }

    const video = webcamRef.current?.video;
    if (!video || video.readyState < 2) {
      return;
    }

    const detections = await faceapi
      .detectAllFaces(video, DETECTOR_OPTIONS)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth || 720, height: video.videoHeight || 560 };
    faceapi.matchDimensions(canvas, displaySize);

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const resizedDetections = detections.length ? faceapi.resizeResults(detections, displaySize) : [];

    if (!resizedDetections.length) {
      setMatchedStudent(null);
      setRecognizedAt(null);
      setStatus('Yuz topilmadi, kameraga qarang.');
      return;
    }

    faceapi.draw.drawDetections(canvas, resizedDetections);

    const now = new Date();
    let anyKnown = false;
    let anyAccepted = false;

    for (const item of resizedDetections) {
      if (!item.descriptor || item.descriptor.length !== DESCRIPTOR_LENGTH) {
        continue;
      }

      const bestMatch = matcher.findBestMatch(item.descriptor);

      if (bestMatch.label === 'unknown' || bestMatch.distance >= FACE_MATCH_THRESHOLD) {
        continue;
      }

      const userId = String(bestMatch.label);
      const user = usersById[userId];
      if (!user) {
        continue;
      }

      anyKnown = true;

      const prev = lastEntryByUserRef.current[userId] || 0;
      if (now.getTime() - prev < ENTRY_COOLDOWN_MS) {
        continue;
      }

      anyAccepted = true;
      lastEntryByUserRef.current[userId] = now.getTime();

      const displayName = `${user.name} (${user.class})`;
      setMatchedStudent(displayName);
      setRecognizedAt(now);
      setStatus(`Kirish tasdiqlandi: ${displayName}`);

      const passedAtIso = now.toISOString();
      setEntryLogs((prevLogs) => [
        {
          id: `${userId}-${now.getTime()}`,
          userId,
          name: displayName,
          at: passedAtIso,
        },
        ...prevLogs,
      ].slice(0, 50));

      await patchUserEntryTime(userId, passedAtIso);
    }

    if (!anyKnown) {
      setMatchedStudent(null);
      setRecognizedAt(null);
      setStatus("Noma'lum user. Bazada topilmadi.");
      return;
    }

    if (!anyAccepted) {
      setStatus('User aniqlandi. Qayta tasdiqlash uchun biroz kuting...');
    }
  }, [matcher, patchUserEntryTime, usersById]);

  const handleVideoPlay = useCallback(() => {
    if (scanActiveRef.current) {
      return;
    }

    if (!modelReadyRef.current) {
      setStatus('Model hali yuklanyapti, biroz kuting...');
      return;
    }

    scanActiveRef.current = true;

    const loop = async () => {
      if (!scanActiveRef.current) {
        return;
      }

      try {
        await detectAndMatch();
      } catch (error) {
        console.error(error);
      }

      scanTimeoutRef.current = setTimeout(loop, 500);
    };

    loop();
  }, [detectAndMatch]);

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
    canvasRef,
    status,
    warning,
    users,
    matchedStudent,
    recognizedAt,
    entryLogs,
    isBootstrapping,
    videoConstraints,
    handleVideoPlay,
  };
}

