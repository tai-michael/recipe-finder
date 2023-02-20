<template>
  <ul class="bookmarks__list">
    <VLoadingSpinner v-if="loadingBookmarks" />
    <!-- Change condition to if fetch results in nothing -->
    <div class="message" v-else-if="recipeBookmarks.length === 0">
      <div>
        <svg>
          <use :href="`${icons}#icon-smile`"></use>
        </svg>
      </div>
      <p>Bookmark a recipe you like!</p>
    </div>

    <VRecipePreviewBookmarksMobile v-else :recipes="recipeBookmarks" />
  </ul>
</template>

<script>
import VLoadingSpinner from './VLoadingSpinner.vue';
import VRecipePreviewBookmarksMobile from '@/components/VRecipePreviewBookmarksMobile.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');

export default {
  name: 'VBookmarks',
  components: {
    VRecipePreviewBookmarksMobile,
    VLoadingSpinner,
  },
  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
    };
  },
  computed: {
    ...mapGetters(['recipeBookmarks', 'loadingBookmarks']),
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

.bookmarks__list {
  margin: 0 0.25rem;
  max-height: 75vh !important;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: lightgray;
  }
}

.message {
  max-width: 40rem;
  margin: 0 auto;
  padding: 5rem 4rem;

  display: flex;

  svg {
    height: 3rem;
    width: 3rem;
    fill: $color-primary;
    transform: translateY(-0.3rem);
  }

  p {
    margin-left: 1.5rem;
    font-size: 1.8rem;
    line-height: 1.5;
    font-weight: 600;
  }
}
</style>
