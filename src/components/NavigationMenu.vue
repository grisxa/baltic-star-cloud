<template>
  <el-dropdown placement="top-start" ref="dropdown">
    <span class="el-dropdown-link"><i class="el-icon-menu"></i></span>
    <span>{{ $t(header) }}</span>
    <el-dropdown-menu slot="dropdown">
      <el-menu :default-active="activeIndex" :unique-opened="true"
               @select="onSelect">
        <app-club-selector rootIndex="50"></app-club-selector>
        <el-menu-item :index="route.id" v-for="route in menuItems" :key="route.id">
          <i :class="route.icon"></i>
          <span slot="title">{{ $t(route.title) }}</span>
        </el-menu-item>
        <app-locale-switcher rootIndex="100"></app-locale-switcher>
      </el-menu>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import ClubSelector from '@/components/ClubSelector.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import router, {routes} from '@/router';
import {Component, Vue} from 'vue-property-decorator';

@Component({
  components: {
    ClubSelector,
    LocaleSwitcher,
  },
  watch: {
    $route(value) {
      const menuRoute = routes.find((item) => item.name === value.name);
      if (menuRoute) {
        const {title, id} = menuRoute;
        // eslint-disable-next-line no-use-before-define
        (this as NavigationMenu).header = title;
        // eslint-disable-next-line no-use-before-define
        (this as NavigationMenu).activeIndex = id;
      }
    },
  },
})
export default class NavigationMenu extends Vue {
  menuItems = routes.filter((item) => item.showInMenu);
  header = '';
  activeIndex = '1';

  mounted(): void {
    // set a menu selection based on the route
    const menuRoute = routes.find((item) => item.name === router.currentRoute.name);
    if (menuRoute) {
      this.activeIndex = menuRoute.id;
    }
  }

  onSelect(key: string, keyPath: string[]): void {
    const route = this.menuItems.find((item) => item.id === key);
    if (route && route.path !== router.currentRoute.path) {
      router.push(route.path);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.$refs.dropdown.hide();
  }
}

Vue.component('app-navigation-menu', NavigationMenu);
</script>

<style scoped lang="scss">
.el-menu {
  // fix drowing a list in the popup
  border-right: 0;
  min-width: $menu-min-width;
}

.el-icon-menu {
  vertical-align: sub;
}
</style>

<style lang="css">
/* check icon positioning */
i.el-icon-check.selected {
  position: absolute;
  top: 50%;
  right: 0.5em;
  margin-top: -0.55em;
  font-size: 1.3em;
}
</style>
