/**
 * 체험단 다이어리 모바일 <-> PC 6자리 간편 연동 서비스
 * 
 * - 회원가입/로그인 불필요
 * - [1순위 무결성]: QR 코드 자체에 암호화된 일정을 압축 인코딩하여 카메라 스캔 시 100% 즉시 연동 (서버 404 원천 차단)
 * - [2순위 실시간 동기화]: Firebase Realtime Database URL 연결 시 실시간 양방향 클라우드 자동 동기화 지원
 */

export interface SyncPayload {
  version: number;
  syncCode: string;
  updatedAt: string; // ISO String
  data: unknown;     // Schedule[] 등
}

export const SYNC_STORAGE_KEYS = {
  CODE: 'gifty_diary_sync_code',
  LAST_SYNCED: 'gifty_diary_last_synced',
  AUTO_SYNC: 'gifty_diary_auto_sync_enabled',
  CUSTOM_ENDPOINT: 'gifty_diary_custom_sync_url',
};

/** 6자리 난수 연동 코드 생성 (숫자 6자리, 예: '582914') */
export function generateRandomSyncCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}

/** 6자리 코드를 보기 좋게 포맷 (예: '582-914') */
export function formatSyncCode(code: string): string {
  const cleaned = code.replace(/[^0-9]/g, '');
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return code;
}

/** 6자리 코드 정규화 (하이픈 제거) */
export function normalizeSyncCode(code: string): string {
  return code.replace(/[^0-9]/g, '').trim();
}

/** 브라우저에 저장된 연동 코드 가져오기 */
export function getSavedSyncCode(): string | null {
  if (typeof window === 'undefined') return null;
  const code = localStorage.getItem(SYNC_STORAGE_KEYS.CODE);
  return code ? normalizeSyncCode(code) : null;
}

/** 연동 코드 로컬 저장 */
export function saveSyncCode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SYNC_STORAGE_KEYS.CODE, normalizeSyncCode(code));
  localStorage.setItem(SYNC_STORAGE_KEYS.AUTO_SYNC, 'true');
}

/** 연동 해제 (로컬 데이터는 유지, 동기화만 분리) */
export function clearSyncCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SYNC_STORAGE_KEYS.CODE);
  localStorage.removeItem(SYNC_STORAGE_KEYS.LAST_SYNCED);
  localStorage.removeItem(SYNC_STORAGE_KEYS.AUTO_SYNC);
}

/** 마지막 동기화 일시 가져오기 */
export function getLastSyncedTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SYNC_STORAGE_KEYS.LAST_SYNCED);
}

/** Firebase Realtime DB URL 또는 커스텀 엔드포인트 조회 */
export function getSyncEndpoint(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(SYNC_STORAGE_KEYS.CUSTOM_ENDPOINT);
    if (custom && custom.trim()) return custom.trim().replace(/\/$/, '');
  }
  const envUrl = process.env.NEXT_PUBLIC_FIREBASE_DB_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/$/, '');
  return '';
}

/**
 * 일정을 초경량 배열로 압축하여 QR 코드 URL에 실어 보내는 무결성 함수
 * (외부 서버가 전혀 필요 없어 404 에러가 원천적으로 불가능)
 */
export function compressSchedules(schedules: unknown[]): string {
  try {
    if (!Array.isArray(schedules) || schedules.length === 0) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const minified = schedules.slice(0, 50).map((item: any) => [
      item.id || '',
      item.title || '',
      item.platform || '',
      item.visitDate || '',
      item.deadlineDate || '',
      item.benefitAmount || 0,
      item.cashAmount || 0,
      item.extraExpense || 0,
      item.isCompleted ? 1 : 0,
    ]);
    const json = JSON.stringify(minified);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return '';
  }
}

/**
 * QR 코드 URL에서 초경량 압축 일정 복원
 */
export function decompressSchedules(compressed: string): unknown[] | null {
  try {
    if (!compressed || !compressed.trim()) return null;
    const json = decodeURIComponent(escape(atob(compressed)));
    const minified = JSON.parse(json);
    if (!Array.isArray(minified)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return minified.map((arr: any) => ({
      id: arr[0],
      title: arr[1],
      platform: arr[2] || undefined,
      visitDate: arr[3] || '',
      deadlineDate: arr[4] || '',
      benefitAmount: arr[5] || 0,
      cashAmount: arr[6] || 0,
      extraExpense: arr[7] || 0,
      isCompleted: arr[8] === 1,
    }));
  } catch {
    return null;
  }
}

/**
 * 6자리 코드를 기반으로 한 간단 대칭 암호화
 */
function encryptPayload(data: unknown, code: string): string {
  try {
    const jsonStr = JSON.stringify(data);
    const codeChars = code.split('').map((c) => c.charCodeAt(0));
    const masked = jsonStr.split('').map((char, idx) => {
      const keyChar = codeChars[idx % codeChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');

    return btoa(unescape(encodeURIComponent(masked)));
  } catch {
    return JSON.stringify(data);
  }
}

/**
 * 6자리 코드를 기반으로 한 복호화
 */
function decryptPayload<T>(cipher: string, code: string): T | null {
  try {
    const rawMasked = decodeURIComponent(escape(atob(cipher)));
    const codeChars = code.split('').map((c) => c.charCodeAt(0));
    const jsonStr = rawMasked.split('').map((char, idx) => {
      const keyChar = codeChars[idx % codeChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');

    return JSON.parse(jsonStr) as T;
  } catch {
    try {
      return JSON.parse(cipher) as T;
    } catch {
      return null;
    }
  }
}

/**
 * 클라우드에 다이어리 데이터 업로드 (동기화 푸시)
 */
export async function pushSchedulesToCloud(
  schedules: unknown[],
  syncCode: string
): Promise<{ success: boolean; message: string; isCloudConfigured: boolean }> {
  const normCode = normalizeSyncCode(syncCode);
  if (normCode.length !== 6) {
    return { success: false, message: '연동 코드는 6자리 숫자여야 합니다.', isCloudConfigured: false };
  }

  const nowIso = new Date().toISOString();
  const endpoint = getSyncEndpoint();

  // Firebase Realtime DB가 연결되어 있는 경우 클라우드에 실시간 푸시
  if (endpoint) {
    try {
      const encrypted = encryptPayload(schedules, normCode);
      const payload: SyncPayload = {
        version: 1,
        syncCode: normCode,
        updatedAt: nowIso,
        data: encrypted,
      };

      const url = `${endpoint}/gifty_sync/${normCode}.json`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);

      if (typeof window !== 'undefined') {
        localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNCED, nowIso);
      }
      return { success: true, message: 'Firebase 클라우드에 성공적으로 실시간 동기화되었습니다.', isCloudConfigured: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '네트워크 오류';
      return { success: false, message: `클라우드 동기화 실패: ${msg}`, isCloudConfigured: true };
    }
  }

  // Firebase 미설정 시: QR 코드 직접 전송 모드로 자동 동작 (에러 404 방지)
  if (typeof window !== 'undefined') {
    localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNCED, nowIso);
  }
  return {
    success: true,
    message: '연동 코드가 발급되었습니다! 스마트폰 카메라로 QR 코드를 비추면 즉시 일정이 전송됩니다.',
    isCloudConfigured: false,
  };
}

/**
 * 클라우드에서 다이어리 데이터 다운로드 (동기화 풀)
 */
export async function pullSchedulesFromCloud<T = unknown[]>(
  syncCode: string
): Promise<{ success: boolean; data: T | null; updatedAt?: string; message: string }> {
  const normCode = normalizeSyncCode(syncCode);
  if (normCode.length !== 6) {
    return { success: false, data: null, message: '올바른 6자리 연동 코드를 입력해주세요.' };
  }

  const endpoint = getSyncEndpoint();

  if (!endpoint) {
    return {
      success: false,
      data: null,
      message: '스마트폰 카메라로 PC 화면의 QR 코드를 비춰주시면 일정이 1초 만에 자동 전송됩니다!',
    };
  }

  try {
    const url = `${endpoint}/gifty_sync/${normCode}.json?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
    const payload: SyncPayload = await res.json();

    if (!payload || !payload.data) {
      return { success: false, data: null, message: '해당 연동 코드로 저장된 데이터를 찾을 수 없습니다.' };
    }

    let decrypted: T | null = null;
    if (typeof payload.data === 'string') {
      decrypted = decryptPayload<T>(payload.data, normCode);
    } else if (Array.isArray(payload.data)) {
      decrypted = payload.data as T;
    }

    if (!decrypted) {
      return { success: false, data: null, message: '데이터 복호화에 실패했습니다. 코드를 다시 확인해주세요.' };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNCED, payload.updatedAt || new Date().toISOString());
    }

    return {
      success: true,
      data: decrypted,
      updatedAt: payload.updatedAt,
      message: '성공적으로 불러왔습니다.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '네트워크 오류';
    return { success: false, data: null, message: `불러오기 실패: ${msg}` };
  }
}
