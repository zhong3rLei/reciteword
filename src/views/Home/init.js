export default {
    name: "home",
    components: {},
    data() {
      return {
        todayList: []
      };
    },
    methods: {
      toReview (item,lesson) {
        this.$router.push({ path: '/review', query: { chpterId: item.id, lessonId: lesson.id }})
      },
      toDictation (item,lesson) {
        this.$router.push({ path: '/dictation', query: { chpterId: item.id, lessonId: lesson.id }})
      }
    },
    mounted () {
      var _vm = this;
      this.axios.get('/api/getTodayList').then(res => {
        console.log(res)
        _vm.todayList = res.data;
      })
    }
  };