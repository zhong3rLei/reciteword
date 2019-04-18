import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    subjectList: []
  },
  mutations: {
    setSubjectList (state, list) {
      state.subjectList = list;
    }
  },
  actions: {

  }
})
