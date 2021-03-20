<template>
  <el-select v-model="locale" :placeholder="$t('LocaleSwitcher.language')" @change="switchLocale">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

const languages: { [key: string]: string } = {
  en: 'English',
  ru: 'Русский',
};

@Component
export default class LocaleSwitcher extends Vue {
  locales: string[] = process.env.VUE_APP_I18N_SUPPORTED_LOCALES.split(',');
  options: { value: string, label: string }[] = [];
  locale = process.env.VUE_APP_I18N_LOCALE;

  mounted(): void {
    this.options = this.locales.map((item: string) => ({value: item, label: languages[item]}));
  }

  switchLocale(): void {
    if (this.$i18n.locale !== this.locale) {
      this.$i18n.locale = this.locale;
    }
  }
}

Vue.component('app-locale-switcher', LocaleSwitcher);
</script>

<style scoped>
/* don't emphasize the selection */
.el-select-dropdown__item.selected {
  font-weight: normal;
}
</style>
