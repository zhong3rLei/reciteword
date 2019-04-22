<template>
  <div class="home">
    <div class="mission_box">
      <h2>每日推荐复习计划</h2>
      <ul class="recommend_list">
        <li v-for="item in todayList" :key="item.id">
          <h3>{{item.name}}</h3>
          <div class="lesson_item" v-for="lesson in item.list" :key="lesson.id">
            {{lesson.name}}
            <div class="control">
              <div class="btn" @click="toReview(item,lesson)">去复习</div>
              <div class="btn" @click="toDictation(item,lesson)">去测试</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src='./init.js'></script>

<style src="./style.css"></style>