<template>
  <el-container class="app-container">
    <el-header>
      <app-navigation-menu></app-navigation-menu>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>
<script lang="ts">
import NavigationMenu from '@/components/NavigationMenu.vue';
import {Component, Vue} from 'vue-property-decorator';

@Component({
  components: {
    NavigationMenu,
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

i {
  font-size: 24px;
}
</style>
