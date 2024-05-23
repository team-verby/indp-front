<template>
  <div class="wrap">
    <header id="header" :class="gnbHoverState ? 'on' : ''">
      <h1 class="logo">
        <NuxtLink
          to="/"
          @mouseover.native="gnbHoverState = true"
          @mouseleave.native="gnbHoverState = false"
        >
          <img src="/images/logo.png" alt="VERBY 로고" />
        </NuxtLink>
      </h1>
      <nav class="nav">
        <h2 class="hidden">메인 네비게이션</h2>
        <ul class="menus">
          <li>
            <NuxtLink
              to="/"
              @mouseover.native="gnbHoverState = true"
              @mouseleave.native="gnbHoverState = false"
              >SERVICE</NuxtLink
            >
          </li>
          <li>
            <NuxtLink
              to="/playlist"
              @mouseover.native="gnbHoverState = true"
              @mouseleave.native="gnbHoverState = false"
              >PLAYLIST</NuxtLink
            >
          </li>
          <li>
            <NuxtLink
              to="/about"
              @mouseover.native="gnbHoverState = true"
              @mouseleave.native="gnbHoverState = false"
              >ABOUT</NuxtLink
            >
          </li>
          <li>
            <NuxtLink
              to="/contact"
              @mouseover.native="gnbHoverState = true"
              @mouseleave.native="gnbHoverState = false"
              >CONTACT</NuxtLink
            >
          </li>
        </ul>
      </nav>
    </header>
    <section id="container">
      <Nuxt />
    </section>
    <footer>
      <div class="logo">
        <img src="/images/logo.png" alt="VERBY 로고" /><span class="hidden"
          >VERBY</span
        >
      </div>
      <div class="footer__content">
        <p class="footer__title">버비컴퍼니</p>
        <ul>
          <li class="footer__text-col2">
            <div>
              <span>대표:</span>
              <span class="footer__text">박완</span>
            </div>
            <div>
              <span>사업자 등록번호:</span>
              <span class="footer__text">123-45-67890</span>
            </div>
          </li>
          <li>
            <span>주소:</span>
            <span class="footer__text"
              >03628 서울특별시 서대문구 통일로 484 서대문구창업지원센터 321호
              버비컴퍼니</span
            >
          </li>
          <li>
            <span>고객 문의:</span>
            <span class="footer__text">verbykorea@gmail.com</span>
          </li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "layout",
  data() {
    return {
      gnbHoverState: false,
    };
  },
  methods: {},
};
</script>
