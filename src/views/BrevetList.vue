<template>
  <div v-loading="loading">
    <h2>{{ $t('BrevetList.title') }}</h2>
    <ul v-if="newBrevets.length > 0">
      <app-brevet-list-item v-for="brevet in newBrevets"
                            :key="brevet.uid"
                            :brevet="brevet"></app-brevet-list-item>
    </ul>
    <p v-else class="empty">Nothing has been planned.</p>
    <app-brevet-archive v-if="oldBrevets.length > 0"
                        :brevets="oldBrevets"></app-brevet-archive>
  </div>
</template>

<script lang="ts">
import BrevetArchive from '@/components/BrevetArchive.vue';
import BrevetListItem from '@/components/BrevetListItem.vue';
import Brevet from '@/models/brevet';
import {Component, Vue} from 'vue-property-decorator';

@Component({
  components: {
    BrevetListItem,
    BrevetArchive,
  },
})
export default class BrevetList extends Vue {
  loading = false;
  oldBrevets: Brevet[] = [
    new Brevet({
      uid: '2',
      name: 'test2',
      length: 200,
      startDate: new Date(1609000000000),
      endDate: new Date(1609500000000),
    } as Brevet),
    new Brevet({
      uid: '3',
      name: 'test3',
      length: 200,
      startDate: new Date(1609000000000),
      endDate: new Date(1609500000000),
    } as Brevet),
    new Brevet({
      uid: '4',
      name: 'test4',
      length: 200,
      startDate: new Date(1609000000000),
      endDate: new Date(1609500000000),
    } as Brevet),
    new Brevet({
      uid: '5',
      name: 'new',
      length: 200,
      startDate: new Date(1609000000000),
      endDate: new Date(1609500000000),
    } as Brevet),
  ];
  newBrevets: Brevet[] = [
    new Brevet({
      uid: '1',
      name: 'test1',
      length: 200,
      startDate: new Date(Date.now() - 3000),
      checkpoints: [
        {uid: '111', name: 'start'},
      ],
    } as Brevet),
  ];

  mounted(): void {
    document.title = this.$t('Route.brevetList');
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
