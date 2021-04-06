<template>
  <el-submenu :index="rootIndex">
    <template slot="title">
      <i class="el-icon-bicycle"></i>
      <span>{{ $t('ClubSelector.menuItem') }}</span>
    </template>
    <el-menu-item v-for="item in options"
                  @click="onCheck"
                  :key="item.id"
                  :index="item.id.toString()">
      <i class="el-icon-check selected" v-if="item.selected"></i>
      {{ item.name[$i18n.locale] || item.name.default }}
    </el-menu-item>
  </el-submenu>
</template>

<script lang="ts">
import Club from '@/models/club';
import ToggleClubSelectionMutation from '@/store/models/toggleClubSelectionMutation';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {mapGetters} from 'vuex';

type ClubMenuItem = Club & { selected: boolean };

@Component({
  watch: {
    clubs(items: Club[]) {
      // eslint-disable-next-line no-use-before-define
      (this as ClubSelector).options = items.map((item) => ({
        ...item,
        // eslint-disable-next-line no-use-before-define
        selected: (this as ClubSelector).selection.includes(item.id.toString()),
      }));
    },
    selection(items: string[]) {
      // eslint-disable-next-line no-use-before-define
      (this as ClubSelector).options.forEach((club) => {
        // eslint-disable-next-line no-param-reassign
        club.selected = items.includes(club.id.toString());
      });
    },
  },
  computed: {
    ...mapGetters({clubs: 'getClubs', selection: 'getClubSelection'}),
  },
})
export default class ClubSelector extends Vue {
  @Prop() private rootIndex?: string;
  clubs!: Club[];
  selection!: string[];

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

  onCheck(item: { index: string }): void {
    this.$store.commit(new ToggleClubSelectionMutation(item.index));
  }
}

Vue.component('app-club-selector', ClubSelector);
</script>

<style scoped lang="scss">
@include element-menu-item;
</style>
