<template>
  <div>{{ $t('NotFoundPlug.title') }}</div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

@Component
export default class NotFoundPlug extends Vue {
}

Vue.component('app-not-found-plug', NotFoundPlug);
</script>

<style scoped lang="scss">
div {
  padding: 1rem;
}
</style>
