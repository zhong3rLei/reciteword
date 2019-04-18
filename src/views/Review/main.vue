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
          <li v-for="(item, index) in right_list" :key="item.en + index" class="tag" @click="rotateLetter(item, index)" :class="{rotated: item.rotate}">
            <div class="front_wrap">
              <h2>{{item.en}}<span class="play_audio" @click.stop="playAudio(item)"></span></h2>
              <div class="weight_tag" v-show="item.weightPercent > right_weight">
                <span class="star"></span>
              </div>
            </div>
            <div class="back_wrap">
              <h2>{{item.en}}<span class="play_audio" @click.stop="playAudio(item)"></span></h2>
              <p>{{item.ch}}</p>
              <div class="weight_tag" v-show="item.weightPercent > right_weight">
                <span class="star"></span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    <audio :src="letterAudioSrc" ref="letteraudio"></audio>
    </template>
  </Layout>
</template>

<script src='./init.js'></script>

<style src="./style.css" scoped></style>