const BASE_URL = 'https://dev-api.indpmusic.co.kr';

// JWT payload 디코딩 (서명 검증 없이 exp 클레임만 추출)
function parseJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 : null; // ms 단위 변환
  } catch(e) { return null; }
}

let _sessionWarnTimer = null;
let _sessionExpireTimer = null;
let _refreshPromise = null;

// 만료 5분 전 자동 silent refresh — 실패해도 경고 없이 401 retry에 위임
function scheduleSessionWarning(token) {
  clearTimeout(_sessionWarnTimer);
  clearTimeout(_sessionExpireTimer);
  const exp = parseJwtExp(token);
  if (!exp) return;
  const now = Date.now();
  const refreshAt = exp - 5 * 60 * 1000;

  if (refreshAt > now) {
    _sessionWarnTimer = setTimeout(() => {
      refreshAccessToken(); // 성공 시 새 타이머 자동 등록, 실패 시 다음 API 호출의 401 retry가 처리
    }, refreshAt - now);
  } else {
    // 이미 갱신 시점이 지났거나 만료된 경우 즉시 refresh 시도
    refreshAccessToken();
  }
  // 강제 로그아웃 타이머 없음 — refreshToken 유효 기간(30일) 동안 세션 유지
}

// 동시 호출 방지를 위해 Promise 공유
async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(BASE_URL + '/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error('refresh failed');
      const data = await res.json();
      setOwnerToken(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

async function apiFetch(method, path, body, token) {
  const doFetch = (t) => {
    const headers = { 'Content-Type': 'application/json' };
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(BASE_URL + path, opts);
  };

  let res = await doFetch(token);

  // 401 → refresh 후 1회 재시도
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error('세션이 만료되었습니다.');
    res = await doFetch(getOwnerToken());
  }

  if (!res.ok) {
    let msg = `API 오류 (${res.status})`;
    try { const d = await res.json(); console.error('[API 에러 응답]', JSON.stringify(d)); msg = d.message || msg; } catch(e) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

function getOwnerToken()    { return localStorage.getItem('ownerToken'); }
function getRefreshToken()  { return localStorage.getItem('ownerRefreshToken'); }
function setOwnerToken(accessToken, refreshToken) {
  localStorage.setItem('ownerToken', accessToken);
  if (refreshToken) localStorage.setItem('ownerRefreshToken', refreshToken);
  scheduleSessionWarning(accessToken);
}
function clearOwnerToken() {
  localStorage.removeItem('ownerToken');
  localStorage.removeItem('ownerRefreshToken');
  clearTimeout(_sessionWarnTimer);
  clearTimeout(_sessionExpireTimer);
}
function getOwnerStoreId() { return localStorage.getItem('ownerStoreId'); }
function setOwnerStoreId(id) { localStorage.setItem('ownerStoreId', String(id)); }

// Plan A 구독자 토큰
function getUserToken()  { return localStorage.getItem('userToken'); }
function setUserToken(accessToken, refreshToken) {
  localStorage.setItem('userToken', accessToken);
  if (refreshToken) localStorage.setItem('userRefreshToken', refreshToken);
}
function clearUserToken() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userRefreshToken');
  localStorage.removeItem('userEmail');
}

// 모든 페이지 네비게이션 로그인 상태 동기화
function updateNavAuth() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;
  if (localStorage.getItem('djToken')) {
    navActions.innerHTML = `
      <button onclick="(function(){['djToken','djName','djRefreshToken'].forEach(function(k){localStorage.removeItem(k)});location.href='index.html'})()" class="nav-login" style="background:none;border:none;cursor:pointer;font-family:inherit;font-size:inherit;">로그아웃</button>
      <a href="dj-dashboard.html" class="nav-cta-dark">DJ 대시보드</a>
    `;
    return;
  }
  if (getOwnerToken()) {
    navActions.innerHTML = `
      <a href="index.html" class="nav-login" onclick="clearOwnerToken()">로그아웃</a>
      <a href="mypage.html" class="nav-cta-dark">마이페이지</a>
    `;
  } else if (getUserToken()) {
    navActions.innerHTML = `
      <a href="index.html" class="nav-login" onclick="clearUserToken()">로그아웃</a>
      <a href="mypage.html" class="nav-cta-dark">마이페이지</a>
    `;
  } else {
    navActions.innerHTML = `
      <a href="login.html" class="nav-login">로그인</a>
      <a href="plan.html" class="nav-cta-blue">도입 문의</a>
    `;
  }
}

// 모바일 햄버거 메뉴 주입
function initMobileNav() {
  const navInner = document.querySelector('.nav-inner');
  if (!navInner || document.querySelector('.nav-hamburger')) return;
  if (window.innerWidth > 768) return; // PC에서는 생성 안 함

  // 햄버거 버튼
  const btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', '메뉴');
  btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  navInner.appendChild(btn);

  // 링크 목록 수집
  const links = Array.from(document.querySelectorAll('.nav-links li a')).map(a => ({ href: a.href, text: a.textContent.trim() }));
  const isLoggedIn = !!getOwnerToken();

  // 드로어 HTML
  const overlay = document.createElement('div');
  overlay.className = 'mobile-nav-overlay';
  overlay.innerHTML = `
    <div class="mobile-nav-drawer">
      <div class="mobile-nav-header">
        <img src="logo.png" alt="인디피 뮤직" />
        <button class="mobile-nav-close">✕</button>
      </div>
      <ul class="mobile-nav-links">
        ${links.map(l => `<li><a href="${l.href}">${l.text}</a></li>`).join('')}
      </ul>
      <div class="mobile-nav-actions">
        ${isLoggedIn
          ? `<a href="index.html" class="mobile-nav-login" id="m-logout">로그아웃</a>
             <a href="mypage.html" class="mobile-nav-cta-dark mobile-nav-cta">마이페이지</a>`
          : `<a href="login.html" class="mobile-nav-login">로그인</a>
             <a href="plan.html" class="mobile-nav-cta">도입 문의</a>`
        }
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // 로그아웃 처리
  const logoutBtn = overlay.querySelector('#m-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', clearOwnerToken);

  const drawer = overlay.querySelector('.mobile-nav-drawer');
  const open  = () => { overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = ''; };

  btn.addEventListener('click', open);
  overlay.addEventListener('click', e => { if (!drawer.contains(e.target)) close(); });
  overlay.querySelector('.mobile-nav-close').addEventListener('click', close);
}

// DJ 라이브 상태 관리
function setDjLive(on) {
  if (on) localStorage.setItem('djIsLive', '1');
  else    localStorage.removeItem('djIsLive');
}
function isDjLive() { return !!localStorage.getItem('djIsLive'); }

function initDjFloatingBar() {
  if (!localStorage.getItem('djToken') || !isDjLive()) return;
  // 대시보드 페이지 자체에서는 노출 안 함
  if (location.pathname.endsWith('dj-dashboard.html')) return;
  if (document.getElementById('dj-float-bar')) return;

  const style = document.createElement('style');
  style.textContent = `
    #dj-float-bar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 14px;
      background: #fff;
      border: 1.5px solid #bbf7d0;
      border-radius: 100px;
      padding: 10px 18px 10px 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.13);
      white-space: nowrap;
      animation: dj-bar-in .25s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes dj-bar-in {
      from { opacity:0; transform:translateX(-50%) translateY(16px); }
      to   { opacity:1; transform:translateX(-50%) translateY(0); }
    }
    #dj-float-bar .dj-fb-dot {
      width: 9px; height: 9px; border-radius: 50%;
      background: #16a34a;
      flex-shrink: 0;
      animation: dj-fb-pulse 2s infinite;
    }
    @keyframes dj-fb-pulse {
      0%  { box-shadow: 0 0 0 0 rgba(22,163,74,0.45); }
      70% { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
      100%{ box-shadow: 0 0 0 0 rgba(22,163,74,0); }
    }
    #dj-float-bar .dj-fb-label {
      font-size: 12px; font-weight: 800;
      color: #16a34a; letter-spacing: 0.08em;
    }
    #dj-float-bar .dj-fb-divider {
      width: 1px; height: 16px;
      background: #e5e7eb; flex-shrink: 0;
    }
    #dj-float-bar .dj-fb-name {
      font-size: 13px; font-weight: 700;
      color: #1b1b1d;
    }
    #dj-float-bar .dj-fb-link {
      font-size: 12px; font-weight: 700;
      color: #233eff; text-decoration: none;
      padding: 4px 10px;
      background: #eff2ff;
      border-radius: 100px;
    }
    #dj-float-bar .dj-fb-link:hover { background: #e0e5ff; }
    #dj-float-bar .dj-fb-stop {
      font-size: 12px; font-weight: 700;
      color: #e11d48;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 100px;
      padding: 4px 12px;
      cursor: pointer;
      font-family: inherit;
    }
    #dj-float-bar .dj-fb-stop:hover { background: #ffe4e6; }
    @media (max-width: 480px) {
      #dj-float-bar { bottom: 16px; padding: 9px 14px 9px 12px; gap: 10px; }
      #dj-float-bar .dj-fb-name { display: none; }
    }
  `;
  document.head.appendChild(style);

  const djName = localStorage.getItem('djName') || 'DJ';
  const bar = document.createElement('div');
  bar.id = 'dj-float-bar';
  bar.innerHTML = `
    <span class="dj-fb-dot"></span>
    <span class="dj-fb-label">ON AIR</span>
    <span class="dj-fb-divider"></span>
    <span class="dj-fb-name">${djName}</span>
    <a href="dj-dashboard.html" class="dj-fb-link">대시보드</a>
    <button class="dj-fb-stop" id="dj-fb-stop-btn">■ 방송 종료</button>
  `;
  document.body.appendChild(bar);

  document.getElementById('dj-fb-stop-btn').addEventListener('click', () => {
    if (!confirm('방송을 종료할까요?')) return;
    setDjLive(false);
    bar.remove();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 새로고침 후에도 만료 타이머/자동 refresh 복원
  const existingToken = getOwnerToken();
  if (existingToken) scheduleSessionWarning(existingToken);

  // 탭 동결 후 복귀 시 타이머 재등록 (모바일/Chrome Memory Saver 대응)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const token = getOwnerToken();
      if (token) scheduleSessionWarning(token);
    }
  });

  updateNavAuth();
  initMobileNav();
  initDjFloatingBar();

  // GNB 스크롤 스타일 전환
  const nav = document.querySelector('nav');
  if (nav) {
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) initMobileNav();
});
