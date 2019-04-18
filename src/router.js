import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home/'
import Record from './views/Record/'
import Review from './views/Review/'
import Dictation from './views/Dictation/'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/record',
      name: 'record',
      component: Record
    },
    {
      path: '/review',
      name: 'review',
      component: Review
    },
    {
      path: '/dictation',
      name: 'dictation',
      component: Dictation
    }
  ]
})
