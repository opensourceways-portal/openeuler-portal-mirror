<script lang="ts" setup>
import { computed } from 'vue';

import { useCommon } from '@/stores/common';

defineProps({
  introduceData: {
    type: Object,
    required: true,
    default: () => null,
  },
});

const commonStore = useCommon();
const isDark = computed(() => {
  return commonStore.theme === 'dark' ? true : false;
});
</script>

<template>
  <div class="introduce">
    <ul class="desc">
      <li v-for="li in introduceData.desc">
        {{ li }}
      </li>
    </ul>
    <p class="tips">{{ introduceData.tips }}</p>
    <ul class="list">
      <li v-for="li in introduceData.list" v-dompurify-html="li"></li>
    </ul>
    <ul class="slogan">
      <li v-for="li in introduceData.slogan">
        {{ li }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.introduce {
  font-size: var(--e-font-size-h6);
  line-height: var(--e-line-height-h6);
  color: var(--e-color-text1);

  .desc {
    li:not(:first-child) {
      margin-top: 12px;
    }
  }

  .tips {
    margin-top: 12px;
  }

  .list {
    padding-left: 24px;
    list-style-type: disc;
    li {
      margin-top: 12px;
      :deep(.blod) {
        font-weight: 600;
      }
    }
  }

  .slogan {
    li {
      margin-top: 12px;
    }
  }

  @media screen and (max-width: 768px) {
    font-size: var(--e-font-size-text);
    line-height: var(--e-line-height-text);
  }
}
</style>
