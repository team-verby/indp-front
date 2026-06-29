-- =====================================================================
-- 매장 삭제 스크립트 (운영 indp_prod)
-- 대상: '밀키 현대 GRC점', '일상의아도', '서울볼더스 선유', '서울볼더스 클라이밍 목동점'
--
-- 실행 방법:
--   1) STEP 0 의 SELECT 먼저 실행 → 정확히 4행 나오는지 확인
--   2) START TRANSACTION ~ 마지막 SELECT 까지 실행
--   3) 결과 확인 후, 이상 없으면 COMMIT;  / 이상하면 ROLLBACK;
-- =====================================================================

-- ---------------------------------------------------------------------
-- STEP 0. 대상 확인 (먼저 단독 실행 — 4행이어야 함)
-- ---------------------------------------------------------------------
SELECT store_id, name, owner_id, playlist_id, store_music_id, store_apply_id
FROM store
WHERE name IN ('밀키 현대 GRC점', '일상의아도', '서울볼더스 선유', '서울볼더스 클라이밍 목동점');


-- ---------------------------------------------------------------------
-- STEP 1. 트랜잭션 시작 + 대상 id 임시 보관
-- ---------------------------------------------------------------------
START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS _del_store;
CREATE TEMPORARY TABLE _del_store AS
SELECT store_id, playlist_id, store_music_id, owner_id, store_apply_id
FROM store
WHERE name IN ('밀키 현대 GRC점', '일상의아도', '서울볼더스 선유', '서울볼더스 클라이밍 목동점');

-- ---------------------------------------------------------------------
-- STEP 2. 자식 → 본체 순서로 삭제 (FK 안전)
-- ---------------------------------------------------------------------

-- 2-1) playlist_song : 이 매장 플레이리스트의 곡 + 이 매장 추천곡을 참조하는 곡
DELETE FROM playlist_song
WHERE playlist_id IN (SELECT playlist_id FROM _del_store);

DELETE FROM playlist_song
WHERE song_recommendation_id IN (
  SELECT song_recommendation_id FROM song_recommendation
  WHERE store_id IN (SELECT store_id FROM _del_store)
);

-- 2-2) song_recommendation (store_id 참조). 연결된 payment 행은 보존(미연결 상태로 남김)
DELETE FROM song_recommendation
WHERE store_id IN (SELECT store_id FROM _del_store);

-- 2-3) 예약/고정 플레이리스트
DELETE FROM scheduled_playlist
WHERE store_id IN (SELECT store_id FROM _del_store);

DELETE FROM fixed_playlist_song
WHERE store_id IN (SELECT store_id FROM _del_store);

-- 2-4) 구독 (payment 행은 보존 — 결제/회계 기록)
DELETE FROM store_subscription
WHERE store_id IN (SELECT store_id FROM _del_store);

-- 2-5) 매장 부속 정보
DELETE FROM store_vibe
WHERE store_id IN (SELECT store_id FROM _del_store);

DELETE FROM store_business_hour
WHERE store_id IN (SELECT store_id FROM _del_store);

DELETE FROM store_photo
WHERE store_id IN (SELECT store_id FROM _del_store);

-- 2-6) store 본체 (이제 아무도 참조하지 않음)
DELETE FROM store
WHERE store_id IN (SELECT store_id FROM _del_store);

-- 2-7) 매장 전용 satellite : playlist
DELETE FROM playlist
WHERE playlist_id IN (SELECT playlist_id FROM _del_store);

-- 2-8) 매장 전용 satellite : store_music + 자식
DELETE FROM play_method
WHERE store_music_id IN (SELECT store_music_id FROM _del_store);

DELETE FROM music_genre
WHERE store_music_id IN (SELECT store_music_id FROM _del_store);

DELETE FROM store_music_time_preference
WHERE store_music_id IN (SELECT store_music_id FROM _del_store);

DELETE FROM store_music
WHERE store_music_id IN (SELECT store_music_id FROM _del_store);

-- 2-9) 입점 신청 기록
DELETE FROM store_apply
WHERE store_apply_id IN (SELECT store_apply_id FROM _del_store);

-- ---------------------------------------------------------------------
-- 2-10) 점주 계정 삭제
--   단, 삭제 대상 외 다른 매장을 아직 소유한 점주는 제외(FK 안전)
-- ---------------------------------------------------------------------
DELETE FROM owner
WHERE owner_id IN (SELECT owner_id FROM _del_store)
  AND owner_id NOT IN (SELECT owner_id FROM store WHERE owner_id IS NOT NULL);


-- ---------------------------------------------------------------------
-- STEP 3. 검증 — 아래가 모두 0 이어야 정상
-- ---------------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM store        WHERE store_id    IN (SELECT store_id        FROM _del_store)) AS store_left,
  (SELECT COUNT(*) FROM store_vibe   WHERE store_id    IN (SELECT store_id        FROM _del_store)) AS vibe_left,
  (SELECT COUNT(*) FROM store_photo  WHERE store_id    IN (SELECT store_id        FROM _del_store)) AS photo_left,
  (SELECT COUNT(*) FROM store_business_hour WHERE store_id IN (SELECT store_id    FROM _del_store)) AS hour_left,
  (SELECT COUNT(*) FROM store_subscription  WHERE store_id IN (SELECT store_id    FROM _del_store)) AS sub_left,
  (SELECT COUNT(*) FROM playlist     WHERE playlist_id IN (SELECT playlist_id     FROM _del_store)) AS playlist_left,
  (SELECT COUNT(*) FROM store_music  WHERE store_music_id IN (SELECT store_music_id FROM _del_store)) AS music_left,
  (SELECT COUNT(*) FROM owner         WHERE owner_id    IN (SELECT owner_id        FROM _del_store)) AS owner_left;

DROP TEMPORARY TABLE IF EXISTS _del_store;

-- ---------------------------------------------------------------------
-- STEP 4. 위 결과가 모두 0 이면:
--   COMMIT;
-- 이상하면:
--   ROLLBACK;
-- ---------------------------------------------------------------------
