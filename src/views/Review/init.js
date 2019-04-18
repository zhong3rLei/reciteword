var timmer;
export default {
  name: "home",
  components: {
  },
  data() {
    return {
      sub_nav: [],
      left_list: [],
      left_location: 'subject',
      left_edit: false,
      right_list: [],
      right_location: null,
      right_weight: 0,
      letterAudioSrc: null
    };
  },
  methods: {
    isSingleEdit() {
      var bol = false;
      for (var i = 0; i < this.left_list.length; i++) {
        if (this.left_list[i].single_edit) {
          bol = true;
          break;
        }
      }
      return bol;
    },
    toLesson(item) {
      var _vm = this;
      if (this.left_edit || item.single_edit) return;
      if (!item.single_edit && this.isSingleEdit()) {
        this.$refs.wrapper.message("请先完成当前编辑内容");
        return
      };
      if (this.left_location == 'subject') {
        this.axios.post('/api/getChapterList', {
          id: item.id
        }).then(res => {
          _vm.left_list = res.data;
          _vm.sub_nav.push(item);
          _vm.checkTo('chapter');
        })
      } else if (this.left_location == 'chapter') {
        this.weightCommit();
        this.axios.post('/api/getLetter', {
          subdirid: _vm.sub_nav[0].id,
          id: item.id
        }).then(res => {
          _vm.right_list = res.data.dataList.letter;
          _vm.right_weight = res.data.dataList.weightAverage;
          for (var i = 0; i < _vm.right_list.length; i++) {
            _vm.right_list[i].edit = false;
          }
          if (_vm.right_location == "letter") {
            _vm.sub_nav.pop()
          };
          _vm.sub_nav.push(item)
          _vm.right_location = "letter"
        })
      }
    },
    toSubject() {
      if (this.left_location != 'subject') {
        this.left_list = this.$store.state.subjectList;
        this.checkTo('subject');
      }
    },
    checkTo(str) {
      if (str == 'subject') {
        this.left_location = 'subject';
        this.add_text = "添加课程";
        this.sub_nav.length = 0;
        this.right_list = [];
        this.right_location = null;
      } else if (str == "chapter") {
        this.left_location = 'chapter';
        this.add_text = "添加章节";
        for (var i = 0; i < this.sub_nav.length; i++) {
          if (i > 0) {
            this.$delete(this.sub_nav, i);
          }
        }
        this.right_list = [];
        this.right_location = null;
      }
      this.left_edit = false;
    },
    changeNav(i) {
      if (i == 0) {
        this.checkTo("chapter");
      }
    },
    rotateLetter (item, i) {
      var _item = item;
      if (!_item.overturn) _item.overturn = 0;
      _item.overturn++ ;
      _item.rotate = !_item.rotate;
      this.$set(this.right_list, i, _item);
    },
    weightCommit () {
      var _vm = this;
      if (!_vm.sub_nav[1] || this.right_list == []) return;
      var dataList = this.right_list
      for (var i = 0; i < dataList.length; i++) {
        delete dataList[i].rotate;
      }
      _vm.axios.post('/api/changeLessonOverturn', {
        subdirid: _vm.sub_nav[0].id,
        lessonid: _vm.sub_nav[1].id,
        dataList: dataList
      }).then(res => {
      })
    },
    playAudio (item) {
      this.letterAudioSrc = "http://dict.youdao.com/speech?audio=" + item.en;
      var _vm = this;
      // _vm.$refs.letteraudio.addEventListener("ended", ()=>{
      //   alert();
      // })
      this.$nextTick(()=>{
        _vm.$refs.letteraudio.play()
      })
      
    }
  },
  mounted() {
    var _vm = this;
    this.axios.post('/api/getSubjectList').then(res => {
      console.log(res)
      var _data = [];
      for (var i = 0; i < res.data.dataList.length; i++) {
        _data.push({
          name: res.data.dataList[i].name,
          id: res.data.dataList[i].id,
          single_edit: false
        })
      }
      _vm.left_list = _data;
      _vm.$store.commit("setSubjectList", _data);
    })
    timmer = setInterval(_vm.weightCommit, 20000)
  },
  destroyed () {
    this.weightCommit()
    clearInterval(timmer);
  }
};