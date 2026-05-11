<script lang="ts" setup>
import { useI18n } from '@/i18n';

import MiniCards from '../components/MiniCards.vue';
import MiniDescription from '../components/MiniDescription.vue';
import MiniFrame from '../components/MiniFrame.vue';
import MiniDocs from '../components/MiniDocs.vue';
import MiniFeatures from './MiniFeatures.vue';
import BannerLevel2 from '@/components/BannerLevel2.vue';
import AppContent from '@/components/AppContent.vue';

import illustration from '@/assets/illustrations/minisite/stratovirt.png';
import banner from '@/assets/banner/banner-minisite.png';

const i18n = useI18n();
</script>
<template>
  <BannerLevel2
    class="banner"
    :title="i18n.stratovirt.SVIRT_BANNER_TEXT[0]"
    :subtitle="i18n.stratovirt.SVIRT_BANNER_TEXT[1]"
    :illustration="illustration"
    :background-image="banner"
    background-text="DISCOVERY"
  />
  <AppContent>
    <!-- 卡片 -->
    <MiniCards :cards-link="i18n.stratovirt.SVIRT_LINK" />
    <!-- 中间文字介绍部分 -->
    <MiniDescription :description-desc="i18n.stratovirt.SVIRT_DESC" />
    <!-- 特征 -->
    <MiniFeatures :features-obj="i18n.stratovirt.SVIRT_CHARACTER" />
    <!-- 架构 -->
    <MiniFrame
      :frame-obj="i18n.stratovirt.SVIRT_FRAMEWORK"
      layout="leftAndRight"
    />
    <!-- 文档 -->
    <MiniDocs :docs-obj="i18n.stratovirt.SVIRT_DOCUMENT" />
  </AppContent>
</template>
