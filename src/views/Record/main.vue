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
        <button
          class="edit_btn"
          @click="switchEdit"
          :class="{edited: left_edit, noedited: !left_edit}"
        ></button>
      </div>
      <draggable
        element="ul"
        :list="left_list"
        @end="onGragEnd"
        handle=".drag_btn"
        ghost-class="ghost"
        @update="onGragUpdata"
      >
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
            @blur="leftNameBlur(item,index)"
            :autofocus="item.single_edit"
          >
          <span
            class="close_btn"
            v-show="item.single_edit || left_edit"
            @click="delLeftItem(item,index)"
          ></span>
          <span class="confirm_btn" v-show="item.single_edit" @click="single_confirm(item)"></span>
          <span class="drag_btn" v-show="item.single_edit || left_edit"></span>
        </li>
      </draggable>
      <button class="add_btn" @click="addLeftItem">{{add_text}}</button>
    </template>
    <template v-slot:right>
      <div class="right_wrapper">
        <ul>
          <li v-for="(item, index) in right_list" :key="item.en + index" class="tag">
            <span
              class="edit_btn"
              @click="rightEdit(item, index)"
              :class="{edited: item.edit, noedited: !item.edit}"
            ></span>
            <span class="del_btn" @click="delLetter(item,index)"></span>
            <h2>
              <input
                type="text"
                placeholder="请输入单词"
                class="input_item"
                :value="item.en"
                :disabled="!item.edit"
                @blur="rightEnBlur(index)"
                :ref="'rightEn'+index"
              >
            </h2>
            <p>
              <textarea
                type="text"
                placeholder="请输入单词中文释义"
                class="input_item"
                :value="item.ch"
                :disabled="!item.edit"
                @blur="rightChBlur(index)"
                :ref="'rightCh'+index"
              ></textarea>
            </p>
            <div class="control_box"></div>
          </li>
        </ul>
        <div class="right_addBtn tag" v-show="right_location == 'letter'">
          <h2 :class="{show: newLetter.edit, hide: !newLetter.edit}">
            <input type="text" placeholder="请输入单词" class="input_item" v-model="newLetter.en">
          </h2>
          <p :class="{show: newLetter.edit, hide: !newLetter.edit}">
            <textarea type="text" placeholder="请输入单词中文释义" class="input_item" v-model="newLetter.ch"></textarea>
          </p>
          <div :class="{show: newLetter.edit, hide: !newLetter.edit}" class="control_box">
            <button class="confirm" @click="createLetter">确定</button>
            <button class="cancel" @click="newLetter.edit = !newLetter.edit">取消</button>
          </div>
          <div
            :class="{show: !newLetter.edit, hide: newLetter.edit}"
            class="add_pop"
            @click="letterCancel"
          >+</div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script src='./init.js'></script>

<style src="./style.css" scoped></style>