
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
      right_location: null
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
    toLesson(item, call) {
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
          call && call();
        })
      } else if (this.left_location == 'chapter') {
        this.axios.post('/api/getLetter', {
          subdirid: _vm.sub_nav[0].id,
          id: item.id
        }).then(res => {
          _vm.right_list = res.data.dataList.letter;
          for (var i = 0; i < _vm.right_list.length; i++) {
            _vm.right_list[i].edit = false;
            _vm.right_list[i].en = "";
          }
          if (_vm.right_location == "letter") {
            _vm.sub_nav.pop()
          };
          _vm.sub_nav.push(item)
          _vm.right_location = "letter"
          call && call();
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
    enBlur (item, index) {
      this.right_list[index].en = this.$refs["rightEn" + index][0].value;
    },
    submit () {
      var _vm = this;
      console.log(this.$refs.wrapper)
      this.$refs.wrapper.alertTips("确定不再多写点了嘛!!!", ()=>{
        _vm.axios.post('/api/submitTest', {
          subdirid: _vm.sub_nav[0].id,
          lessonid: _vm.sub_nav[1].id,
          dataList: _vm.right_list,
          fromrecommond: _vm.$route.params.lessonId ? true : false
        }).then(res => {
          _vm.$refs.wrapper.showScore(res.data.data)
        })
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
      if (_vm.$route.params.chpterId) {
        for (var i = 0; i < _vm.left_list.length; i++) {
          if (_vm.left_list[i].id == _vm.$route.params.chpterId) {
            _vm.toLesson(_vm.left_list[i], function () {
              for (var j = 0; j < _vm.left_list.length; j++) {
                if (_vm.left_list[j].id == _vm.$route.params.lessonId) {
                  _vm.toLesson(_vm.left_list[j]);
                }
              }
            })
            break;
          }
        }
      }
    })

  }
};