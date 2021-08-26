<template>
  <div class="yogo-input-field">

    <div class="flex flex-col">

      <label>{{ label }} <span v-if="required">*</span></label>

      <input
        ref="inputField"
        :autocomplete="inputComplete"
        :value="value"
        class="order-last"
        :type="inputType"
        :pattern="inputPattern"
        @input="updateValue"
      >


      <span
        @click="showPassword = !showPassword" v-if="type === 'password'"
        class="select-transparent order-first float-right text-right -mt-2 h-0 outline-none cursor-pointer flex justify-end z-10"
      >
        <span class="p-1">
          <EyeClosed v-if="showPassword" class="eye select-none"></EyeClosed>
          <EyeOpen v-else class="eye select-none"></EyeOpen>
        </span>

        <span>
          <span v-if="showPassword">{{ this.$t('global.hide') }}</span>
          <span v-else>{{ this.$t('global.show') }}</span>
        </span>
      </span>

    </div>

    <slot name="errors"></slot>

  </div>
</template>

<script>

  import {mapGetters} from 'vuex'
  import moment from 'moment'
  import EyeOpen from '../graphics/EyeOpen'
  import EyeClosed from '../graphics/EyeClosed'

  export default {

    props: [
      'label',
      'type',
      'value',
      'required',
      'pattern',
    ],
    data() {
      return {
        showPassword: false,
        inputPattern: this.pattern,
        inputComplete: this.autocomplete,
        isMobile: false,
      }
    },
    components: {
      EyeOpen,
      EyeClosed
    },
    computed: {
      ...mapGetters(['client']),
      inputType() {
        return (this.type === 'password' && this.showPassword) ? 'text' : this.type;
      }
    },
    methods: {
      updateValue() {
        this.$emit('input',
          this.$refs.inputField.value,
        )
      },
    },
  }
</script>

<style lang="scss">


  .yogo-input-field {

    padding-bottom: 10px;

    input {
      display: flex;
      vertical-align: middle;
      border-radius: 2px;
      min-width: 50px;
      max-width: 635px;
      width: 100%;
      min-height: 52px;
      background-color: #edf2f7;
      border: 1px solid rgba(36, 28, 21, 0.3);
      transition: all 0.2s ease-in-out 0s;
      font-size: 1em;
      line-height: 20px;
      padding: 0 15px;
      margin-bottom: 10px;
      -webkit-appearance: none;

      &:focus {
        outline: none;
        border: 1px solid #000;
        box-shadow: inset 0 0 0 1px #000;
      }
    }

    label {
      color: #000;
      font-weight: bold;
      display: block;
      max-width: 635px;
      padding-bottom: 12px;
      -webkit-user-select: none;
      -ms-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }

    .error {
      display: none;
      left: 0;
      opacity: 0;
      -webkit-transform: translate3d(0, -8px, 0);
      transform: translate3d(0, -8px, 0);
    }

    &.invalid .error {
      opacity: 1;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      background: #fbeeca;
      font-weight: bold;
      padding: 14px;
      padding-left: 55px;
      margin-bottom: 10px;
      display: flex !important;
      align-items: center;

      &:before {
        content: 'ℹ︎';
        border: 1px solid;
        border-radius: 50%;
        padding: 2px;
        padding-bottom: 6px;
        font-size: 16px;
        position: absolute;
        width: 25px;
        height: 25px;
        left: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 1;
      }
    }

    .eye {
      padding-bottom:5px;
    }

  }

</style>
