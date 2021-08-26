import Vue from 'vue'
import VueI18n from 'vue-i18n'
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep'
import store from '../store'
import da from '@/locales/da'
import en from '@/locales/en'

const initialLocale = store.getters.locale

/**
 * Configure VueI18n
 */
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: initialLocale,
  fallbackLocale: 'da',
  messages: { da, en }
})

/**
 * Configure moment.js
 */
moment.locale(initialLocale)

/**
 * Subscribe to locale changes in the store
 */
function handleLocaleChange(locale) {
  i18n.locale = locale
  moment.locale(locale)
}

store.watch(
  state => store.getters.locale,
  handleLocaleChange
)

if (process.env.NODE_ENV !== 'production') {
  window.changeLocale = locale => {
    const client = cloneDeep(store.getters.client)
    client.settings.locale = locale
    store.commit('setClient', client)
  }
}

export default i18n
