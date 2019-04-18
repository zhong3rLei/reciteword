<template>
  <div class="note">
    <h1>{{title}}<span class="scrip"></span></h1>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "layout",
  components: {},
  props:{
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  methods: {},
  mounted() {}
};
</script>

<style scoped>
.note{
  width: 100%;
  position: relative;
  border-radius: 1px;
  padding: 5px;
  box-sizing: border-box;
}
.note h1{
  margin: 0;
  padding: 0;
  font-size: 16px;
  text-align: center;
  position: relative;
  /* padding-bottom: 30px;  */
}
/* .note h1::before{
  content: '';
  position: absolute;
  height: 4px;
  left: 0;
  right: 60px;
  bottom: 15px;
  background-color: #666;
}
.note h1::after{
  content: '';
  position: absolute;
  height: 4px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #666;
} */
.note h1 .scrip{
  width: 16px;
  height: 20px;
  background-color: #ff8080;
  position: absolute;
  top: -15px;
  right: 10px;
  display: block;
}
.note h1 .scrip::before{
  content: '';
  border-top: 5px solid #ff8080;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  position: absolute;
  bottom: -5px;
  left: 0;
}
.content{
  padding-top: 10px;
}
</style>