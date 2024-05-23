import colors from "vuetify/es5/util/colors";
export default {
  ssr: false,
  server: {
    port: 3000,
    host: "0.0.0.0",
  },

  head: {
    titleTemplate: "VERBY",
    title: "VERBY",
    htmlAttrs: {
      lang: "ko",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "인디펜던트 뮤직은 공간 음악 큐레이팅 서비스입니다.",
      },
      { name: "author", content: "VERBY" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [
      {
        rel: "stylesheet",
        type: "text/css",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
      },
    ],
  },

  css: ["@/assets/scss/global.scss"],

  components: true,
  buildModules: [
    "@nuxtjs/vuetify",
    ["@nuxtjs/dotenv", { filename: `.env.${process.env.NODE_ENV}` }],
  ],

  modules: ["@nuxtjs/axios", "@nuxtjs/proxy"],
  axios: {
    credentials: true,
    proxy: process.env.NODE_ENV === "production" ? false : true,
  },
  proxy: {
    "/api/": {
      target: "https://api.verby.co.kr/",
      changeOrigin: true,
    },
  },

  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },
};
