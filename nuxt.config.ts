// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/style/main.scss";',
        },
      },
    },
  },
  modules: ["@nuxtjs/i18n", "@pinia/nuxt"],
  i18n: {
    locales: [
      {
        code: "en",
        // iso needed for each locale for SEO
        iso: "en-US",
        file: "en.json",
      },
      {
        code: "is",
        iso: "is-IS",
        file: "is.json",
      },
      {
        code: "se",
        iso: "se-SE",
        file: "se.json",
      },
    ],
    lazy: true,
    defaultLocale: "en",
    langDir: "locales",
    strategy: "prefix",
    // BaseURL Needed for SEO
    // Docs https://v8.i18n.nuxtjs.org/options/routing/#baseurl
    // baseUrl: 'https://my-nuxt-app.com'
    // Browser lang detection
    detectBrowserLanguage: {
      // useCookie: true,
      // cookieKey: 'i18n_redirected',
      redirectOn: "root",
      alwaysRedirect: true,
    },
  },
});
