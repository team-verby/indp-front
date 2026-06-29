# [백엔드 요청] 이미지 서빙(공개 접근) 미동작 — 매장/DJ 사진이 화면에 안 보임

작성일: 2026-06-16

## 1. 증상
- 매장 사진을 업로드하고 `store_photo.image_url`에 S3 URL을 넣었으나, 프론트(`<img src=...>`)에서 **이미지가 표시되지 않음**.
- 해당 S3 객체를 직접 GET 하면 **HTTP 403 (AccessDenied)**.

```
$ curl -I https://indp-app-storage.s3.ap-northeast-2.amazonaws.com/image/store21_43.jpg
HTTP/1.1 403 Forbidden   (application/xml, AccessDenied)
```

## 2. 원인
업로드 API가 객체를 **비공개**로 올리고, 버킷에도 **공개 읽기 정책/CDN이 없음**. 그런데 API는 인증 없이 접근해야 표시되는 **raw S3 URL**을 그대로 반환함.

- `global/image/ImageService.java` `upload()` — `PutObjectRequest`에 `public-read` ACL 미설정 → 객체가 비공개로 저장됨.
  ```java
  amazonS3.putObject(new PutObjectRequest(bucket, key, inputStream, objectMetadata)); // ACL 없음
  return amazonS3.getUrl(bucket, key).toString(); // 비공개 객체의 raw S3 URL 반환
  ```
- 버킷 `indp-app-storage` 에 `image/*` 공개 읽기 **버킷 정책 없음** (있으면 ACL 없어도 200이어야 하나 403).
- CloudFront 등 별도 공개 배포 경로도 없음(있어도 API가 S3 도메인 URL을 주므로 프론트는 여전히 403).

### 영향 범위
이미지 업로드 파이프라인 전체. 운영 DB에 실제 http 이미지 URL이 **단 1건도 없었음** = 운영에서 S3 업로드 이미지가 화면에 노출된 적이 한 번도 없는 상태. 매장 사진뿐 아니라 DJ 썸네일/오디오 등 동일 구조 모두 해당.

## 3. 권장 수정안 (택1 또는 조합)
1. **(간단) 업로드 시 public-read ACL 부여**
   ```java
   amazonS3.putObject(new PutObjectRequest(bucket, key, inputStream, objectMetadata)
       .withCannedAcl(CannedAccessControlList.PublicRead));
   ```
   단, 버킷의 **Block Public Access(ACL 차단)** 가 켜져 있으면 무효 → 2번 병행 필요.
2. **(권장) 버킷 정책으로 `image/*` 공개 읽기 허용** + BPA에서 정책 차단 해제
   ```json
   { "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject",
     "Resource": "arn:aws:s3:::indp-app-storage/image/*" }
   ```
3. **(정석) CloudFront(OAC) + 커스텀 도메인** 으로 서빙하고, `ImageService`가 **CDN URL**을 반환하도록 변경. 캐싱/보안 측면 최선.

> audio도 동일 이슈이면 `audio/*` 도 같은 정책 적용 검토.

## 4. 검증용으로 미리 넣어둔 데이터 (수정 후 바로 확인 가능)
- 객체 키: `image/store21_43.jpg` (이미 업로드됨, 1200×900, 4:3)
- DB: `store_photo` (store_id=21, 스모어사이트 노은점) `image_url` = 위 객체의 S3 URL, `is_main=1`
- 위 1~3 적용 후 해당 URL이 200으로 뜨면, 관리자 상세/점주 마이페이지에서 노은점 사진이 정상 표시됨.

## 5. 프론트/데이터 측 메모
- 프론트는 이미 `photoUrls[0]` / `image_url` 을 그대로 `<img src>` 로 사용 중 → 백엔드가 **접근 가능한 URL**만 반환하면 추가 프론트 작업 불필요.
- 관리자 대시보드에는 매장 사진 **업로드 UI가 없음**(표시만). 운영 중 사진 추가는 현재 수동(API 업로드 + DB insert)으로 처리 중.
