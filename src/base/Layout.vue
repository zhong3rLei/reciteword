<template>
  <div class="wrapper">
    <div class="left_content">
      <span class="scrip"></span>
      <slot name="left"></slot>
    </div>
    <div class="right_content">
      <!-- <wh-scroll class="scroll_box" :options="scrollOption"> -->
        <slot name="right"></slot>
      <!-- </wh-scroll> -->
    </div>
    <div class="tips" :class="{show: tips.show}" @click="hideTips">{{tips.text}}</div>
    <div class="alert_wrapper" v-show="alert.show">
      <div class="alert_box">
        <div class="title">
          提示
          <a class="close_btn" @click="hideAlert"></a>
        </div>
        <div class="body">
          <div class="text">{{alert.text}}</div>
          <div class="control">
            <button @click="alertYes" class="confirm">确定</button>
            <button @click="hideAlert" class="cancel">取消</button>
          </div>
        </div>
      </div>
    </div>
    <div class="popwrapper" v-show="popshow">
      <div class="score_container" :class="{show: score.show}">
        <div class="title">
          成绩单:
          <span>{{score.score}}</span>分
          <a class="close_btn" @click="hideScore"></a>
        </div>
        <div class="body">
          <ul>
            <li v-for="item in score.list" :key="item.en">
              {{item.ch}}:
              <span :class="{right: item.mark, wrong: !item.mark}">{{item.youranswer}}</span> 正确答案：
              <span class="real_answer">{{item.en}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "layout",
  components: {},
  data() {
    return {
      tips: {
        show: false,
        text: "",
        flag: false
      },
      alert: {
        show: false,
        text: "",
        call: null
      },
      score: {
        list: [],
        show: false,
        score: "0"
      },
      popshow: false,
      scrollOption: {
        scroller: {
          dragCoefficient: 0.03,
          scrollY: true,
          maxOffsetY: 50
        },
        bar: {
          width: 6,
          backgroundColor: "rgba(0,0,0,.5)"
        }
      }
    };
  },
  methods: {
    message(txt) {
      var _vm = this;
      this.tips.show = true;
      this.tips.text = txt;
      setTimeout(function() {
        if (!_vm.tips.flag) {
          _vm.tips.show = false;
        }
        _vm.tips.flag = false;
      }, 3000);
    },
    hideTips() {
      this.tips.show = false;
      this.tips.flag = true;
    },
    alertTips(txt, call) {
      this.alert.show = true;
      this.alert.text = txt;
      this.alert.call = call;
    },
    hideAlert() {
      this.alert.show = false;
      this.alert.text = "";
    },
    alertYes() {
      this.alert.call && this.alert.call();
      this.alert.show = false;
      this.alert.text = "";
    },
    showScore(data) {
      console.log(data);
      this.score.list = data.letter;
      this.score.show = true;
      this.popshow = true;
      this.score.score = parseFloat(data.score) * 100;
    },
    hideScore() {
      this.score.list = [];
      this.score.show = false;
      this.popshow = false;
      this.score.score = "0";
    }
  },
  mounted() {}
};
</script>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #eee;
}
.left_content {
  position: absolute;
  left: 10px;
  top: 10px;
  bottom: 10px;
  width: 20%;
  background-color: #fdd469;
  border-radius: 5px;
  padding: 10px;
  box-sizing: border-box;
}
.right_content {
  position: absolute;
  left: calc(20% + 20px);
  right: 10px;
  top: 10px;
  bottom: 10px;
  /* background-color: #6FCEFC; */
  border-radius: 5px;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
}

.left_content .scrip {
  width: 16px;
  height: 20px;
  background-color: #ff8080;
  position: absolute;
  top: 0px;
  right: 20px;
  display: block;
}
.left_content .scrip::before {
  content: "";
  border-top: 5px solid #ff8080;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  position: absolute;
  bottom: -5px;
  left: 0;
}
.tips {
  background: rgba(0, 0, 0, 0.5);
  color: #f0f0f0;
  font-size: 14px;
  position: absolute;
  left: 50%;
  top: -20%;
  transform: translate(-50%, -50%);
  padding: 5px;
  border-radius: 3px;
  transition: all 0.5s;
  opacity: 0;
}
.tips.show {
  top: 40%;
  opacity: 1;
}
.alert_wrapper {
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}
.alert_box {
  width: 300px;
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 2px;
}
.alert_box .title {
  height: 40px;
  line-height: 40px;
  background-color: #ff8080;
  position: relative;
  color: white;
  font-weight: bold;
  text-align: center;
}
.alert_box .title .close_btn {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 10px;
  top: 10px;
  mask: url(../assets/image/close_icon.svg) no-repeat center;
  mask-size: 100%;
  background-color: white;
}
.alert_box .body {
  height: 150px;
  background-color: white;
}
.alert_box .body .text {
  text-align: center;
  padding: 30px 0;
  height: 100px;
  box-sizing: border-box;
  vertical-align: middle;
  font-size: 14px;
}
.alert_box .body .text::before {
  content: "";
  display: inline-block;
  width: 25px;
  height: 25px;
  background: url(../assets/image/tips_icon.svg) no-repeat center;
  background-size: 100%;
  margin-right: 10px;
  vertical-align: middle;
}
.alert_box .control {
  text-align: center;
}
.alert_box .control button {
  margin: 0 10px;
  display: inline-block;
  width: 70px;
  height: 30px;
  border: 0;
  background: transparent;
  border-radius: 3px;
  color: white;
  outline: 0;
}
.alert_box .control button.confirm {
  background: #007acc;
}
.alert_box .control button:hover {
  opacity: 0.8;
}
.alert_box .control button.cancel {
  background: #888;
}
.popwrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}
.score_container {
  background-color: #f0f0f0;
  width: 500px;
  height: 650px;
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
  transform-origin: 0 0;
}
.score_container.show {
  animation: scoreShow 1s forwards;
}
@keyframes scoreShow {
  from {
    transform: scale(0) rotate(0) translate(-50%, -50%);
  }
  to {
    transform: scale(1) rotate(720deg) translate(-50%, -50%);
  }
}
.score_container .title {
  border-bottom: 2px solid #aaa;
  padding: 10px 0;
  height: 64px;
  box-sizing: border-box;
  position: relative;
}
.score_container .title span {
  color: #ff8080;
  font-size: 36px;
  margin: 0 10px;
}
.score_container .title .close_btn {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 0;
  top: 0;
  mask: url(../assets/image/close_icon.svg) no-repeat center;
  mask-size: 100%;
  background-color: #333;
}
.score_container .title .close_btn:hover {
  background-color: #999;
}
.score_container .body {
  height: 546px;
  overflow: auto;
  box-sizing: border-box;
}
.score_container .body ul {
  list-style: none;
  padding: 0 10px;
}
.score_container .body ul li {
  padding: 10px;
  border-bottom: 1px solid #999;
  margin: 0;
  font-size: 14px;
}
.score_container .body ul li .wrong {
  text-decoration: line-through;
  margin: 0 10px;
}
.score_container .body ul li .right {
  margin: 0 10px;
}
.score_container .body ul li .wrong::after {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  background: url(../assets/image/wrong_icon.svg) no-repeat center;
  background-size: 60% auto;
}
.score_container .body ul li .right::after {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  background: url(../assets/image/right_icon.svg) no-repeat center;
  background-size: 60% auto;
}
.score_container .body ul li .real_answer {
  font-size: 20px;
  color: #007acc;
}
.scroll_box {
  height: 100px;
}
</style>