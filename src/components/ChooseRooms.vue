<template>

  <div class="justify-center bg-white sm:bg-transparent pb-8">
    <div class="login wrapper w-100 max-w-xl">

    <loadingspinner v-if="loading"></loadingspinner>

    <div class="bg-white md:pl-6 md:pr-6 md:pb-6 md:pt-10 lg:pt-6 md:mt-4 lg:mt-8 lg:pb-10" v-else>
      <h1 class="text-center mt-4 mb-8">{{ $t('checkin.chooseRooms') }}</h1>

      <div v-for="room in rooms">
        <label class="checkbox">
          <input type="checkbox" :key="'room_' + room.id" :value="room.id" v-model="selectedRooms">
          <span>
            {{ room.name }}
            <span v-if="client.branches && client.branches.length > 1 && room.branch">({{ room.branch.name }})</span>
          </span>
        </label>
      </div>

      <button class="btn btn-primary w-full my-6" @click="chooseRooms">
        {{ $t('checkin.chooseRooms') }}
      </button>
    </div>

  </div>

</div>
</template>

<script>
  import Loadingspinner from "./LoadingSpinner"
  import {mapGetters} from 'vuex'

  import YogoApi from '@/gateways/YogoApi';

  import _sortBy from 'lodash/sortBy';

  export default {
    components: {Loadingspinner},
    data() {
      return {
        loading: true,

        rooms: [],
        selectedRooms: [],
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client'
      ]),
    },
    methods: {
      async chooseRooms() {
        if (!this.selectedRooms.length) {
          alert(this.$t('checkin.youHaveToChooseRoom'))
          return
        }
        window.sessionStorage.setItem('roomIds', this.selectedRooms.join(','))
        this.$router.push({name: 'Checkin'})
      },
    },
    async created() {
      const storedRoomIds = window.sessionStorage.getItem('roomIds')
      if (storedRoomIds) {
        this.selectedRooms = storedRoomIds.split(',').map(n => parseInt(n))
      }
      this.rooms = await YogoApi.get('/rooms?populate[]=branch');
      this.rooms = _sortBy(this.rooms, ['branch.sort', 'name'])

      if (!this.rooms.length) {
        this.$router.push({name: 'Checkin'})
      }
      this.loading = false
    },
  }
</script>

