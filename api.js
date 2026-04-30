const BASE_URL = 'http://16.184.46.185';

async function apiFetch(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + path, opts);
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

function getOwnerToken() { return localStorage.getItem('ownerToken'); }
function setOwnerToken(t) { localStorage.setItem('ownerToken', t); }
function clearOwnerToken() { localStorage.removeItem('ownerToken'); }
function getOwnerStoreId() { return localStorage.getItem('ownerStoreId'); }
function setOwnerStoreId(id) { localStorage.setItem('ownerStoreId', String(id)); }

// 모든 페이지 네비게이션 로그인 상태 동기화
function updateNavAuth() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;
  if (getOwnerToken()) {
    navActions.innerHTML = `
      <a href="index.html" class="nav-login" onclick="clearOwnerToken()">로그아웃</a>
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

document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
  initMobileNav();

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
