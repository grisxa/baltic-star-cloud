<template>
  <router-link :to="{ name: 'checkpoint-info', params: { uid: checkpoint.uid }}"
               custom v-slot="{ navigate }">
    <li @click="navigate" @keypress.enter="navigate" v-if="checkpoint"
        :title="$t('CheckpointListItem.link', { name: checkpoint.name })">
      <el-row>
        <i class="el-icon-location-outline"></i>
        <div>{{ checkpoint.name }},
          {{ $t('CheckpointListItem.distance', {distance: checkpoint.distance}) }}
        </div>
        <i v-if="checkpoint.sleep" class="checkpoint-type-icon"
           :title="$t('CheckpointListItem.sleeping')" svgIcon="icon_bed"></i>
        <i v-if="checkpoint.selfCheck" class="checkpoint-type-icon"
           :title="$t('CheckpointListItem.selfCheck')" svgIcon="icon_qr"></i>
      </el-row>
    </li>
  </router-link>
</template>

<script lang="ts">
import Checkpoint from '@/models/checkpoint';
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class CheckpointListItem extends Vue {
  @Prop() private checkpoint?: Checkpoint;
}

Vue.component('app-checkpoint-list-item', CheckpointListItem);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.el-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

li {
  cursor: pointer;

  font-size: 1rem;

  .checkpoint-type-icon {
    margin-left: 0.2em;
  }
}
</style>
