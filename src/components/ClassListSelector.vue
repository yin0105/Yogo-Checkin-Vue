<template>
  <div>
    <button
      class="btn btn-big mb-4 bg-white w-full p-6 border"
      v-for="classItem in classItems"
      :key="classItem.id"
      @click="classItemClick(classItem.id)"
    >
      <span class="class-color" v-bind:style="{ background: classItem.class_type.color }"></span>

      {{ classItem.start_time }} - {{ classItem.end_time }} | {{ classItem.teacherNames }}
      <br>
      <span class="ttu bold">
        {{ classItem.class_type.name }}
      </span>
      <span v-if="classItem.subtitle">
        <br>
        {{ classItem.subtitle }}
      </span>
      <br>
      <small>{{ $t('checkin.checkedIn') }}: {{ classItem.showedUp }} / {{ classItem.signups.length
        }} | {{ $t('checkin.availableSeats') }}: {{ classItem.availableSeats }}</small>
    </button>
  </div>
</template>

<script>
import _filter from 'lodash/filter';
import _map from 'lodash/map';

export default {
  props: {
    classes: Array,
  },
  methods: {
    classItemClick(classItemId) {
      this.$emit('classItemClick', classItemId);
    },
    filterCheckedInSignups(signups) {
      return _filter(signups, signup => {
        return !!signup.checked_in;
      });
    },

  },
  computed: {
    classItems() {
      return this.classes.map(classItem => {

        classItem.teacherNames = classItem.teachers
          ? _map(classItem.teachers, 'first_name').join(', ')
          : '';

        classItem.showedUp = this.filterCheckedInSignups(classItem.signups).length;
        classItem.availableSeats = classItem.seats - classItem.signups.length;

        return classItem;
      });
    },
  },
};
</script>

<style>

  .class-color {
    display: block;
    height: 10px;
    width: 45px;
    margin: 0 auto;
    border-radius: 5px;
    margin-bottom: 10px;
  }

</style>
