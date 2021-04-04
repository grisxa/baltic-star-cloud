module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
  devServer: {
    progress: false,
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/globals.scss";
          @import "@/mixins.scss";
        `,
      },
    },
  },
};
