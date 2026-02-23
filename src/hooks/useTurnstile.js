import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  DESCRIPTOR_LENGTH,
  ENTRY_COOLDOWN_MS,
  FACE_MATCH_THRESHOLD,
  MAX_ENTRY_LOGS,
  MAX_PASS_HISTORY,
  PATCH_FLUSH_INTERVAL_MS,
  SCAN_INTERVAL_MS,
} from '../lib/turnstile/constants';
import { buildDescriptors } from '../lib/turnstile/descriptors';
import { DETECTOR_OPTIONS, loadFaceModelsOnce } from '../lib/turnstile/faceEngine';
import { fetchUsersApi, patchUserApi } from '../lib/turnstile/usersApi';

function isSameLocalDay(isoDate, nowDate) {
  if (!isoDate) {
    return false;
  }

  const date = new Date(isoDate);
  return (
    date.getFullYear() === nowDate.getFullYear() &&
    date.getMonth() === nowDate.getMonth() &&
    date.getDate() === nowDate.getDate()
  );
}

export function useTurnstile() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const scanActiveRef = useRef(false);
  const modelReadyRef = useRef(false);
  const lastEntryByUserRef = useRef({});
  const pendingPatchRef = useRef(new Map());
  const patchFlushTimeoutRef = useRef(null);
  const lastUnknownMarkRef = useRef(0);

  const [status, setStatus] = useState('Modellar yuklanmoqda...');
  const [warning, setWarning] = useState('');
  const [users, setUsers] = useState([]);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [recognizedAt, setRecognizedAt] = useState(null);
  const [entryLogs, setEntryLogs] = useState([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [unknownAttempts, setUnknownAttempts] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const setStatusSafe = useCallback((nextValue) => {
    setStatus((prev) => (prev === nextValue ? prev : nextValue));
  }, []);

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

  const stats = useMemo(() => {
    const now = new Date();
    const uniqueUsers = new Set(entryLogs.map((item) => item.userId)).size;
    const passedToday = users.filter((user) => isSameLocalDay(user.lastPassedAt, now)).length;

    return {
      totalUsers: users.length,
      validDescriptors: labeledDescriptors.length,
      invalidDescriptors: Math.max(users.length - labeledDescriptors.length, 0),
      sessionEntries: entryLogs.length,
      uniqueSessionUsers: uniqueUsers,
      passedToday,
      unknownAttempts,
      lastSyncAt,
      scanState: isScanning ? 'Faol' : 'Pauza',
    };
  }, [entryLogs, isScanning, labeledDescriptors.length, lastSyncAt, unknownAttempts, users]);

  const topUsers = useMemo(() => {
    return [...users]
      .map((user) => ({
        id: String(user.id),
        name: user.name,
        className: user.class,
        totalPasses: Array.isArray(user.passHistory) ? user.passHistory.length : 0,
        lastPassedAt: user.lastPassedAt || null,
      }))
      .sort((a, b) => b.totalPasses - a.totalPasses)
      .slice(0, 5);
  }, [users]);

  const flushPendingPatches = useCallback(async () => {
    patchFlushTimeoutRef.current = null;

    const entries = Array.from(pendingPatchRef.current.entries());
    if (!entries.length) {
      return;
    }

    pendingPatchRef.current.clear();

    const results = await Promise.allSettled(
      entries.map(([userId, payload]) => patchUserApi(userId, payload))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const [userId, payload] = entries[index];
        pendingPatchRef.current.set(userId, payload);
      }
    });

    if (pendingPatchRef.current.size > 0 && !patchFlushTimeoutRef.current) {
      patchFlushTimeoutRef.current = setTimeout(flushPendingPatches, PATCH_FLUSH_INTERVAL_MS);
    }
  }, []);

  const schedulePatchFlush = useCallback(() => {
    if (patchFlushTimeoutRef.current) {
      return;
    }

    patchFlushTimeoutRef.current = setTimeout(flushPendingPatches, PATCH_FLUSH_INTERVAL_MS);
  }, [flushPendingPatches]);

  const fetchUsers = useCallback(async () => {
    const list = await fetchUsersApi();
    const { descriptors, skipped } = buildDescriptors(list);

    setUsers(list);
    setLabeledDescriptors(descriptors);
    setLastSyncAt(new Date().toISOString());

    if (descriptors.length === 0) {
      setStatusSafe("Tizimda yaroqli user yo'q. Avval register qiling.");
    } else {
      setStatusSafe("O'quvchilar yuklandi. Kameraga qarang.");
    }

    setWarning(
      skipped > 0
        ? `Ogohlantirish: ${skipped} ta user descriptor yaroqsiz, tanishda ishlatilmaydi.`
        : ''
    );
  }, [setStatusSafe]);

  const refreshUsers = useCallback(async () => {
    try {
      setStatusSafe("Userlar yangilanmoqda...");
      await fetchUsers();
      setStatusSafe("Userlar yangilandi.");
    } catch (error) {
      console.error(error);
      setStatusSafe("Yangilashda xato. json-server holatini tekshiring.");
    }
  }, [fetchUsers, setStatusSafe]);

  const clearEntryLogs = useCallback(() => {
    setEntryLogs([]);
    setStatusSafe("Session kirish loglari tozalandi.");
  }, [setStatusSafe]);

  const markUserPassed = useCallback(
    (userId, passedAtIso) => {
      let patchPayload = null;

      setUsers((prev) => {
        return prev.map((item) => {
          if (String(item.id) !== String(userId)) {
            return item;
          }

          const currentHistory = Array.isArray(item.passHistory) ? item.passHistory : [];
          patchPayload = {
            lastPassedAt: passedAtIso,
            passHistory: [...currentHistory, passedAtIso].slice(-MAX_PASS_HISTORY),
          };

          return {
            ...item,
            ...patchPayload,
          };
        });
      });

      if (patchPayload) {
        pendingPatchRef.current.set(String(userId), patchPayload);
        schedulePatchFlush();
      }
    },
    [schedulePatchFlush]
  );

  useEffect(() => {
    const boot = async () => {
      let modelOk = false;

      try {
        setStatusSafe('Modellar yuklanmoqda... (15-40 soniya)');
        const loadedFrom = await loadFaceModelsOnce();
        modelOk = true;

        setStatusSafe(`Modellar tayyor (${loadedFrom}). O'quvchilar ro'yxati yuklanmoqda...`);
        await fetchUsers();
      } catch (error) {
        console.error(error);
        setStatusSafe('Xato: model yoki users yuklanmadi. json-serverni tekshiring.');
        setWarning('');
      } finally {
        modelReadyRef.current = modelOk;
        setIsBootstrapping(false);
      }
    };

    boot();
  }, [fetchUsers, setStatusSafe]);

  useEffect(() => {
    const pendingPatchMap = pendingPatchRef.current;

    return () => {
      scanActiveRef.current = false;
      setIsScanning(false);
      modelReadyRef.current = false;

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      if (patchFlushTimeoutRef.current) {
        clearTimeout(patchFlushTimeoutRef.current);
      }

      const pendingEntries = Array.from(pendingPatchMap.entries());
      pendingPatchMap.clear();

      if (pendingEntries.length > 0) {
        Promise.allSettled(
          pendingEntries.map(([userId, payload]) => patchUserApi(userId, payload))
        ).catch(() => undefined);
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
    if (!canvas) {
      return;
    }

    const displaySize = { width: video.videoWidth || 720, height: video.videoHeight || 560 };
    faceapi.matchDimensions(canvas, displaySize);

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const resizedDetections = detections.length ? faceapi.resizeResults(detections, displaySize) : [];

    if (!resizedDetections.length) {
      setMatchedStudent(null);
      setRecognizedAt(null);
      setStatusSafe('Yuz topilmadi, kameraga qarang.');
      return;
    }

    faceapi.draw.drawDetections(canvas, resizedDetections);

    const now = new Date();
    const nowTs = now.getTime();
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
      if (nowTs - prev < ENTRY_COOLDOWN_MS) {
        continue;
      }

      anyAccepted = true;
      lastEntryByUserRef.current[userId] = nowTs;

      const displayName = `${user.name} (${user.class})`;
      setMatchedStudent(displayName);
      setRecognizedAt(now);
      setStatusSafe(`Kirish tasdiqlandi: ${displayName}`);

      const passedAtIso = now.toISOString();
      setEntryLogs((prevLogs) => {
        return [
          {
            id: `${userId}-${nowTs}`,
            userId,
            name: displayName,
            at: passedAtIso,
          },
          ...prevLogs,
        ].slice(0, MAX_ENTRY_LOGS);
      });

      markUserPassed(userId, passedAtIso);
    }

    if (!anyKnown) {
      setMatchedStudent(null);
      setRecognizedAt(null);
      setStatusSafe("Noma'lum user. Bazada topilmadi.");

      if (nowTs - lastUnknownMarkRef.current > 2000) {
        lastUnknownMarkRef.current = nowTs;
        setUnknownAttempts((prev) => prev + 1);
      }

      return;
    }

    if (!anyAccepted) {
      setStatusSafe('User aniqlandi. Qayta tasdiqlash uchun biroz kuting...');
    }
  }, [markUserPassed, matcher, setStatusSafe, usersById]);

  const startScanning = useCallback(() => {
    if (scanActiveRef.current || !modelReadyRef.current) {
      return;
    }

    scanActiveRef.current = true;
    setIsScanning(true);

    const loop = async () => {
      if (!scanActiveRef.current) {
        return;
      }

      try {
        await detectAndMatch();
      } catch (error) {
        console.error(error);
      }

      scanTimeoutRef.current = setTimeout(loop, SCAN_INTERVAL_MS);
    };

    loop();
  }, [detectAndMatch]);

  const stopScanning = useCallback(() => {
    scanActiveRef.current = false;
    setIsScanning(false);

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    setStatusSafe("Skaner pauza holatiga o'tdi.");
  }, [setStatusSafe]);

  const toggleScanning = useCallback(() => {
    if (!modelReadyRef.current) {
      setStatusSafe('Model hali tayyor emas.');
      return;
    }

    if (scanActiveRef.current) {
      stopScanning();
    } else {
      startScanning();
      setStatusSafe('Skaner qayta ishga tushdi.');
    }
  }, [setStatusSafe, startScanning, stopScanning]);

  const handleVideoPlay = useCallback(() => {
    if (!modelReadyRef.current) {
      setStatusSafe('Model hali yuklanyapti, biroz kuting...');
      return;
    }

    if (!scanActiveRef.current) {
      startScanning();
    }
  }, [setStatusSafe, startScanning]);

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
    topUsers,
    stats,
    isScanning,
    isBootstrapping,
    videoConstraints,
    handleVideoPlay,
    toggleScanning,
    refreshUsers,
    clearEntryLogs,
  };
}
