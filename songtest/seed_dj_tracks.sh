#!/usr/bin/env bash
# DJ 트랙 일괄 시드: songtest/testN 폴더의 mp3 → prod 백엔드 API로 업로드+등록
# 흐름(계정별): 로그인 → (곡마다) ffprobe로 길이 추출 → presigned PUT URL 발급
#               → S3 직접 PUT 업로드 → /register 로 메타데이터 등록
# (bash 3.2 호환 — 연관배열 미사용)
#
# 사용법:
#   DRY_RUN=1 ./seed_dj_tracks.sh          # ffprobe/매핑만 출력, 네트워크 호출 없음
#   PASSWORD='공통비번' ./seed_dj_tracks.sh # 5계정 비번이 같을 때
#   또는 PW_test1=.. PW_test2=.. ... 로 계정별 지정
# 계정: test1=creator2 .. test5=creator6, 이메일=<folder>@gmail.com
#
# 토글(기본 둘 다 1): DO_TRACKS=1 곡 업로드, DO_THUMBS=1 프로필 썸네일 업로드
#   - 트랙은 재실행 시 중복 등록되므로, 썸네일만 다시 올릴 땐 DO_TRACKS=0 으로.
#   - 썸네일: 각 폴더의 cover.*/thumb.* (jpg/jpeg/png/webp) 1장을 PATCH /api/dj/profile

API="${API:-https://api.indpmusic.co.kr}"
DRY_RUN="${DRY_RUN:-0}"
DO_TRACKS="${DO_TRACKS:-1}"
DO_THUMBS="${DO_THUMBS:-1}"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
FOLDERS="test1 test2 test3 test4 test5"

secs_to_dur() { printf '%d:%02d' $(($1/60)) $(($1%60)); }

login() { # $1=email $2=password -> echoes accessToken
  curl -s -X POST "$API/api/auth/login" -H 'Content-Type: application/json' \
    -d "{\"loginId\":\"$1\",\"password\":\"$2\"}" \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p'
}

total_ok=0; total_fail=0
for folder in $FOLDERS; do
  dir="$BASE_DIR/$folder"
  [ -d "$dir" ] || { echo "!! $dir 없음, 건너뜀"; continue; }
  email="${folder}@gmail.com"
  eval "pw=\"\${PW_${folder}:-\${PASSWORD:-}}\""

  echo "================ $folder ($email) ================"
  token=""
  if [ "$DRY_RUN" != "1" ]; then
    [ -n "$pw" ] || { echo "!! 비밀번호 미지정(PW_${folder} 또는 PASSWORD), 건너뜀"; continue; }
    token="$(login "$email" "$pw")"
    [ -n "$token" ] || { echo "!! 로그인 실패, 건너뜀"; continue; }
    echo "로그인 OK"
  fi

  # ----- 프로필 썸네일 -----
  if [ "$DO_THUMBS" = "1" ]; then
    cover=""
    for c in "$dir"/cover.jpg "$dir"/cover.jpeg "$dir"/cover.png "$dir"/cover.webp \
             "$dir"/thumb.jpg "$dir"/thumb.jpeg "$dir"/thumb.png "$dir"/thumb.webp; do
      [ -e "$c" ] && { cover="$c"; break; }
    done
    if [ -n "$cover" ]; then
      if [ "$DRY_RUN" = "1" ]; then
        echo "  [dry] 썸네일: $(basename "$cover")"
      else
        # 업로드 키는 image/<원본파일명> 이므로 계정별 고유 파일명 지정(미지정 시 cover.png 충돌→전부 동일 이미지)
        ext="${cover##*.}"
        tcode="$(curl -s -o /tmp/thumb_resp -w '%{http_code}' -X PATCH "$API/api/dj/profile" \
          -H "Authorization: Bearer $token" -F "thumbnail=@$cover;filename=dj_${folder}.${ext}")"
        if [ "$tcode" = "200" ]; then echo "  ✓ 썸네일: $(basename "$cover")"
        else echo "  ✗ 썸네일 실패(HTTP $tcode): $(cat /tmp/thumb_resp)"; fi
      fi
    else
      echo "  - 썸네일 없음(cover.*/thumb.* 미발견)"
    fi
  fi

  # ----- 트랙 -----
  if [ "$DO_TRACKS" != "1" ]; then continue; fi
  for f in "$dir"/*.mp3; do
    [ -e "$f" ] || continue
    name="$(basename "$f")"
    s="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null | cut -d. -f1)"
    [ -n "$s" ] || s=0
    dur="$(secs_to_dur "$s")"
    if [ "$DRY_RUN" = "1" ]; then
      printf '  [dry] %-45s %s (%ss)\n' "$name" "$dur" "$s"; continue
    fi

    fn_json="$(printf '%s' "$name" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')"
    resp="$(curl -s -X POST "$API/api/dj/tracks/upload-url" \
      -H "Authorization: Bearer $token" -H 'Content-Type: application/json' \
      -d "{\"filename\":$fn_json}")"
    upload_url="$(printf '%s' "$resp" | sed -n 's/.*"uploadUrl":"\([^"]*\)".*/\1/p')"
    stream_url="$(printf '%s' "$resp" | sed -n 's/.*"streamUrl":"\([^"]*\)".*/\1/p')"
    if [ -z "$upload_url" ] || [ -z "$stream_url" ]; then
      echo "  ✗ $name — upload-url 실패: $resp"; total_fail=$((total_fail+1)); continue
    fi

    # S3 직접 PUT (presigned는 헤더 미서명 → Content-Type 미지정으로 서명 불일치 회피)
    code="$(curl -s -o /dev/null -w '%{http_code}' -X PUT --upload-file "$f" "$upload_url")"
    if [ "$code" != "200" ]; then
      echo "  ✗ $name — S3 PUT 실패(HTTP $code)"; total_fail=$((total_fail+1)); continue
    fi

    body="$(STREAM="$stream_url" NAME="$name" DUR="$dur" SECS="$s" python3 -c '
import json,os
print(json.dumps({"filename":os.environ["NAME"],"streamUrl":os.environ["STREAM"],
                  "duration":os.environ["DUR"],"secs":int(os.environ["SECS"])}))')"
    rcode="$(curl -s -o /tmp/reg_resp -w '%{http_code}' -X POST "$API/api/dj/tracks/register" \
      -H "Authorization: Bearer $token" -H 'Content-Type: application/json' -d "$body")"
    if [ "$rcode" = "201" ] || [ "$rcode" = "200" ]; then
      printf '  ✓ %-45s %s\n' "$name" "$dur"; total_ok=$((total_ok+1))
    else
      echo "  ✗ $name — register 실패(HTTP $rcode): $(cat /tmp/reg_resp)"; total_fail=$((total_fail+1))
    fi
  done
done
echo "================================================"
echo "완료: 성공 $total_ok / 실패 $total_fail"
