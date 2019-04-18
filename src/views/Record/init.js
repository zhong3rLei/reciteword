import draggable from 'vuedraggable'

export default {
  name: "home",
  components: {
    draggable
  },
  data() {
    return {
      sub_nav: [],
      add_text: '添加课程',
      left_list: [],
      left_location: 'subject',
      left_edit: false,
      drag: false,
      right_list: [],
      right_location: null,
      newLetter: {
        en: "",
        ch: "",
        edit: false
      }
    };
  },
  methods: {
    addLeftItem() {
      if (this.left_location == 'subject') {
        if (this.isSingleEdit() || this.left_edit) {
          this.$refs.wrapper.message('请先完成当前课程的编辑')
        } else {
          var item = {
            name: '新课程',
            single_edit: true
          }
          this.left_list.push(item)
          this.$store.commit("setSubjectList", this.left_list);
        }

      } else if (this.left_location == 'chapter') {
        if (this.isSingleEdit() || this.left_edit) {
          this.$refs.wrapper.message('请先完成当前课程的编辑')
        } else {
          var item = {
            name: 'lesson' + (this.left_list.length + 1),
            single_edit: true
          }
          this.left_list.push(item)
        }
      }
    },
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
    single_confirm(item) {
      var _vm = this;
      item.single_edit = false;
      if (this.left_location == 'subject') {
        this.axios.post('/api/addSubject', {
          name: item.name
        }).then(res => {
          console.log(res)
          item.id = res.data.data.id;
          if (_vm.drag) {
            _vm.axios.post('/api/changeSubject', {
              dataList: _vm.left_list
            }).then(res => {
              console.log(res)
              _vm.drag = false
            })
          }
        })
      } else if (this.left_location == 'chapter') {
        this.axios.post('/api/addChapter', {
          subdirid: _vm.sub_nav[0].id,
          name: item.name
        }).then(res => {
          console.log(res)
          item.id = res.data.data.id;
          _vm.axios.post('/api/changeChapter', {
            subdirid: _vm.sub_nav[0].id,
            dataList: _vm.left_list
          }).then(res => {
            console.log(res)
            _vm.drag = false
          })
        })
      }
    },
    delLeftItem(item, index) {
      var _vm = this;
      this.left_list.splice(index, 1)
      if (!item.single_edit) {
        if (this.left_location == 'subject') {
          this.axios.post('/api/delSubject', {
            id: item.id
          }).then(res => {
            console.log(res)
          })
        } else if (this.left_location == 'chapter') {
          this.axios.post('/api/delChapter', {
            subdirid: _vm.sub_nav[0].id,
            id: item.id
          }).then(res => {
            console.log(res)
          })
        }
      }
    },
    switchEdit() {
      var _vm = this;
      console.log(this.left_list)
      for (var i = 0; i < this.left_list.length; i++) {
        if (this.left_list[i].single_edit) {
          this.$refs.wrapper.message("请先完成当前编辑");
          return;
        } else if (this.left_list[i].name == '') {
          this.$refs.wrapper.message("课程名字不能为空。");
          return;
        }
      }
      this.left_edit = !this.left_edit
      if (!this.left_edit) {
        if (this.left_location == 'subject') {
          this.axios.post('/api/changeSubject', {
            dataList: this.left_list
          }).then(res => {
            console.log(res)

          })
        } else if (this.left_location == 'chapter') {
          this.axios.post('/api/changeChapter', {
            subdirid: _vm.sub_nav[0].id,
            dataList: this.left_list
          }).then(res => {
            console.log(res)

          })
        }
      }
    },
    leftNameBlur(item, index) {
      this.left_list[index].name = this.$refs['leftInput' + index][0].value;
    },
    rightEnBlur(index) {
      this.right_list[index].en = this.$refs['rightEn' + index][0].value;
    },
    rightChBlur(index) {
      this.right_list[index].ch = this.$refs['rightCh' + index][0].value;
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
        this.axios.post('/api/getLetter', {
          subdirid: _vm.sub_nav[0].id,
          id: item.id
        }).then(res => {
          _vm.right_list = res.data.dataList.letter;
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
    onGragEnd() {},
    onGragUpdata() {
      this.drag = true
    },
    rightEdit(item, i) {
      var _vm = this;
      for (var x = 0; x < this.right_list.length; x++) {
        if (this.right_list[x].edit && i != x) {
          var _old = this.right_list[x];
          _old.edit = false
          this.$set(this.right_list, x, _old);
          this.axios.post('/api/changeLetter', {
            subdirid: _vm.sub_nav[0].id,
            lessonid: _vm.sub_nav[1].id,
            id: _vm.right_list[x].id,
            en: _vm.right_list[x].en,
            ch: _vm.right_list[x].ch
          }).then(res => {
            
          })
        }
      }
      var _item = item;
      _item.edit = !item.edit;
      this.$set(this.right_list, i, _item);
      if (!item.edit) {
        this.axios.post('/api/changeLetter', {
          subdirid: _vm.sub_nav[0].id,
          lessonid: _vm.sub_nav[1].id,
          id: item.id,
          en: item.en,
          ch: item.ch
        }).then(res => {
          
        })
      }
    },
    letterCancel() {
      this.newLetter.edit = !this.newLetter.edit;
      this.newLetter.en = "";
      this.newLetter.ch = "";
    },
    createLetter() {
      var _vm = this;
      this.axios.post('/api/addLetter', {
        subdirid: _vm.sub_nav[0].id,
        id: _vm.sub_nav[1].id,
        en: _vm.newLetter.en,
        ch: _vm.newLetter.ch
      }).then(res => {
        var _newletter = {
          en: _vm.newLetter.en,
          ch: _vm.newLetter.ch,
          id: res.data.id
        }
        _vm.right_list.push(_newletter);
        _vm.letterCancel();
      })
    },
    delLetter (item, index) {
      var _vm = this;
      this.axios.post('/api/delLetter', {
        subdirid: _vm.sub_nav[0].id,
        lessonid: _vm.sub_nav[1].id,
        id: item.id,
      }).then(res => {
        _vm.right_list.splice(index, 1);
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

  }
};