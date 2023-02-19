<template>
  <div class="spinner">
    <span class="loader"></span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
    };
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

.spinner {
  margin: 2rem;
  text-align: center;

  .loader {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: inline-block;
    border-top: 4px solid #80a8ff;
    border-right: 4px solid transparent;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }
  .loader::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border-bottom: 4px solid #80a8ff;
    border-left: 4px solid transparent;
  }
  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
