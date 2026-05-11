<!-- 视频控制组件 -->
<script setup lang="ts">
import { toRefs, watch, ref, onMounted, onUnmounted } from 'vue';
const props = defineProps({
  //  ctrlObj.value = {
  //   element: document.getElementById('pc-video'),要控制的video元素
  //   isShow: true,控住播放或暂停
  //   barWidth: 590, 进度条总长度建议根据hooks中的获取屏幕宽度的函数计算后传值
  // }
  ctrlObj: {
    type: Object,
    default() {
      return {};
    },
  },
});
const { ctrlObj } = toRefs(props);
const isPlay = ref(false);
const isMuted = ref(false);
const realTimeUpdate = ref();
//进度条播放进度
const barPercentage = ref(0);
//进度条总长度
const barValue = ref(0);
const emit = defineEmits(['playStatus']);
// 将控制视频播放的变量暴露给父组件
defineExpose({
  isPlay,
});
watch(isPlay, () => {
  if (isPlay.value === true) {
    ctrlObj.value.element.play();
    realTimeUpdate.value = setInterval(() => {
      handleProgressBar();
    }, 200);
    emit('playStatus', true);
  } else {
    ctrlObj.value.element.pause();
    clearInterval(realTimeUpdate.value);
    emit('playStatus', false);
  }
});
watch(isMuted, () => {
  if (isMuted.value === false) {
    ctrlObj.value.element.muted = false;
  } else {
    ctrlObj.value.element.muted = true;
  }
});
watch(ctrlObj, (newValue) => {
  barValue.value = newValue.barWidth;
});
onMounted(() => {
  barValue.value = ctrlObj.value.barWidth;
});
onUnmounted(() => {
  clearInterval(realTimeUpdate.value);
});
function handleProgressBar() {
  const duration = ctrlObj.value.element.duration; //  获取视频总长度
  const currentTime = ctrlObj.value.element.currentTime; //  获取当前播放时间
  let ratio = parseFloat(currentTime / duration + '');
  if (ctrlObj.value.element.readyState <= 0) {
    //  判断视频是否能够正常读取
    barPercentage.value = 0;
    return;
  }
  if (currentTime >= duration) {
    ratio = 1;
    clearInterval(realTimeUpdate.value);
    isPlay.value = true;
  }
  barPercentage.value = Math.floor(ratio * 100);
}
// 点击进度条快进或后退
function controllBar(e: any) {
  e = e || window.event;
  const nowProgress = e.offsetX;
  const nowDuration = ctrlObj.value.element.duration;
  barPercentage.value = Math.floor(
    parseFloat(nowProgress / barValue.value + '') * 100
  );
  ctrlObj.value.element.currentTime = parseFloat(
    parseFloat(nowProgress / barValue.value + '') * nowDuration + ''
  );
}
function fullScreen() {
  ctrlObj.value.element.webkitRequestFullScreen();
}
</script>
<template>
  <!-- 父组件上请用.playControll的display实现hover，show-controll支持的是一直显示的情景 -->
  <div :class="['playControll', ctrlObj.isShow ? 'big-controll' : '']">
    <div
      :class="['play-pause', isPlay ? 'pause-icon' : 'play-icon']"
      @click="isPlay = !isPlay"
    ></div>
    <div
      class="timebar"
      :style="{ width: ctrlObj.barWidth + 'px' }"
      @click="controllBar"
    >
      <span :style="{ width: barPercentage + '%' }"></span>
    </div>
    <div
      :class="['voice-mute', isMuted ? 'mute-icon' : 'voice-icon']"
      @click="isMuted = !isMuted"
    ></div>
    <div class="full-screen" @click="fullScreen()"></div>
  </div>
</template>

<style lang="scss" scoped>
.playControll {
  width: 390px;
  height: 40px;
  background: #aaaaaa;
  position: absolute;
  bottom: 35px;
  left: 50%;
  margin-left: -195px;
  z-index: 999999999;
  border-radius: 25px;
  opacity: 0.5;
  .play-pause {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 5px;
    left: 10px;
    cursor: pointer;
    background-size: cover;
  }
  .play-icon {
    background-image: url('@/assets/category/mooc/video-ctrl/icon-play.svg');
  }
  .pause-icon {
    background-image: url('@/assets/category/mooc/video-ctrl/icon-pause.svg');
  }
  .timebar {
    position: absolute;
    top: 16px;
    left: 45px;
    height: 6px;
    background: #222222;
    border-radius: 5px;
    cursor: pointer;
    span {
      display: block;
      height: 100%;
      overflow: hidden;
      background: white;
      border-radius: 5px;
    }
  }
  .voice-mute {
    width: 26px;
    height: 25px;
    display: inline-block;
    position: absolute;
    right: 10px;
    top: 5px;
    cursor: pointer;
    background-size: cover;
  }
  .voice-icon {
    background-image: url('@/assets/category/mooc/video-ctrl/icon-voice.svg');
  }
  .mute-icon {
    background-image: url('@/assets/category/mooc/video-ctrl/icon-mute.svg');
  }
}
.big-controll {
  width: 100%;
  border-radius: 0;
  bottom: 0;
  left: 0;
  margin-left: 0;
  .voice-mute {
    right: 45px;
  }
  .full-screen {
    width: 20px;
    height: 20px;
    background-image: url('@/assets/category/mooc/video-ctrl/full-screen.svg');
    background-size: contain;
    position: absolute;
    right: 15px;
    bottom: 12px;
    cursor: pointer;
  }
}
</style>
