<template>
  <div id="app">
    <header>
      <nav>
        <span @click="check(0)" :class="{active: navIndex == 0}">录入词库</span>
        <span @click="check(1)" :class="{active: navIndex == 1}">单词复习</span>
        <span @click="check(2)" :class="{active: navIndex == 2}">单词听写</span>
      </nav>
    </header>
    <div class="page_wrapper">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: "app",
  components: {},
  data() {
    return {
      navIndex: null
    };
  },
  methods: {
    check (i) {
      this.navIndex = i;
      if (i == 0) {
        this.$router.push('/record');
      } else if (i == 1) {
        this.$router.push('/review');
      } else if (i == 2) {
        this.$router.push('/dictation');
      }
    }
  },
  mounted () {
    
  }
};
</script>

<style scoped>
  #app {
  font-family: 'microsoft yahei';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
body,html{
  margin: 0;
  padding: 0;
}
header{
  height: 40px;
  position: absolute;
  top: 0;
  left: 0;
  background-color:#ff8080;
  width: 100%;
}
nav span{
  display: inline-block;
  height: 100%;
  line-height: 40px;
  color: white;
  padding: 0 20px;
}
nav{
  float: right;
}
nav span:hover{
  background-color: #ff3333;
}

nav span.active{
  background-color: #ff3333;
}
.page_wrapper{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 40px;
}
</style>
