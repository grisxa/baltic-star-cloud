<template>
  <el-submenu :index="rootIndex">
    <template slot="title">
      <i class="el-icon-chat-line-round"></i>
      <span>{{ $t('LocaleSwitcher.language') }}</span>
    </template>
    <el-menu-item v-for="item in options" class="language"
                  @click="switchLocale"
                  :key="item.value"
                  :index="item.value">
      <i class="el-icon-check selected" v-if="item.value === locale"></i>
      {{ item.label }}
    </el-menu-item>
  </el-submenu>
</template>

<script lang="ts">
import languages from '@/locales/languages.json';
import SetLocaleMutation from '@/store/models/setLocaleMutation';
import {Component, Prop, Vue} from 'vue-property-decorator';

type LanguageNames = { [key: string]: string };
type Language = { value: string, label: string };

@Component({
  computed: {
    locale(): string {
      const locale = this.$store.getters.getLocale;
      this.$i18n.locale = locale;
      return locale;
    },
  },
})
export default class LocaleSwitcher extends Vue {
  @Prop() private rootIndex?: string;
  locale?: string;
  locales: string[] = process.env.VUE_APP_I18N_SUPPORTED_LOCALES.split(',');
  // default locale of the build
  options: Language[] = [{
    value: process.env.VUE_APP_I18N_LOCALE,
    label: process.env.VUE_APP_I18N_LOCALE,
  }];

  // eslint-disable-next-line class-methods-use-this
  mounted(): void {
    const names = languages as LanguageNames;
    // replace locales with a list of supported
    this.options = this.locales.map((value: string) => ({label: names[value], value}));
  }

  switchLocale(item: { index: string }): void {
    if (this.locale !== item.index) {
      this.$store.commit(new SetLocaleMutation(item.index));
    }
  }
}

Vue.component('app-locale-switcher', LocaleSwitcher);
</script>

<style scoped lang="scss">
@include element-menu-item;
</style>
