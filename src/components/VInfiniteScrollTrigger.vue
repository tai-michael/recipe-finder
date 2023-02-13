<template>
  <div class="spinner-container" ref="trigger">
    <span class="spinner-border" role="status" aria-hidden="true"></span>
  </div>
</template>

<script>
export default {
  name: 'VInfiniteScrollTrigger',
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
  .spinner-border {
    padding: 3rem auto;
  }
}
</style>
