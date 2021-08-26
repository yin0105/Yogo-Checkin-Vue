<template>
  <div class="justify-center sm:bg-transparent pb-8">
    <div class="login wrapper w-100 max-w-xl">
      <loadingspinner v-if="loading"></loadingspinner>
      <div class="bg-white md:pl-6 md:pr-6 md:pb-6 md:pt-10 lg:pt-6 md:mt-4 lg:mt-8 lg:pb-10"
           v-else>
        <h1 class="text-center my-4">{{ $t('global.checkin') }}</h1>
        <form @submit.prevent="doLogin" novalidate>

          <InputField
            :label="$t('global.email')"
            :class="getValidationClass('email')"
            type="email"
            v-model="form.email"
          >
            <template v-slot:errors>
              <span class="error" v-if="!$v.form.email.required">{{ $t('global.typeEmail') }}</span>
              <span class="error"
                    v-else-if="!$v.form.email.email">{{ $t('global.notValidEmail') }}</span>
            </template>
          </InputField>

          <InputField
            :label="$t('global.password')"
            :inputLabel="$t('global.passwordLabel')"
            :class="getValidationClass('password')"
            type="password"
            v-model="form.password"
          >
            <template v-slot:errors>
              <span class="error" v-if="!$v.form.password.required">{{ $t('global.passwordRequired') }}</span>
            </template>
          </InputField>

          <button type="submit" class="w-full btn-primary my-6">{{ $t('global.login') }}</button>

        </form>
      </div>
    </div>

    <modal
      v-show="showEmailAndPasswordDoesntMatchDialog"
      @close="closeModal"
    >
      <template v-slot:header>
        <h2>
          {{ $t('checkin.loginFailed') }}
        </h2>
      </template>
      <template v-slot:body>
        <p>
          {{ $t('checkin.emailOrPassNotValid') }}
        </p>
      </template>
      <template v-slot:footer>
        <button
          type="button"
          class="btn btn-primary"
          @click="closeModal()"
        >
          {{ $t('global.close') }}
        </button>
      </template>
    </modal>

  </div>
</template>

<script>
import Loadingspinner from "./LoadingSpinner";
import InputField from './InputField.vue';
import Modal from './Modal.vue';

import { validationMixin } from 'vuelidate';
import { email, required } from 'vuelidate/lib/validators';

import { mapGetters } from 'vuex';

import YogoApi from '@/gateways/YogoApi';

export default {
  components: {
    Loadingspinner,
    InputField,
    Modal,
  },
  mixins: [validationMixin],
  data() {
    return {
      loading: false,
      isModalVisible: false,
      email: '',
      password: '',

      form: {
        email: '',
        password: '',
      },

      showEmailAndPasswordDoesntMatchDialog: false,

    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  methods: {
    showModal() {
      this.showEmailAndPasswordDoesntMatchDialog = true;
    },
    closeModal() {
      this.showEmailAndPasswordDoesntMatchDialog = false;
    },

    async doLogin() {

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const response = await YogoApi.post('/login-to-checkin', this.form);

      console.log(response);

      if (response === 'E_LOGIN_FAILED') {
        this.showEmailAndPasswordDoesntMatchDialog = true;
        return;
      }

      if (response === 'E_USER_CAN_NOT_OPEN_CHECKIN') {
        alert(this.$t('checkin.noAccessToCheckin'));
        return;
      }

      if (!response.token) {
        alert(this.$t('checkin.error'));
        return;
      }

      window.sessionStorage.setItem('accessToken', response.token);
      window.localStorage.removeItem('accessToken');

      this.$store.commit('setLoggedIn', true);

      this.$router.push({ name: 'ChooseRooms' });


    },
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'invalid': field.$invalid && field.$dirty,
        };
      }
    },
  },
  mounted() {

  },
  validations: {
    form: {
      email: {
        required,
        email,
      },
      password: {
        required,
      },
    },
  },
};
</script>

