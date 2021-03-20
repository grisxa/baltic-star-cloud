<template>
  <el-collapse v-model="visible" v-if="brevets.length > 0">
    <el-collapse-item name="archive">
      <template slot="title">
        <div class="header">{{ $t('BrevetArchive.title') }}</div>
      </template>
      <ul>
        <app-brevet-list-item v-for="brevet in brevets"
                              :key="brevet.uid"
                              :brevet="brevet"></app-brevet-list-item>
      </ul>
    </el-collapse-item>
  </el-collapse>
</template>

<script lang="ts">
import BrevetListItem from '@/components/BrevetListItem.vue';
import Brevet from '@/models/brevet';
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({
  components: {
    BrevetListItem,
  },
})
export default class BrevetArchive extends Vue {
  @Prop() private brevets?: Brevet[];
  visible: string[] = [];
}
Vue.component('app-brevet-archive', BrevetArchive);
</script>

<style scoped lang="scss">
.mat-expansion-panel-body {
  padding: 0 0 16px 8px;
}

.header {
  font-size: 1rem;
}

ul {
  list-style: none;
  padding-inline-start: 0;
}

li {
  margin-top: 0.5em;
}

.el-collapse-item__content {
  line-height: normal;
}
</style>
