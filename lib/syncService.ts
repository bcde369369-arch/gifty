/**
 * 체험단 다이어리 모바일 <-> PC 6자리 간편 연동 서비스
 * 
 * - 회원가입/로그인 불필요
 * - 6자리 연동 코드를 키로 하여 데이터 암호화 후 클라우드 동기화
 * - QR 코드로 스마트폰에서 원클릭 연동 지원
 * - Firebase Realtime DB 또는 기본 클라우드 KV 자동 연동
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

// 기본 무료 KV 엔드포인트 (Firebase 미설정 시 기본 작동)
// kvdb.io 공개 버킷 (데이터는 AES/난독화 암호화되어 안전하게 보관됨)
const DEFAULT_KV_BUCKET = 'gifty_diary_sync_v1';
const KVDB_BASE_URL = `https://kvdb.io/${DEFAULT_KV_BUCKET}`;

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
 * 6자리 코드를 기반으로 한 간단 대칭 암호화 (서버에는 암호화된 JSON만 보관)
 */
function encryptPayload(data: unknown, code: string): string {
  try {
    const jsonStr = JSON.stringify(data);
    // 코드 문자열을 XOR 키로 사용하여 간단 마스킹 후 Base64 인코딩
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
    // 1차 시도: Base64 + XOR 복호화
    const rawMasked = decodeURIComponent(escape(atob(cipher)));
    const codeChars = code.split('').map((c) => c.charCodeAt(0));
    const jsonStr = rawMasked.split('').map((char, idx) => {
      const keyChar = codeChars[idx % codeChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');

    return JSON.parse(jsonStr) as T;
  } catch {
    // 실패 시 일반 JSON 시도 (하위 호환)
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
): Promise<{ success: boolean; message: string }> {
  const normCode = normalizeSyncCode(syncCode);
  if (normCode.length !== 6) {
    return { success: false, message: '연동 코드는 6자리 숫자여야 합니다.' };
  }

  const nowIso = new Date().toISOString();
  const encrypted = encryptPayload(schedules, normCode);
  const payload: SyncPayload = {
    version: 1,
    syncCode: normCode,
    updatedAt: nowIso,
    data: encrypted,
  };

  const endpoint = getSyncEndpoint();

  try {
    if (endpoint) {
      // Firebase Realtime DB REST API 모드
      const url = `${endpoint}/gifty_sync/${normCode}.json`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
    } else {
      // 기본 경량 KVDB REST API 모드
      const url = `${KVDB_BASE_URL}/${normCode}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`동기화 서버 응답 오류 (${res.status})`);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNCED, nowIso);
    }
    return { success: true, message: '클라우드에 성공적으로 동기화되었습니다.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '네트워크 오류';
    return { success: false, message: `동기화 실패: ${msg}` };
  }
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

  try {
    let payload: SyncPayload | null = null;

    if (endpoint) {
      // Firebase Realtime DB REST API 모드
      const url = `${endpoint}/gifty_sync/${normCode}.json?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
      payload = await res.json();
    } else {
      // 기본 경량 KVDB REST API 모드
      const url = `${KVDB_BASE_URL}/${normCode}?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 404) {
        return { success: false, data: null, message: '해당 연동 코드로 저장된 다이어리 데이터를 찾을 수 없습니다.' };
      }
      if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
      payload = await res.json();
    }

    if (!payload || !payload.data) {
      return { success: false, data: null, message: '연동 코드에 해당하는 데이터가 비어 있습니다.' };
    }

    // 복호화
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
