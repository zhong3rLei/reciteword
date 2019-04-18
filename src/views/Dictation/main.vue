<template>
  <Layout class="record_wrapper" ref="wrapper">
    <template v-slot:left>
      <div class="sub_nav">
        <span @click="toSubject">全部课程</span>
        <span
          class="behind"
          v-for="(item, index) in sub_nav"
          :key="item.name"
          @click="changeNav(index)"
        >{{item.name}}</span>
      </div>
      <ul>
        <li
          v-for="(item, index) in left_list"
          :key="item.name + index"
          @mousedown="toLesson(item)"
          :class="{edit_item: item.single_edit || left_edit}"
        >
          <input
            class="edit_box"
            :disabled="!item.single_edit && !left_edit"
            :value="item.name"
            :ref="'leftInput'+index"
            :autofocus="item.single_edit"
          >
        </li>
      </ul>
    </template>
    <template v-slot:right>
      <div class="right_wrapper">
        <ul>
          <li
            v-for="(item, index) in right_list"
            :key="item.en + index"
            class="tag"
          >
            <div class="back_wrap">
              <h2>{{item.ch}}</h2>
              <p>
                <input
                  type="text"
                  placeholder="请输入单词"
                  class="input_item"
                  :ref="'rightEn'+index"
                  :value="item.en"
                  @blur="enBlur(item, index)"
                >
              </p>
            </div>
          </li>
        </ul>
        <button class="submit_btn" v-show="right_list.length > 0" @click="submit">
          <span class="icon"></span>
          交卷
        </button>
      </div>
    </template>
  </Layout>
</template>

<script src='./init.js'></script>

<style src="./style.css" scoped></style>