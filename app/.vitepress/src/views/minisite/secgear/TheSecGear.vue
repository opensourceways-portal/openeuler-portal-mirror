<script lang="ts" setup>
import { useI18n } from '@/i18n';

import MiniDescription from '../components/MiniDescription.vue';
import MiniFrame from '../components/MiniFrame.vue';
import MiniDocs from '../components/MiniDocs.vue';
import BannerLevel2 from '@/components/BannerLevel2.vue';
import AppContent from '@/components/AppContent.vue';

import illustration from '@/assets/illustrations/minisite/secgear.png';
import banner from '@/assets/banner/banner-minisite.png';

const i18n = useI18n();
</script>
<template>
  <BannerLevel2
    class="banner"
    :title="i18n.secgear.SECGEAR_BANNER_TEXT[0]"
    :subtitle="i18n.secgear.SECGEAR_BANNER_TEXT[1]"
    :illustration="illustration"
    :background-image="banner"
    background-text="DISCOVERY"
  />
  <AppContent>
    <MiniDescription :description-desc="i18n.secgear.SECGEAR_DESC" />
    <MiniFrame
      :frame-obj="i18n.secgear.SECGEAR_FRAMEWORK"
      layout="leftAndRight"
    />
    <!-- 文档 -->
    <MiniDocs :docs-obj="i18n.secgear.SECGEAR_DOCUMENT" />
  </AppContent>
</template>
