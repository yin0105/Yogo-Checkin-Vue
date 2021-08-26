import Vue from 'vue'
import Vuex from 'vuex'
import YogoApi from '@/gateways/YogoApi'
import router from '@/router'

import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _pick from 'lodash/pick'
import _map from 'lodash/map'

import moment from 'moment'

import axios from 'axios'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    apiRoot: process.env.VUE_APP_API_ROOT,
    requestedRoute: null,
    client: null,
    routerBase: '/checkin',
    ready: false,
    date: null,
    loggedIn: false,
    lastRefreshDate: null,
  },
  mutations: {
    setClient(state, client) {
      state.client = client
    },
    setReady(state) {
      state.ready = true
    },
    setLoggedIn(state, loggedIn) {
      state.loggedIn = loggedIn
    },
    setRequestedRoute(state, requestedRoute) {
      state.requestedRoute = requestedRoute
    },
    setLastRefreshDate(state, refreshDate) {
      state.lastRefreshDate = refreshDate
    },
  },
  getters: {
    loggedIn(state) {
      return state.loggedIn
    },
    client(state) {
      return state.client ? state.client : {}
    },
    clientLogoFilename(state) {
      return state.client && state.client.logo && state.client.logo.filename ? state.client.logo.filename : ''
    },
    apiRoot(state) {
      return state.apiRoot
    },
    routerBase(state) {
      return state.routerBase
    },
    stateReady(state) {
      return state.ready
    },
    clientSettings({client}) {
      return client && client.settings ? client.settings : {}
    },
    locale(state, getters) {
      const {locale} = getters.clientSettings
      return locale ? locale : 'da'
    },
  },

  actions: {

    async logout({commit}) {
      await YogoApi.post('/logout')
      commit('setLoggedIn', false)
      window.sessionStorage.removeItem('accessToken')
      window.localStorage.removeItem('accessToken')
      this.dispatch('checkForNewVersion')
      router.push('/login')
    },

    async checkForNewVersion() {
      const currentCommitHashResponse = await axios.get('/checkin/commit-hash.txt')
      if (!currentCommitHashResponse || !currentCommitHashResponse.status || currentCommitHashResponse.status !== 200 || !currentCommitHashResponse.data || !currentCommitHashResponse.data.length) {
        console.error('Error getting current commit hash')
        return
      }
      const currentCommitHash = currentCommitHashResponse.data

      const storedCommitHash = window.localStorage.getItem('commitHash')

      if (!storedCommitHash) {
        window.localStorage.setItem('commitHash', currentCommitHash)
      } else if (storedCommitHash !== currentCommitHash) {
        window.localStorage.removeItem('commitHash')
        window.location.reload(true)
      }
    },

    async init({commit, state}) {

      let [client, loginStatus] = await Promise.all([
        YogoApi.get('/clients/current?populate[]=logo&populate[]=settings&populate[]=branches'),
        YogoApi.get('/get-login-status'),
      ])

      commit('setClient', client)

      if (loginStatus.status === 'CHECKIN') {
        commit('setReady')
        commit('setLoggedIn', true)
        if (router.currentRoute.name === 'Init') {
          if (state.requestedRoute && state.requestedRoute.name !== 'Init') {
            const requestedRoute = _pick(state.requestedRoute, ['name', 'params'])
            commit('setRequestedRoute', null)
            router.push(requestedRoute)
          } else {
            router.push({name: 'Checkin'})
          }
        }
      } else {
        commit('setReady')
        commit('setLoggedIn', false)
        if (router.currentRoute.name === 'Init' || router.currentRoute.meta.requireAuth !== false) {
          // requireAuth might be undefined, which should be taken as "true"
          router.push({name: 'Login'})
        }
      }

      // Refresh app when new day starts, just in case.
      setInterval(() => {
        if (state.lastRefreshDate) {
          if (state.lastRefreshDate.isBefore(moment(), 'day')) {
            location.reload(true)
          }
        } else {
          commit('setLastRefreshDate', moment())
        }
      }, 2000)


      // Check for new version, since this is not done automatically if the web app has been bookmarked on the home screen. The file commit-hash.txt is created in bitbucket-pipelines.yml
      if (document.location.hostname.indexOf('localhost') === -1) {
        this.dispatch('checkForNewVersion')
      }

    },
    async updateClientSettings({commit, state}) {
      const client = await YogoApi.get('/clients/current?populate[]=logo&populate[]=settings')
      commit('setClient', client)
    }

  },
  strict: debug,
})
