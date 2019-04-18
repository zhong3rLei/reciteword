<template>
  <div ref="whscroll" class="whsroll_container">
    <div
      ref="scroll_wrapper"
      class="scroll_wrapper"
      :class="{'spring-transition': springState}"
      :style="{transform: 'translateX('+Xskew+'px) translateY('+Yskew+'px)'}"
    >
      <slot></slot>
    </div>
    <div class="scroll_bar" ref="scroll_bar">
      <div class="scroll_touch" :class="{'spring-transition': springState}" :style="touchBarStyle"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "wh-scroll",
  props: {
    options: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      isMounted: false,
      beginPos: {
        x: 0,
        y: 0
      },
      curPos: {
        x: 0,
        y: 0
      },
      hisPos: {
        x: 0,
        y: 0
      },
      endPos: {
        x: 0,
        y: 0
      },
      Xskew: 0,
      Yskew: 0,
      springState: false,
      speedX: 0,
      speedY: 0,
      startTime: 0,
      endTime: 0,
      animate: null,
      normalConfig: {
        scroller: {
          direction: "horizontal",
          springback: true,
          dragCoefficient: 0.01,
          mousewheel: false,
          mouseable: true
        },
        bar: {
          width: 5,
          backgroundColor: "#999"
        }
      },
      touchStyle: {
        top: "0px",
        bottom: 'auto',
        height: "0px"
      },
      mouseflag: false
    };
  },
  computed: {
    scrollY() {
      return this.config.scroller.scrollY ? this.config.scroller.scrollY : true;
    },
    config() {
      // return {...this.normalConfig, ...this.options}
      return {
        scroller: { ...this.normalConfig.scroller, ...this.options.scroller },
        bar: { ...this.normalConfig.bar, ...this.options.bar }
      };
    },
    touchBarStyle() {
      if (!this.isMounted) return;
      return {
        ...{
          width: this.config.bar.width + "px",
          backgroundColor: this.config.bar.backgroundColor
        },
        ...this.touchStyle
      };
    }
  },
  methods: {
    ontouchstart(e) {
      var etouch = e.touches ? e.touches[0] : e;
      let _vm = this;
      this.animate.end(); //停掉之前正在进行的动画缓动
      this.startTime = new Date().getTime();
      _vm.beginPos.x =
        etouch.pageX - _vm.$refs.whscroll.getBoundingClientRect().left;
      if (_vm.scrollY) {
        _vm.beginPos.y =
          etouch.pageY - _vm.$refs.whscroll.getBoundingClientRect().top;
      }
    },
    ontouchmove(e) {
      var etouch = e.touches ? e.touches[0] : e;
      let _vm = this;
      if (e.touches || this.mouseflag) {
        _vm.curPos.x =
          etouch.pageX - _vm.$refs.whscroll.getBoundingClientRect().left;
        if (_vm.scrollY) {
          _vm.curPos.y =
            etouch.pageY - _vm.$refs.whscroll.getBoundingClientRect().top;
          // _vm.Xskew = _vm.curPos.x - _vm.beginPos.x
          _vm.verticalmove(e);
        }
      }
    },
    ontouchend(e) {
      let _vm = this;
      var echangetouch = e.changedTouches ? e.changedTouches[0] : e;
      this.endTime = new Date().getTime();
      var _taktTime = this.endTime - this.startTime;
      this.endPos.x =
        echangetouch.pageX - _vm.$refs.whscroll.getBoundingClientRect().left;
      var _distanceX = this.endPos.x - _vm.beginPos.x;
      this.speedX = parseFloat((_distanceX / _taktTime).toFixed(2));
      if (_vm.scrollY) {
        this.endPos.y =
          echangetouch.pageY - _vm.$refs.whscroll.getBoundingClientRect().top;
        var _distanceY = this.endPos.y - _vm.beginPos.y;
        this.speedY = parseFloat((_distanceY / _taktTime).toFixed(2));
        _vm.verticalend(e);
      }
    },
    verticalmove(e) {
      let _vm = this;
      var moveY = _vm.curPos.y - _vm.beginPos.y + _vm.hisPos.y;
      if (moveY > 0) {
        _vm.Yskew = (_vm.curPos.y - _vm.beginPos.y + _vm.hisPos.y) / 2;
        _vm.touchStyle.height =
              (_vm.$refs.whscroll.offsetHeight /
                (_vm.$refs.scroll_wrapper.offsetHeight + _vm.Yskew*10)) *
                _vm.$refs.scroll_bar.offsetHeight + "px";
      } else if (
        _vm.$refs.scroll_wrapper.offsetHeight -
          _vm.$refs.whscroll.offsetHeight +
          moveY <
        0
      ) {
        _vm.Yskew =
          (_vm.curPos.y -
            _vm.beginPos.y +
            _vm.hisPos.y -
            (_vm.$refs.scroll_wrapper.offsetHeight -
              _vm.$refs.whscroll.offsetHeight)) /
          2;
        var _skew = -_vm.Yskew + _vm.$refs.whscroll.offsetHeight - _vm.$refs.scroll_wrapper.offsetHeight;
        _vm.touchStyle.height = (_vm.$refs.whscroll.offsetHeight /
                (_vm.$refs.scroll_wrapper.offsetHeight + _skew*(-_vm.Yskew / _vm.$refs.scroll_wrapper.offsetHeight)*10)) *
                _vm.$refs.scroll_bar.offsetHeight + "px";
        // _vm.touchStyle.top =((-_vm.Yskew / _vm.$refs.scroll_wrapper.offsetHeight) *
        //     _vm.$refs.scroll_bar.offsetHeight) + "px";
        _vm.touchStyle.top = "auto";
        _vm.touchStyle.bottom = "0px";
      } else {
        _vm.Yskew = _vm.curPos.y - _vm.beginPos.y + _vm.hisPos.y;
        _vm.touchStyle.top =
          (-_vm.Yskew / _vm.$refs.scroll_wrapper.offsetHeight) *
            _vm.$refs.scroll_bar.offsetHeight +
          "px";
          _vm.touchStyle.bottom = "auto";
      }
    },
    verticalend(e) {
      let _vm = this;
      _vm.touchStyle.height = (_vm.$refs.whscroll.offsetHeight /
                (_vm.$refs.scroll_wrapper.offsetHeight)) *
                _vm.$refs.scroll_bar.offsetHeight + "px";
      if (_vm.Yskew > 0) {
        _vm.springYAnimate(0);
        _vm.hisPos.y = 0;
      } else if (
        _vm.$refs.scroll_wrapper.offsetHeight -
          _vm.$refs.whscroll.offsetHeight +
          _vm.Yskew <
        0
      ) {
        _vm.springYAnimate(
          -(
            _vm.$refs.scroll_wrapper.offsetHeight -
            _vm.$refs.whscroll.offsetHeight
          )
        ,false);
        _vm.hisPos.y = -(
          _vm.$refs.scroll_wrapper.offsetHeight -
          _vm.$refs.whscroll.offsetHeight
        );
      } else {
        _vm.inertanceMove(() => {
          _vm.hisPos.y = _vm.Yskew;
        });
      }
    },
    bindEvent() {
      let _vm = this;
      if ("ontouchstart" in document) {
        _vm.$refs.whscroll.addEventListener("touchstart", _vm.ontouchstart);
        _vm.$refs.whscroll.addEventListener("touchmove", _vm.ontouchmove);
        _vm.$refs.whscroll.addEventListener("touchend", _vm.ontouchend);
      } else {
        document.addEventListener("mousedown", function(e) {
          if (
            e.target == _vm.$refs.whscroll ||
            _vm.isParent(e.target, _vm.$refs.whscroll)
          ) {
            _vm.mouseflag = true;
            _vm.ontouchstart(e);
          }
        });
        document.addEventListener("mousemove", function(e) {
          if (_vm.mouseflag) {
            _vm.ontouchmove(e);
          }
        });
        document.addEventListener("mouseup", function(e) {
          _vm.mouseflag = false;
          _vm.ontouchend(e);
        });
      }
      var MutationObserver =
        window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver;
      var observer = new MutationObserver(mutationList => {
          alert();
      });
      observer.observe(_vm.$refs.scroll_wrapper, {
        childList: true,
        subtree: true
      });
    },
    springYAnimate(y,f) {
      const _vm = this;
      this.springState = true;
      this.Yskew = y;
      if (f || f == undefined) {
        _vm.touchStyle.top =
          (-_vm.Yskew / _vm.$refs.scroll_wrapper.offsetHeight) *
            _vm.$refs.scroll_bar.offsetHeight +
          "px";
      }
      this.$refs.scroll_wrapper.addEventListener("transitionend", function() {
        _vm.springState = false;
      });
    },
    inertanceMove(callback) {
      var _vm = this;
      this.animate.start(() => {
        callback && callback();
      });
    },
    animateHandler() {
      var timer = null;
      var _vm = this;
      function computeSpeed(_vm, mul) {
        if (_vm.speedY < 0) {
          return _vm.speedY + _vm.config.scroller.dragCoefficient * mul;
        } else {
          return _vm.speedY - _vm.config.scroller.dragCoefficient * mul;
        }
      }
      function move(cb) {
        return requestAnimationFrame(function() {
          if (
            _vm.Yskew > 0 &&
            _vm.Yskew < (_vm.config.scroller.maxOffsetY || 100)
          ) {
            _vm.Yskew = _vm.Yskew + _vm.speedY * 8;
            _vm.touchStyle.height =
              (_vm.$refs.whscroll.offsetHeight /
                (_vm.$refs.scroll_wrapper.offsetHeight + _vm.Yskew)) *
                _vm.$refs.scroll_bar.offsetHeight *
                (1 - _vm.speedY / 8) +
              "px";
            _vm.speedY = computeSpeed(_vm, 5);
            if (
              parseInt(
                _vm.speedY / (_vm.config.scroller.dragCoefficient * 5)
              ) == 0
            ) {
              _vm.springYAnimate(0);
              _vm.touchStyle.height =
                (_vm.$refs.whscroll.offsetHeight /
                  (_vm.$refs.scroll_wrapper.offsetHeight + _vm.Yskew)) *
                  _vm.$refs.scroll_bar.offsetHeight +
                "px";
              _vm.hisPos.y = 0;
              cancelAnimationFrame(timer);
            }
          } else if (_vm.Yskew >= (_vm.config.scroller.maxOffsetY || 100)) {
            _vm.speedY = 0;
            _vm.springYAnimate(0);
            _vm.touchStyle.height =
              (_vm.$refs.whscroll.offsetHeight /
                _vm.$refs.scroll_wrapper.offsetHeight) *
                _vm.$refs.scroll_bar.offsetHeight +
              "px";
            _vm.hisPos.y = 0;
            cancelAnimationFrame(timer);
          } else if (
            _vm.$refs.scroll_wrapper.offsetHeight -
              _vm.$refs.whscroll.offsetHeight +
              _vm.Yskew <
              0 &&
            _vm.$refs.scroll_wrapper.offsetHeight -
              _vm.$refs.whscroll.offsetHeight +
              _vm.Yskew +
              30 >
              0
          ) {
            _vm.Yskew = _vm.Yskew + _vm.speedY * 8;
            _vm.speedY = computeSpeed(_vm, 5);
            _vm.touchStyle.height =
              (_vm.$refs.whscroll.offsetHeight /
                _vm.$refs.scroll_wrapper.offsetHeight) *
                _vm.$refs.scroll_bar.offsetHeight *
                (1 - -_vm.speedY / 8) +
              "px";
            _vm.touchStyle.top =
              (-_vm.Yskew / _vm.$refs.scroll_wrapper.offsetHeight) *
                _vm.$refs.scroll_bar.offsetHeight +
              (_vm.$refs.whscroll.offsetHeight /
                _vm.$refs.scroll_wrapper.offsetHeight) *
                _vm.$refs.scroll_bar.offsetHeight *
                (-_vm.speedY / 8) +
              "px";
            if (
              parseInt(
                _vm.speedY / (_vm.config.scroller.dragCoefficient * 5)
              ) == 0
            ) {
              _vm.springYAnimate(
                _vm.$refs.whscroll.offsetHeight -
                  _vm.$refs.scroll_wrapper.offsetHeight
              );

              _vm.hisPos.y =
                _vm.$refs.whscroll.offsetHeight -
                _vm.$refs.scroll_wrapper.offsetHeight;
              cancelAnimationFrame(timer);
            }
          } else if (
            _vm.$refs.scroll_wrapper.offsetHeight -
              _vm.$refs.whscroll.offsetHeight +
              _vm.Yskew +
              30 <
            0
          ) {
            _vm.speedY = 0;
            _vm.springYAnimate(
              _vm.$refs.whscroll.offsetHeight -
                _vm.$refs.scroll_wrapper.offsetHeight
            );
            _vm.touchStyle.height =
              (_vm.$refs.whscroll.offsetHeight /
                _vm.$refs.scroll_wrapper.offsetHeight) *
                _vm.$refs.scroll_bar.offsetHeight +
              "px";
            _vm.hisPos.y =
              _vm.$refs.whscroll.offsetHeight -
              _vm.$refs.scroll_wrapper.offsetHeight;
            cancelAnimationFrame(timer);
          } else {
            _vm.Yskew = _vm.Yskew + _vm.speedY * 8;
            _vm.touchStyle.top =
              (-_vm.Yskew / _vm.$refs.scroll_wrapper.offsetHeight) *
                _vm.$refs.scroll_bar.offsetHeight +
              "px";
            _vm.speedY = computeSpeed(_vm, 1);
          }

          if (parseInt(_vm.speedY / _vm.config.scroller.dragCoefficient) != 0) {
            timer = move(cb);
          } else {
            cb && cb();
          }
        });
      }
      return {
        start: cb => {
          timer = move(cb);
        },
        end: () => {
          //停止当前动画，并记录当前位置
          cancelAnimationFrame(timer);
          _vm.hisPos.y = _vm.Yskew;
        }
      };
    },
    scrollTo(x, y, time) {},
    moveTo() {},
    isParent(obj, parentObj) {
      while (
        obj != undefined &&
        obj != null &&
        obj.tagName &&
        obj.tagName.toUpperCase() != "BODY"
      ) {
        if (obj == parentObj) {
          return true;
        }
        obj = obj.parentNode;
      }
      return false;
    }
  },
  mounted() {
    this.isMounted = true;
    this.touchStyle.height =
      (this.$refs.whscroll.offsetHeight /
        this.$refs.scroll_wrapper.offsetHeight) *
        this.$refs.scroll_bar.offsetHeight +
      "px";
    this.animate = this.animateHandler();
    this.bindEvent();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.spring-transition {
  transition: all 0.3s ease-out;
}
.scroll_bar {
  position: absolute;
  right: 2px;
  top: 2px;
  bottom: 2px;
}
.whsroll_container {
  position: relative;
}
.scroll_touch {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 20px;
}
</style>