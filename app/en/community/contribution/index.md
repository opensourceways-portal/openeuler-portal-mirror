---
title: 'Contribution'
---

<script lang="ts" setup>
import ContributionMap from "@/views/contribution/ContributionMap.vue";
import ContributionTab from "@/views/contribution/ContributionTab.vue";
import BannerLevel2 from '@/components/BannerLevel2.vue'

import banner from '@/assets/banner/banner-community.png';
import illustration from '@/assets/illustrations/contribution.png';
</script>

<div>
  <ClientOnly>
    <BannerLevel2
      title="How to Contribute"
      :illustration="illustration"
      :background-image="banner"
      background-text="COMMUNITY"
    />
  </ClientOnly>
  <ContributionTab />
  <ContributionMap />

</div>
