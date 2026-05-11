<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { OIconLoading } from '@opensig/opendesign';

const props = defineProps<{
  pdfSource: string;
  page: number;
}>();

const emit = defineEmits(['loaded', 'error']);

const errorMessage = ref('');
const loading = ref(true);
const container = ref<HTMLElement | null>(null);

// 构建PDF URL
const pdfUrl = computed(() => {
  if (!props.pdfSource) {
    return '';
  }
  return props.page ? `${props.pdfSource}#page=${props.page}` : props.pdfSource;
});

// PDF加载完成事件
const onPdfLoaded = () => {
  loading.value = false;
  emit('loaded');
};

// PDF加载错误事件
const onPdfError = (event: any) => {
  loading.value = false;
  errorMessage.value = event?.message || 'PDF加载失败，请检查加载源是否正确';
  emit('error', errorMessage.value);
};

onMounted(() => {
  // 检查文档ID
  if (!props.pdfSource) {
    loading.value = false;
    errorMessage.value = '未提供PDF加载源';
    return;
  }
});

// 监听props变化
watch(
  () => props.pdfSource,
  (newId) => {
    if (newId) {
      loading.value = true;
      errorMessage.value = '';
    }
  }
);
</script>

<template>
  <div class="pdf-viewer" ref="container">
    <!-- PDF容器 -->
    <div class="pdf-content">
      <iframe v-if="pdfUrl" :src="pdfUrl" frameborder="0" class="pdf-iframe" @load="onPdfLoaded" @error="onPdfError"></iframe>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="pdf-loading">
      <div class="o-rotating">
        <OIconLoading />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: 100vw !important;
  height: 100vh !important;
  padding: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.pdf-content {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
</style>
