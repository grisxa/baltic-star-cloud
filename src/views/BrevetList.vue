<template>
  <div v-loading="isLoading">
    <h2>{{ $t('BrevetList.title') }}</h2>
    <ul v-if="newBrevets.length > 0">
      <app-brevet-list-item v-for="brevet in newBrevets"
                            :key="brevet.uid"
                            :brevet="brevet"></app-brevet-list-item>
    </ul>
    <p v-else class="empty">{{ $t('BrevetList.noPlans') }}</p>
    <app-brevet-archive v-if="oldBrevets.length > 0"
                        :brevets="oldBrevets"></app-brevet-archive>
  </div>
</template>

<script lang="ts">
import BrevetArchive from '@/components/BrevetArchive.vue';
import BrevetListItem from '@/components/BrevetListItem.vue';
import {Component, Vue} from 'vue-property-decorator';
import {mapGetters} from 'vuex';

@Component({
  components: {
    BrevetListItem,
    BrevetArchive,
  },
  computed: {
    ...mapGetters(['oldBrevets', 'newBrevets', 'isLoading', 'getClubSelection']),
  },
  watch: {
    getClubSelection() {
      // eslint-disable-next-line no-use-before-define
      this.$store.dispatch('listBrevets', (this as BrevetList).getClubSelection);
    },
  },
})
export default class BrevetList extends Vue {
  getClubSelection!: string[];
  $title!: string;

  mounted(): void {
    this.$store.dispatch('listBrevets', this.getClubSelection);
  }

  updated(): void {
    this.$title = this.$t('Route.brevetList').toString();
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.empty {
  padding-left: 1em;
}

h2 {
  margin-top: 0;
  text-align: center;
}

ul {
  list-style: none;
  padding-inline-start: 0;
}
</style>
