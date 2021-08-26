<template>
  <div class="checkin">
    <div class="wrapper w-100 max-w-xl">

      <ClassListSelector
        :classes="classes"
        :selectedClassId="selectedClassId"
        @classItemClick="classItemClick"
      />

      <p v-if="!classes.length && !loading" class="text-center">{{ $t('checkin.noClassesRightNow') }}</p>

    </div>


    <div v-if="loading">
      <loadingspinner/>
    </div>

    <div class="fixed-bottom-left">
      <button class="btn btn-transparent" @click.prevent="openLogoutDialog">
        {{ $t('global.logout') }}
      </button>
    </div>

    <modal
      v-show="showClassDialog"
      @close="closeConfirmModal"
    >
      <template v-slot:header>
        <div class="text-center" v-if="selectedClass">
          <h1>
            {{ selectedClass.class_type.name }}
            <span v-if="selectedClass.subtitle">
              <br>
              {{ selectedClass.subtitle }}
            </span>
          </h1>
          <h2>
            {{ selectedClass.start_time }} - {{ selectedClass.end_time }}
          </h2>

          <p class="font-bold" v-if="selectedClass.room">
            {{ selectedClass.room.name }}
          </p>
        </div>
        <div v-if="selectedClass && selectedClass.signups.length < selectedClass.seats">
          <div class="justify-center text-center mt-4">
            <p class="mb-2 italic">{{ $t('checkin.notOnList') }}</p>
            <button class="btn w-full btn-small bold" @click.prevent="toggleDropIn = !toggleDropIn">
              {{ $t('checkin.addYourself') }}
            </button>
          </div>
        </div>

        <!-- dropdown content -->
        <transition name="slide-fade" mode="out-in" appear>
          <div v-if="toggleDropIn" class="add-yourself-animated-container mt-4 border border-gray-400">
            <div class="add-yourself-fixed-height-container p-4 md:px-8 overflow-scroll scrolling-touch">

              <h3 class="text-center py-8">{{ $t('checkin.addYourself') }}</h3>

              <form autocomplete="off" method="post">

                <InputField
                  :label="$t('global.emailLabel')"
                  :class="getValidationClass('email')"
                  type="email"
                  v-model="dropinForm.email"
                  autocomplete="off"
                >
                  <template v-slot:errors>
                    <span class="error" v-if="!$v.dropinForm.email.required">{{ $t('global.typeEmail') }}</span>
                    <span class="error" v-else-if="!$v.dropinForm.email.email">{{ $t('global.notValidEmail') }}</span>
                  </template>
                </InputField>

                <InputField
                  :label="$t('global.password')"
                  :inputLabel="$t('global.passwordLabel')"
                  :class="getValidationClass('password')"
                  type="password"
                  v-model="dropinForm.password"
                  autocomplete="off"
                >
                  <template v-slot:errors>
                    <span class="error" v-if="!$v.dropinForm.password.required">{{ $t('global.typePass') }}</span>
                  </template>
                </InputField>

                <span v-if="dropinLoading">
              <span class="spinner--small">
                <Loadingspinner></Loadingspinner>
              </span>
            </span>
                <button class="btn btn-primary" @click.prevent="doDropin">
                  {{ $t('checkin.addYourself') }}
                </button>
              </form>
            </div>

          </div>
        </transition>
        <!-- end dropdown content -->

      </template>

      <template v-slot:body>
        <div class="mt-8">
          <div class="flex-col mb-4" v-if="selectedClass">
            <div
              class="checkin-user flex items-center mb-4 cursor-pointer"
              @click="signupClick(signup)"
              v-for="signup in selectedClass.signups"
              :key="'signup_' + signup.id"
              :class="{'opacity-50': signup.checked_in}"
            >
              <img
                class="mr-4"
                :src="signup.user.image ? Imgix(signup.user.image.filename, {w:300, h:300, fit:'crop'}) : avatar()"
                :alt="signup.user.first_name + ' ' + signup.user.last_name"
              />
              <div class="border-b border-gray-400 w-full flex justify-between items-center h-20">
                <div class="text-left">
                  <p class="font-bold">
                    {{ signup.user.first_name + ' ' + signup.user.last_name }}
                  </p>
                  <p v-if="signup.checked_in" class="italic text-gray-600">
                    {{ $t('checkin.checkedIn') }}
                  </p>
                  <p v-else class="italic text-gray-600">
                    {{ $t('checkin.notCheckedIn') }}
                  </p>

                </div>
                <div class="icon-checkin" v-if="signup.checked_in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                       stroke-linejoin="round" class="feather feather-user-check">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                </div>

              </div>
            </div>
          </div>
        </div>

      </template>

    </modal>

    <!-- check in confirmation -->
    <modal
      v-if="showConfirmCheckinModal && confirmModalSignup"
      @close="closeConfirmModal"
    >
      <template v-slot:body>
        <div class="flex items-center justify-center flex-col text-center">

          <div class="checkin-user checkin-confirm">
            <img
              :src="confirmModalSignup.user.image ? Imgix(confirmModalSignup.user.image.filename, {w:300, h:300, fit:'crop'}) : avatar()">
            <span class="icon-checkin checked"></span>
          </div>

          <br>
          <h1 class="bold pb-4">
            {{ $t('checkin.hi') }} {{ confirmModalSignup.user.first_name }}
          </h1>
          <h2>{{ $t('checkin.youAreNowSignedUp') }}
            {{ selectedClass.class_type.name }}
          </h2>

          <br>

          <p v-if="client.settings.checkin_direct_customer_to_room_after_checkin && selectedClass.room">
            {{ $t('checkin.goTo') }}
            <span class="font-bold">
              {{ selectedClass.room.name }}
            </span>
          </p>

          <div class="checkin-icon-big my-8">
            <svg :class="{active: svgIsActive}" xmlns="http://www.w3.org/2000/svg" width="24"
                 height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="feather feather-user-check">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" class="svg-elem-1"></path>
              <circle cx="8.5" cy="7" r="4" class="svg-elem-2"></circle>
              <polyline points="17 11 19 13 23 9" class="svg-elem-3"></polyline>
            </svg>
          </div>


          <button class="btn btn-primary " @click="undoCheckin">
            {{ $t('checkin.undo') }}
          </button>

        </div>


      </template>
    </modal>
    <!-- end check in confirmation -->

    <!-- logout modal -->
    <modal
      v-if="showLogoutDialog"
      @close="showLogoutDialog = false"
    >

      <template v-slot:header>
        <h1 class="text-center">
          {{ $t('global.logout') }}
        </h1>
      </template>
      <template v-slot:body>
        <p class="text-center pb-4">
          {{ $t('checkin.typeUserInfoToLogOut') }}
        </p>

        <form @submit.prevent="logout">
          <InputField
            :label="$t('global.emailLabel')"
            :class="getLogoutValidationClass('email')"
            type="email"
            v-model="logoutForm.email"
          >
            <template v-slot:errors>
              <span class="error"
                    v-if="!$v.logoutForm.email.required">{{ $t('global.typeEmail') }}</span>
              <span class="error" v-else-if="!$v.logoutForm.email.email">{{ $t('global.notValidEmail') }}</span>
            </template>
          </InputField>

          <InputField
            :label="$t('global.password')"
            :class="getLogoutValidationClass('password')"
            type="password"
            v-model="logoutForm.password"
          >
            <template v-slot:errors>
              <span class="error" v-if="!$v.logoutForm.password.required">{{ $t('global.typePass') }}</span>
            </template>
          </InputField>
          <button style="display:none;" type="submit"></button>
        </form>
      </template>

      <template v-slot:footer>
        <div class="flex justify-end">
          <button class="btn mr-4" @click.prevent="showLogoutDialog = false">
            {{ $t('global.cancelButton') }}
          </button>
          <button class="btn-primary" @click.prevent="logout">
            {{ $t('global.logout') }}
          </button>
        </div>
      </template>
    </modal>
    <!-- end signout modal -->


  </div> <!-- wrapper -->
</template>

<script>

import { mapActions, mapGetters } from 'vuex';

import moment from 'moment-timezone';
import _map from 'lodash/map';
import _sortBy from 'lodash/sortBy';
import _filter from 'lodash/filter';
import _find from 'lodash/find';
import _isString from 'lodash/isString';
import Modal from './Modal.vue';
import InputField from './InputField.vue';
import YogoApi from '@/gateways/YogoApi';

import avatar from '@/assets/img/account.svg';

import { validationMixin } from 'vuelidate';
import { email, required } from 'vuelidate/lib/validators';
import Loadingspinner from "./LoadingSpinner";
import ClassListSelector from './ClassListSelector';
import Imgix from '../services/Imgix';

export default {
  name: 'Checkin',
  components: {
    Loadingspinner,
    ClassListSelector,
    Modal,
    InputField,
  },
  mixins: [validationMixin, Imgix],
  data() {
    return {
      classes: [],
      selectedClassId: null,
      isModalVisible: false,
      svgIsActive: false,

      // ConfirmedModal
      showConfirmCheckinModal: false,
      showClassDialog: false,
      confirmModalSignup: null,
      closeConfirmModalTimeout: null,


      // Dropin
      toggleDropIn: false,
      showDropin: false,
      selectedDropinClassId: 0,
      dropinForm: {
        email: '',
        password: '',
      },
      emailLabel: 'Email',
      passwordLabel: 'Adgangskode',
      dropinLoading: false,
      dropinUser: null,
      dropinUserAuthToken: '',


      // Load indicator
      loading: true,

      // Logout
      showLogoutDialog: false,
      logoutForm: {
        email: '',
        password: '',
      },

      // Auto refresh
      lastInteraction: moment(),

    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
    selectedClass() {
      return this.classes && this.classes.length ? _find(this.classes,
        classItem => classItem.id === this.selectedClassId) : null;
    },
  },
  created() {
    this.fetchClasses();
    setInterval(() => {
      if (moment().subtract(1, 'minute').isAfter(this.lastInteraction)) {
        this.registerInteraction();
        this.showDropin = false;
        this.showLogoutDialog = false;
        this.fetchClasses();
        this.updateClientSettings();
      }
    }, 5000);
  },
  mounted: function () {

  },
  methods: {
    showModal() {
      this.registerInteraction();
      this.showClassDialog = true;
    },
    closeConfirmModal() {
      if (this.closeConfirmModalTimeout) {
        clearTimeout(this.closeConfirmModalTimeout);
        this.closeConfirmModalTimeout = null;
      }
      this.showClassDialog = false;
      this.toggleDropIn = false;
      this.showConfirmCheckinModal = false;
      this.svgIsActive = false;
    },
    ...mapActions([
      'updateClientSettings',
    ]),
    async fetchClasses() {
      this.registerInteraction();
      const rooms = await YogoApi.get('/rooms');
      let selectedRoomIds;
      if (rooms.length) {
        selectedRoomIds = window.sessionStorage.getItem('roomIds');
        if (!selectedRoomIds) {
          this.$router.push({ name: 'ChooseRooms' });
          return;
        }
        selectedRoomIds = selectedRoomIds.split(',');
      }


      const response = await YogoApi.get(
        '/classes' +
        '?startDate=' + moment().format('YYYY-MM-DD') +
        '&endDate=' + moment().format('YYYY-MM-DD') +
        (selectedRoomIds ? _map(selectedRoomIds, roomId => '&rooms[]=' + roomId).join('') : '') +
        '&sessionType=group' +
        '&populate[]=class_type' +
        '&populate[]=teachers' +
        '&populate[]=signups' +
        '&populate[]=room' +
        '&populate[]=signups.user' +
        '&populate[]=signups.user.image' +
        '&populate[]=signups.used_membership',
      );

      let allClasses = response.classes;
      const nowMoment = moment.tz('Europe/Copenhagen');

      const showClassesThatStartAtTheLatest = this.client.settings.checkin_show_classes_that_start_within === 'number_of_minutes'
        ? moment.tz('Europe/Copenhagen')
          .add(
            this.client.settings.checkin_show_classes_that_start_within_number_of_minutes,
            'minutes'
          )
        : null;

      this.classes = _filter(
        allClasses,
        classItem => {
          if (classItem.cancelled) return false;

          const classStartMoment = moment(nowMoment).set({
            hour: classItem.start_time.substr(0, 2),
            minute: classItem.start_time.substr(3, 2),
            second: 0,
          });
          const classEndMoment = moment(nowMoment).set({
            hour: classItem.end_time.substr(0, 2),
            minute: classItem.end_time.substr(3, 2),
            second: 0,
          });

          if (
            this.client.settings.checkin_show_classes_that_start_within === 'number_of_minutes'
            && classStartMoment.isAfter(showClassesThatStartAtTheLatest, 'minutes')
          ) {
            return false;
          }

          switch (this.client.settings.checkin_classes_are_visible_until) {
            case 'class_end':
              if (nowMoment.isAfter(classEndMoment)) {
                return false;
              }
              break;
            case 'class_start':
              if (nowMoment.isAfter(classStartMoment)) {
                return false;
              }
              break;
            case 'minutes_after_class_start':
              const classVisibleUntilMoment = moment(classStartMoment)
                .add(this.client.settings.checkin_classes_are_visible_for_minutes_after_start,
                  'minutes');
              if (nowMoment.isAfter(classVisibleUntilMoment)) {
                return false;
              }
              break;
          }
          return true;
        },
      );

      this.classes = _sortBy(this.classes, ['start_time']);


      // Sort signups by name
      for (let i = 0; i < this.classes.length; i += 1) {
        this.classes[i].signups = _sortBy(
          this.classes[i].signups,
          signup => (signup.user.first_name + ' ' + signup.user.last_name).toLowerCase(),
        );
      }

      this.loading = false;

      this.registerInteraction();

    },
    doShowConfirmCheckinModal(user) {
      this.showConfirmCheckinModal = true;
      this.showClassDialog = false;
      setTimeout(() => {
        this.svgIsActive = true;
      }, 1000);

      this.closeConfirmModalTimeout = setTimeout(this.closeConfirmModal, 6000);
    },
    async signupClick(signup) {
      this.registerInteraction();
      if (signup.checked_in) return;
      this.loading = true;

      await YogoApi.put('/class-signups/' + signup.id, {
        checked_in: (new Date()).getTime(),
      });

      await this.fetchClasses();

      this.loading = false;

      this.confirmModalSignup = signup;
      this.doShowConfirmCheckinModal();
      this.registerInteraction();
    },

    async undoCheckin() {
      this.loading = true;
      await YogoApi.put('/class-signups/' + this.confirmModalSignup.id, {
        checked_in: 0,
      });
      this.loading = false;
      alert(this.$t('checkin.checkinCancelled'));
      this.closeConfirmModal();
      await this.fetchClasses();
    },

    openDropinDialog() {
      this.registerInteraction();
      this.selectedDropinClassId = this.selectedClassId;
      this.resetDropinDialog();
      this.showDropin = true;
      setTimeout(() => {
          document.querySelector('#dropinEmailInput').focus();
        },
        100,
      );
    },
    resetDropinDialog() {
      this.dropinForm.email = '';
      this.dropinForm.password = '';
      this.$v.$reset();
    },
    async doDropin() {
      this.registerInteraction();
      this.$v.dropinForm.$touch();

      if (this.$v.dropinForm.email.$invalid || this.$v.dropinForm.password.$invalid) {
        return;
      }

      this.dropinLoading = true;
      const loginResponse = await YogoApi.post('/login', {
        email: this.dropinForm.email,
        password: this.dropinForm.password,
      });
      if (loginResponse === 'E_LOGIN_FAILED') {
        this.dropinLoading = false;
        alert(this.$t('checkin.emailOrPassNotValid'));
        return;
      }
      if (!loginResponse.token) {
        this.dropinLoading = false;
        alert('No token returned');
        return;
      }

      this.dropinUserAuthToken = loginResponse.token;

      this.dropinUser = await YogoApi.get('/users/' + loginResponse.user.id +
        '?populate[]=class_signups'
        , {
          headers: {
            Authorization: 'Bearer ' + this.dropinUserAuthToken,
          },
        });

      const existingSignup = _find(this.dropinUser.signups,
        signup => signup.class === this.selectedDropinClassId);
      if (existingSignup) {
        this.dropinLoading = false;
        alert(this.$t('checkin.alreadySignedUpForClass'));
        return;
      }

      const selectedDropinClass = _find(
        this.classes,
        classItem => classItem.id === this.selectedDropinClassId,
      );

      await this.dropinSignUpForClass(selectedDropinClass);

      this.registerInteraction();

    },
    async dropinSignUpForClass(classItem, membership, classPass) {
      this.registerInteraction();
      const signupResponse = await YogoApi.post('/class-signups', {
        'class': this.selectedDropinClassId,
        user: this.dropinUser.id,
      }, {
        headers: {
          Authorization: 'Bearer ' + this.dropinUserAuthToken,
        },
      });
      if (_isString(signupResponse) && signupResponse.substr(0, 2) === 'E_') {
        switch (signupResponse) {
          case 'E_CLASS_IS_FULL':
            alert(this.$t('checkin.fullyBooked'));
            break;
          case 'E_ALREADY_SIGNED_UP':
            alert(this.$t('checkin.youAreAlreadySignedUp'));
            break;
          case 'E_CLASS_IS_CANCELLED':
          case 'E_CLASS_CANCELLED':
            alert(this.$t('checkin.classIsCancelled'));
            break;
          case 'E_NO_ACCESS_PASS':
          case 'E_CUSTOMER_HAS_NO_VALID_CLASS_PASS_OR_MEMBERSHIP':
            alert(this.$t('checkin.noValidClassPasses'));
            break;
          default:
            alert(this.$t('checkin.signupError', {
              errorMessage: signupResponse,
            }));
            break;
        }
        this.dropinLoading = false;
        return;
      }

      await YogoApi.put('/class-signups/' + signupResponse.id, {
        checked_in: (new Date()).getTime(),
      });

      this.selectedClassId = this.selectedDropinClassId;

      await this.fetchClasses();

      this.loading = false;

      this.dropinLoading = false;
      this.showDropin = false;
      this.resetDropinDialog();

      this.confirmModalSignup = _find(this.selectedClass.signups,
        signup => signup.id === signupResponse.id);
      this.doShowConfirmCheckinModal();
      this.registerInteraction();
    },
    classItemClick(classItemId) {
      this.selectedClassId = classItemId;
      this.selectedDropinClassId = classItemId;
      this.showModal();
    },
    openLogoutDialog() {
      this.registerInteraction();
      this.logoutForm.email = '';
      this.logoutForm.password = '';
      this.$v.$reset();
      this.showLogoutDialog = true;
    },
    async logout() {
      this.registerInteraction();
      this.$v.logoutForm.$touch();

      if (this.$v.logoutForm.email.$invalid || this.$v.logoutForm.password.$invalid) {
        return;
      }

      const loginResponse = await YogoApi.post('/login', {
        email: this.logoutForm.email,
        password: this.logoutForm.password,
      });

      if (loginResponse === 'E_LOGIN_FAILED') {
        alert(this.$t('checkin.emailOrPassNotValid'));
        return;
      }

      if (loginResponse.user && !loginResponse.user.checkin && !loginResponse.user.admin) {
        alert(this.$t('checkin.noAccessToCloseCheckin'));
        return;
      }

      if (loginResponse.user && (loginResponse.user.checkin || loginResponse.user.admin)) {
        await this.$store.dispatch('logout');
        return;
      }

      alert(this.$t('checkin.error'));

    },
    registerInteraction() {
      this.lastInteraction = moment();
    },
    getValidationClass(fieldName) {
      const field = this.$v.dropinForm[fieldName];

      if (field) {
        return {
          'invalid': field.$invalid && field.$dirty,
        };
      }
    },
    getLogoutValidationClass(fieldName) {
      const field = this.$v.logoutForm[fieldName];

      if (field) {
        return {
          'invalid': field.$invalid && field.$dirty,
        };
      }
    },
    avatar() {
      return avatar;
    },
  },
  validations: {
    dropinForm: {
      email: {
        required,
        email,
      },
      password: {
        required,
      },
    },
    logoutForm: {
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

<style lang="scss">

  .checkin-user {
    img {
      width: 70px;
      height: 70px;
      border-radius: 50%;
    }
  }

  .add-yourself-animated-container {
    height: 390px;
    position: relative;
    overflow: hidden;
    z-index: 2;
  }

  .add-yourself-fixed-height-container {
    height: 390px;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  .slide-fade-enter {
    height: 0;
  }

  .slide-fade-enter-active {
    transition: all .2s ease;
  }

  .slide-fade-leave-active {
    transition: all .2s ease;
  }

  .slide-fade-leave-to {
    height: 0;
  }

  .checkin-icon-big {
    svg {
      width: 80px;
      height: 80px;
    }
  }

  svg .svg-elem-1 {
    stroke-dashoffset: 25.56814956665039px;
    stroke-dasharray: 25.56814956665039px;
    -webkit-transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
    transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
  }

  svg.active .svg-elem-1 {
    stroke-dashoffset: 0;
  }

  svg .svg-elem-2 {
    stroke-dashoffset: 27.132741228718345px;
    stroke-dasharray: 27.132741228718345px;
    -webkit-transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s;
    transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s;
  }

  svg.active .svg-elem-2 {
    stroke-dashoffset: 0;
  }

  svg .svg-elem-3 {
    stroke-dashoffset: 10.485280990600586px;
    stroke-dasharray: 10.485280990600586px;
    -webkit-transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1s;
    transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1s;
  }

  svg.active .svg-elem-3 {
    stroke-dashoffset: 0;
  }


</style>
