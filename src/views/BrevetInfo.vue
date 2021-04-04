<template>
  <el-col v-loading="isLoading">
    <h2>{{ $t('BrevetInfo.title') }}</h2>
    <template v-if="brevet">
      <h3>{{ brevet.name }}</h3>
      <el-row>{{ $t('BrevetInfo.length', {length: brevet.length}) }}</el-row>
      <el-row>{{
          $t('BrevetInfo.start', {
            date: $options.filters.dateFilter(brevet.startDate, $i18n.locale),
            time: $options.filters.timeFilter(brevet.startDate, $i18n.locale)
          })
        }}
      </el-row>
      <el-row v-if="brevet.mapUrl">
        <span>{{ $t('BrevetInfo.link') }}</span>
        <div class="url">
          <a v-if="brevet.mapUrl" :href="brevet.mapUrl" target="_blank"
             :title="$t('BrevetInfo.hint')">
            {{ brevet.mapUrl }}
          </a>
        </div>
        <a v-if="brevet.mapUrl" :href="brevet.mapUrl" target="_blank"
           :title="$t('BrevetInfo.hint')">
          <i class="el-icon-link"></i>
        </a>
      </el-row>

      <h3 class="control-points">{{ $t('BrevetInfo.controls') }}</h3>
      <ul v-if="brevet.checkpoints">
        <app-checkpoint-list-item v-if="brevet.checkpoints.length"
                                  :checkpoint="brevet.checkpoints[0]"></app-checkpoint-list-item>
        <el-collapse v-model="visible" v-if="brevet.checkpoints.length > 3">
          <el-collapse-item name="intermediate">
            <template slot="title">
              <div class="header">{{ $t('BrevetInfo.intermediate') }}</div>
            </template>
            <app-checkpoint-list-item v-for="checkpoint in brevet.checkpoints.slice(1, -1)"
                                      :key="checkpoint.uid"
                                      :checkpoint="checkpoint"></app-checkpoint-list-item>
          </el-collapse-item>
        </el-collapse>
        <template v-else>
          <app-checkpoint-list-item v-for="checkpoint in brevet.checkpoints.slice(1, -1)"
                                    :key="checkpoint.uid"
                                    :checkpoint="checkpoint"></app-checkpoint-list-item>
        </template>
        <app-checkpoint-list-item v-if="brevet.checkpoints.length > 1"
                                  :checkpoint="brevet.checkpoints[brevet.checkpoints.length - 1]">
        </app-checkpoint-list-item>
      </ul>
    </template>
    <template v-else>
      <app-not-found-plug></app-not-found-plug>
    </template>
  </el-col>
</template>

<script lang="ts">
import CheckpointListItem from '@/components/CheckpointListItem.vue';
import NotFoundPlug from '@/components/NotFoundPlug.vue';
import {Component, Vue} from 'vue-property-decorator';
import {mapGetters} from 'vuex';

@Component({
  components: {
    CheckpointListItem,
    NotFoundPlug,
  },
  computed: {
    brevet() {
      const info = this.$store.getters.getBrevet(this.$route.params.uid);
      if (info) {
        document.title = this.$t('Route.brevetInfo', {name: info.name}).toString();
      }
      return info;
    },
    ...mapGetters(['isLoading']),
  },
})
export default class BrevetInfo extends Vue {
  visible: string[] = [];

  mounted(): void {
    // reload brevet list
    this.$store.dispatch('listBrevets');
  }
}
</script>

<style scoped lang="scss">
.el-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.el-collapse {
  margin-top: 0.1em;
}

.header {
  font-size: 1rem;
}

.el-col {
  h2 {
    margin-top: 0;
    margin-bottom: 0;
    text-align: center;
  }

  h3, .row {
    margin-left: 1rem;
  }

  h3.control-points {
    margin-bottom: 0;
  }

  span:not(:first-of-type) {
    padding-left: 0.2em;
  }

  ul {
    list-style: none;
    padding-inline-start: 0;
  }

  li {
    margin-top: 0.5em;
  }

  a i {
    line-height: 0.55em;
    vertical-align: middle;
  }

  .url {
    max-width: calc(100% - 10ch - 24px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 0.2em;
  }
}
</style>
