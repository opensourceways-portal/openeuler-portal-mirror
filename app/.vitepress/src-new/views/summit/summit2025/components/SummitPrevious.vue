<script setup lang="ts">
import { OIcon } from '@opensig/opendesign';
import { useData } from 'vitepress';

import IconReview from '~icons/app-new/icon-review.svg';

import { useCommon } from '@/stores/common';

defineProps({
  previousData: {
    type: Object,
    required: true,
    default: () => null,
  },
});

const { lang } = useData();

const commonStore = useCommon();
</script>

<template>
  <div v-if="lang === 'zh'" class="previous">
    <div class="section-title">
      <p>{{ previousData.title }}</p>
      <OIcon><IconReview /></OIcon>
    </div>
    <div class="link-box">
      <a
        v-for="item in previousData.list"
        :key="item.link"
        :href="item.link"
      >
        {{ item.name }}
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.previous {
  margin-top: 72px;
  text-align: center;
  @media screen and (max-width: 768px) {
    margin-top: var(--e-spacing-h4);
  }

  .link-box {
    margin-top: var(--e-spacing-h3);
    display: inline-flex;
    flex-direction: column;
    @media screen and (max-width: 768px) {
      margin-top: var(--e-spacing-h6);
    }
    a {
      font-size: var(--e-font-size-h6);
      line-height: var(--e-line-height-h6);
      @media screen and (max-width: 768px) {
        font-size: var(--e-font-size-tip);
        line-height: var(--e-line-height-tip);
      }
      & + a {
        margin-top: var(--e-spacing-h4);
        @media screen and (max-width: 768px) {
          margin-top: var(--e-spacing-h8);
        }
      }
    }
  }
}
</style>
