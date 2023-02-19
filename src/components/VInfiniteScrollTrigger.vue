<template>
  <div class="spinner-container" ref="trigger">
    <VLoadingDots />
  </div>
</template>

<script>
import VLoadingDots from '@/components/VLoadingDots.vue';

export default {
  name: 'VInfiniteScrollTrigger',
  components: {
    VLoadingDots,
  },
  data() {
    return {
      observer: null,
      obsOptions: {
        root: null,
        threshold: 0,
      },
    };
  },
  methods: {
    handleIntersect(entry) {
      if (entry.isIntersecting) this.$emit('triggerIntersected');
    },
  },
  mounted() {
    // console.log('Trigger mounted');
    this.observer = new IntersectionObserver(entries => {
      this.handleIntersect(entries[0]);
    }, this.obsOptions);

    this.observer.observe(this.$refs.trigger);
  },

  destroyed() {
    // console.log('Trigger destroyed');
    this.observer.disconnect();
  },
};
</script>

<style lang="scss" scoped>
.spinner-container {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}
</style>
