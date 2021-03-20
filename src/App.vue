<template>
  <el-container class="app-container">
    <el-header class="home">
      <el-button routerLink="/brevets"
                 :title="$t('App.brevetList')" type="text">
        <i class="el-icon-s-home"></i>
      </el-button>
      <router-link to="/brevets">{{ $t('App.brevetList') }}</router-link>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
    <el-footer>
      <app-locale-switcher></app-locale-switcher>
    </el-footer>
  </el-container>
</template>
<script lang="ts">
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import {Component, Vue} from 'vue-property-decorator';

@Component({
  components: {
    LocaleSwitcher,
  },
})
export default class App extends Vue {
}
</script>

<style lang="scss">
body {
  font-family: Roboto, "Helvetica Neue", sans-serif;
}

.app-container {
  max-width: 30rem;
}

.home {
  display: flex;
  flex-direction: row;
  align-items: center;

  button {
    padding-top: 8px;
    padding-right: 0.2em;
  }
}

i {
  font-size: 24px;
}
</style>
