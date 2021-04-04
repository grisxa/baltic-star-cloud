<template>
  <el-submenu :index="rootIndex">
    <template slot="title">
      <i class="el-icon-bicycle"></i>
      <span>{{ $t('ClubSelector.menuItem') }}</span>
    </template>
    <el-menu-item v-for="item in options"
                  @click="onCheck"
                  :key="item.id"
                  :index="item.id.toString()">{{ item.name[$i18n.locale] || item.name.default }}
      <i class="el-icon-check selected" v-if="item.selected"></i>
    </el-menu-item>
  </el-submenu>
</template>

<script lang="ts">
import Club from '@/models/club';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {mapGetters} from 'vuex';

type ClubMenuItem = Club & { selected: boolean };

@Component({
  watch: {
    clubs(items: Club[]) {
      // eslint-disable-next-line no-use-before-define
      (this as ClubSelector).options = items.map((item) => ({...item, selected: false}));
    },
  },
  computed: {
    ...mapGetters({clubs: 'getClubs'}),
  },
})
export default class ClubSelector extends Vue {
  @Prop() private rootIndex?: string;

  locales: string[] = process.env.VUE_APP_I18N_SUPPORTED_LOCALES.split(',');
  options: ClubMenuItem[] = [
    {
      id: 0,
      country: 'any',
      name: {
        default: 'All',
        ru: 'Все',
      },
      selected: true,
    },
  ];

  mounted(): void {
    this.$store.dispatch('listClubs');
  }

  // eslint-disable-next-line class-methods-use-this
  onCheck(item: { index: string }): void {
    const clubChecked = this.options.find((club) => club.id.toString() === item.index);
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
