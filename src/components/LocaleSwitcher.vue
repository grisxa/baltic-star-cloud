<template>
  <el-submenu :index="rootIndex">
    <template slot="title">
      <i class="el-icon-chat-line-round"></i>
      <span>{{ $t('LocaleSwitcher.language') }}</span>
    </template>
    <el-menu-item v-for="item in options" class="language"
                  @click="switchLocale"
                  :key="item.value"
                  :index="item.value">{{ item.label }}
      <i class="el-icon-check selected" v-if="item.value === $i18n.locale"></i>
    </el-menu-item>
  </el-submenu>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

const languages: { [key: string]: string } = {
  en: 'English',
  ru: 'Русский',
};

@Component
export default class LocaleSwitcher extends Vue {
  @Prop() private rootIndex?: string;

  locales: string[] = process.env.VUE_APP_I18N_SUPPORTED_LOCALES.split(',');
  options: { value: string, label: string }[] = [];

  mounted(): void {
    this.options = this.locales.map((item: string) => ({value: item, label: languages[item]}));
  }

  switchLocale(item: { index: string }): void {
    if (this.$i18n.locale !== item.index) {
      this.$i18n.locale = item.index;
    }
  }
}

Vue.component('app-locale-switcher', LocaleSwitcher);
</script>

<style scoped lang="scss">
@include element-menu-item;

// check icon positioning
i.selected {
  position: absolute;
  top: 50%;
  right: 0.5em;
  margin-top: -0.55em;
  font-size: 1.3em;
}
</style>
