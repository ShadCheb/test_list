import Vue from 'vue'; 
import Vuex from 'vuex';
Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    products: []
  },
  getters: {
    getProducts: state => {
      return state.products;
    },
  },
  actions: {
    setProdcts: (context, payload) => {
      context.commit('setProdcts', payload);
    },
  },
  mutations: {
    setProdcts: (state, payload) => {
      state.products = payload;
    },
  }
});

