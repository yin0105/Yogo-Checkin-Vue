<template>
  <div id="app" :style="appStyles">
    <div class="min-h-screen bg-white sm:bg-transparent"
         :class="{ content: true, mr2: client.settings && client.settings.checkin_show_alphabet_scrollbar }">
      <header class="pt-8 pb-8">
        <img :src="Imgix(client.logo.filename)" alt="" class="logo-svg"
             v-if="client && client.logo && client.logo.filename.slice(-4) === '.svg'">
        <img :src="Imgix(client.logo.filename, {w:400,h:200})" alt="" class="logo-bitmap"
             v-else-if="client && client.logo">
      </header>
      <router-view/>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';

import Imgix from '@/services/Imgix';

export default {
  mixins: [Imgix],
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  data() {
    return {
      appStyles: {},
    };
  },
  async created() {
    await this.$store.dispatch('init');

    let bodyFontFamily;

    switch (this.client.settings.theme_font_type) {
      case 'google_web_font':
        const googleFontHeadTag = document.createElement('link');
        googleFontHeadTag.setAttribute('rel', 'stylesheet');
        googleFontHeadTag.setAttribute('type', 'text/css');
        googleFontHeadTag.setAttribute('href',
          'https://fonts.googleapis.com/css?family=' + this.client.settings.theme_google_web_font.replace(
          / /g,
          '+'));
        document.head.appendChild(googleFontHeadTag);
        bodyFontFamily = "'" + this.client.settings.theme_google_web_font + "'";
        break;
      case 'custom':
        const customFontCssTag = document.createElement('link');
        customFontCssTag.setAttribute('rel', 'stylesheet');
        customFontCssTag.setAttribute('type', 'text/css');
        customFontCssTag.setAttribute('href', this.client.settings.theme_custom_font_stylesheet_url);
        document.head.appendChild(customFontCssTag);
        bodyFontFamily = this.client.settings.theme_font_family;
        break;
    }

    this.appStyles = {
      'font-family': `${bodyFontFamily}, Arial, sans-serif`,
      'background-color': this.client.settings.theme_background_color,
    };

  },
};
</script>

<style lang="scss" scoped>

  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  img.logo-svg {
    width: 300px;
    height: 80px;
    margin: 0 auto;
  }

  img.logo-bitmap {
    width: 80px;
    height: auto;
    margin: 0 auto;
  }

</style>
