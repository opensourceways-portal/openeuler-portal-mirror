<script lang="ts" setup>
import GuestCentent from './GuestCentent.vue';

defineProps({
  guestData: {
    type: Object,
    required: true,
    default: () => null,
  },
});
</script>

<template>
  <div class="guest">
    <p class="section-title">{{ guestData.title }}</p>
    <div v-for="item of guestData.list" :key="item.title" class="guest-wrapper">
      <p class="item-title">{{ item.title }}</p>
      <GuestCentent :lecturer-list="item.children" shape="circle" :web-columns-num="4" :mobile-columns-num="2" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.guest {
  margin-top: 72px;
  text-align: center;
  @media screen and (max-width: 768px) {
    margin-top: var(--e-spacing-h4);
  }
}
.item-title {
  margin-top: 24px;
  color: var(--o-color-info1);
  font-weight: 400;
  text-align: center;
  @include h2;
}
</style>
