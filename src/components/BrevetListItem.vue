<template>
  <router-link :to="{ name: 'brevet-info', params: { uid: brevet.uid }}"
               custom v-slot="{ navigate }">
    <li @click="navigate" @keypress.enter="navigate"
        :title="$t('BrevetListItem.link', { name: brevet.name })">
      <el-row :class="['list-item', brevet.isOnline() ? 'online' : '']">
        <i class="el-icon-date"></i>
        <el-col class="date">
          <div>{{ brevet.startDate | dateFilter($i18n.locale) }}</div>
          <div class="small">{{ brevet.startDate | timeFilter($i18n.locale) }}</div>
        </el-col>
        <el-col class="title">
          <div>{{ brevet.name }}, {{ $t('BrevetListItem.length', {length: brevet.length}) }}</div>
          <div class="small"
               v-if="!!brevet.checkpoints">{{ brevet.checkpoints[0].name }}
          </div>
        </el-col>
      </el-row>
    </li>
  </router-link>
</template>

<script lang="ts">
import Brevet from '@/models/brevet';
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class BrevetListItem extends Vue {
  @Prop() private brevet?: Brevet;
}

Vue.component('app-brevet-list-item', BrevetListItem);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
li {
  font-size: 1rem;

  i {
    padding-right: 1em;
    padding-top: 0.15em
  }
}

.list-item {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;

  div {
    line-height: 1.2em;
  }

  .small {
    font-size: 0.8rem;
  }
}

@keyframes ants {
  to {
    background-position: 4.04em 4.04em
  }
}

/* TODO: learn how it works */
.online {
  padding: 0.5em;
  border: 3px solid transparent;
  background: linear-gradient(white, white) padding-box,
  repeating-linear-gradient(-45deg, indigo 0, pink 25%,
      transparent 0, transparent 50%) 0 / 1em 1em;
  animation: ants 10s linear infinite;
}

</style>
