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
        <p class="footer__text">주식회사 버비</p>
        <div>
          <ul>
            <li>
              <span>대표자</span>
              <span class="footer__text">박완</span>
            </li>
            <li>
              <span>사업자 등록번호</span>
              <span class="footer__text">123-45-67890</span>
            </li>
            <li>
              <span>이메일</span>
              <span class="footer__text">verbykorea@gmail.com</span>
            </li>
          </ul>
          <p class="footer__copyright">
            ⓒ2024 Verby.CO.,LTD. All rights reserved.
          </p>
        </div>
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
