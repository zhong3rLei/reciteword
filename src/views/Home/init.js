export default {
    name: "home",
    components: {},
    data() {
      return {
        
      };
    },
    methods: {
      
    },
    mounted () {
      this.axios.get('/api/getTodayList').then(res => {
        console.log(res)
      })
    }
  };