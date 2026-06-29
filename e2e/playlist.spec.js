/**
 * 섹션 3: DJ 공개 플레이리스트 (인증 불필요)
 * - 채널 목록 조회
 * - 채널 상세 조회
 */
import { test, expect } from '@playwright/test';

const BASE_API = 'https://dev-api.indpmusic.co.kr';

test.describe('DJ 공개 플레이리스트 섹션', () => {

  test('GET /api/dj/playlists — 채널 목록 반환', async ({ request }) => {
    const res = await request.get(`${BASE_API}/api/dj/playlists`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('playlists');
    expect(Array.isArray(body.playlists)).toBe(true);
  });

  test('GET /api/dj/playlists/{id} — 채널 상세 반환', async ({ request }) => {
    // 목록에서 첫 번째 채널 ID 획득
    const listRes = await request.get(`${BASE_API}/api/dj/playlists`);
    const { playlists } = await listRes.json();

    if (playlists.length === 0) {
      test.skip(true, '등록된 DJ 채널이 없습니다.');
      return;
    }

    const firstId = playlists[0].id;
    const detailRes = await request.get(`${BASE_API}/api/dj/playlists/${firstId}`);
    expect(detailRes.status()).toBe(200);

    const body = await detailRes.json();
    expect(body).toHaveProperty('id', firstId);
    expect(body).toHaveProperty('djName');
    expect(body).toHaveProperty('tracks');
    expect(Array.isArray(body.tracks)).toBe(true);
  });

  test('존재하지 않는 채널 ID — 404 반환', async ({ request }) => {
    const res = await request.get(`${BASE_API}/api/dj/playlists/99999`);
    expect(res.status()).toBe(404);
  });

  test('채널 목록 — isLive 필드 포함 확인', async ({ request }) => {
    const res = await request.get(`${BASE_API}/api/dj/playlists`);
    const { playlists } = await res.json();
    playlists.forEach(channel => {
      expect(channel).toHaveProperty('id');
      expect(channel).toHaveProperty('djName');
      expect(channel).toHaveProperty('isLive');
    });
  });

});
