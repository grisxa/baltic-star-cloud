<template>
  <el-submenu :index="rootIndex">
    <template slot="title">
      <i class="el-icon-bicycle"></i>
      <span>{{ $t('ClubSelector.menuItem') }}</span>
    </template>
    <el-menu-item v-for="item in options"
                  @click="onCheck"
                  :key="item.code"
                  :index="item.code">{{ item.name[$i18n.locale] || item.name.default }}
      <i class="el-icon-check selected" v-if="item.selected"></i>
    </el-menu-item>
  </el-submenu>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

type ClubMenuItem = {
  selected: boolean;
  code: string;
  name: {
    [key: string]: string;
  };
}

@Component
export default class ClubSelector extends Vue {
  @Prop() private rootIndex?: string;

  locales: string[] = process.env.VUE_APP_I18N_SUPPORTED_LOCALES.split(',');
  options: ClubMenuItem[] = [
    {
      code: '511200',
      name: {
        default: 'Etoile Baltique',
        en: 'Baltic star',
        ru: 'Балтийская звезда',
      },
      selected: true,
    },
    {
      code: 'xxx',
      name: {
        default: 'M8',
      },
      selected: false,
    },
  ];

  // eslint-disable-next-line class-methods-use-this
  onCheck(item: { index: string }): void {
    const clubChecked = this.options.find((club) => club.code === item.index);
    if (clubChecked) {
      clubChecked.selected = !clubChecked.selected;
    }
  }
}

Vue.component('app-club-selector', ClubSelector);
</script>

<style scoped lang="scss">
@include element-menu-item;
</style>
