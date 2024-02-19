<template>
  <div class="wrap">
    <header id="header">
      <h1 class="logo">
        <a href="/">
          <img src="/images/logo.png" alt="VERBY 로고" />
        </a>
      </h1>
      <nav class="nav">
        <h2 class="hidden">메인 네비게이션</h2>
        <ul class="menus">
          <li><NuxtLink to="/">SERVICE</NuxtLink></li>
          <li><NuxtLink to="/playlist">PLAYLIST</NuxtLink></li>
          <li><NuxtLink to="/about">ABOUT</NuxtLink></li>
          <li><NuxtLink to="/contact">CONTACT</NuxtLink></li>
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
    <!-- <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer> -->
  </div>
</template>

<script>
export default {
  name: "DefaultLayout",
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/",
        },
        {
          icon: "mdi-chart-bubble",
          title: "Inspire",
          to: "/inspire",
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Vuetify.js",
    };
  },
};
</script>
