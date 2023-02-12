<template>
  <span ref="trigger"><VLoadingSpinner /></span>
</template>

<script>
import VLoadingSpinner from '@/components/VLoadingSpinner.vue';

export default {
  name: 'VLoadMoreResultsTrigger',
  components: {
    VLoadingSpinner,
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
    console.log('Trigger mounted');
    this.observer = new IntersectionObserver(entries => {
      this.handleIntersect(entries[0]);
    }, this.obsOptions);

    this.observer.observe(this.$refs.trigger);
  },

  destroyed() {
    console.log('Trigger destroyed');
    this.observer.disconnect();
  },
};
</script>

<style lang="scss" scoped></style>
