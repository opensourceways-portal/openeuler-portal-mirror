<script lang="ts" setup>
import { useI18n } from '@/i18n';

import MiniCards from '../components/MiniCards.vue';
import MiniDescription from '../components/MiniDescription.vue';
import MiniFrame from '../components/MiniFrame.vue';
import MiniDocs from '../components/MiniDocs.vue';
import BannerLevel2 from '@/components/BannerLevel2.vue';
import AppContent from '@/components/AppContent.vue';

import banner from '@/assets/banner/banner-minisite.png';
import illustration from '@/assets/illustrations/minisite/a-tune.png';

const i18n = useI18n();
</script>
<template>
  <BannerLevel2
    class="banner"
    :title="i18n.atune.ATUNE_BANNER_TEXT[0]"
    :subtitle="i18n.atune.ATUNE_BANNER_TEXT[1]"
    :illustration="illustration"
    :background-image="banner"
    background-text="DISCOVERY"
  />
  <AppContent>
    <MiniCards :cards-link="i18n.atune.ATUNE_LINK" />
    <MiniDescription :description-desc="i18n.atune.ATUNE_DESC" />
    <MiniFrame :frame-obj="i18n.atune.ATUNE_FRAMEWORK" layout="upAndDown" />
    <MiniDocs :docs-obj="i18n.atune.ATUNE_DOCUMENT" />
  </AppContent>
</template>
