<template>
  <ul :class="{ results: resultsActive }">
    <li
      class="preview"
      :class="{
        'preview__link--active': getId(recipe) === $route.query.id,
      }"
      v-for="recipe in recipes"
      :key="getId(recipe)"
    >
      <!-- NOTE v-if in router-link is needed to prevent TypeError: undefined -->
      <router-link
        :to="{
          name: 'home',
          query: {
            id: getId(recipe),
          },
        }"
        class="text-decoration-none"
        v-if="recipe"
        :title="recipe.label"
      >
        <div
          class="preview__link d-flex"
          :class="[
            !image && !resultsActive ? 'preview__link--image-error' : '',
          ]"
          @click="collapseSearchResults"
        >
          <figure class="preview__fig" v-if="image">
            <img
              :src="recipe.image"
              :alt="recipe.label"
              @error="handleImageError"
            />
          </figure>
          <div class="preview__data">
            <h4
              class="preview__title"
              :class="{
                'preview__title--active': getId(recipe) === $route.query.id,
              }"
            >
              {{ recipe.label }}
            </h4>
            <p class="preview__publisher">{{ recipe.source }}</p>
            <!-- NOTE uncomment to enable personal recipe tag -->
            <!-- <div v-if="recipe.user_generated">
            <div v-if="resultsActive" class="preview__user-generated">
              <h4>
                <span class="badge bg-primary text-uppercase">Personal</span>
              </h4>
            </div>
          </div> -->
            <div v-if="isBookmarked(recipe.uri)">
              <div
                v-if="resultsActive"
                class="preview__bookmarked btn--round"
                :class="{
                  'preview__bookmarked--active':
                    getId(recipe) === $route.query.id,
                }"
              >
                <svg>
                  <use :href="`${icons}#icon-favorite-fill`"></use>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </router-link>

      <!-- <a class="preview__link" :href="`#${recipe.id}`">
        <figure class="preview__fig">
          <img :src="recipe.image_url" :alt="recipe.title" />
        </figure>
        <div class="preview__data">
          <h4 class="preview__title">{{ recipe.title }}</h4>
          <p class="preview__publisher">{{ recipe.publisher }}</p>
          <div v-if="recipe.user_generated">
            <div v-if="resultsActive" class="preview__user-generated">
              <svg>
                <use :href="`${icons}#icon-user`"></use>
              </svg>
            </div>
          </div>
          <div v-if="isBookmarked(recipe.id)">
            <div v-if="resultsActive" class="preview__bookmarked btn--round">
              <svg>
                <use :href="`${icons}#icon-favorite-fill`"></use>
              </svg>
            </div>
          </div>
        </div>
      </a> -->
    </li>
  </ul>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');
import { getRecipeId } from '@/common/helpers.js';

export default {
  name: 'VRecipePreviewBookmarksMobile',

  props: {
    recipes: {
      type: Array,
      required: true,
    },
    resultsActive: {
      type: Boolean,
      default: false,
    },
    headerActive: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      image: true,
    };
  },

  computed: {
    ...mapGetters(['searchResultsDisplay', 'recipeBookmarks']),
  },
  methods: {
    isBookmarked(id) {
      return this.recipeBookmarks.some(recipe => recipe.uri === id);
    },
    getId(recipe) {
      return getRecipeId(recipe);
    },
    handleImageError() {
      this.image = false;
    },
    collapseSearchResults() {
      // console.log(
      //   this.$root.$children[0].$children[0].$refs.searchResults.$el.classList
      // );
      this.$root.$children[0].$children[0].$refs.searchResults.$el.classList.remove(
        'show'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

.results {
  list-style: none;
  margin-bottom: 1rem;
}

.preview {
  list-style: none;

  &__link {
    padding: 1.5rem 3.25rem;
    margin-bottom: 0.25rem;
    &:link,
    &:visited {
      display: flex;
      align-items: center;
      // padding: 1.5rem 3.25rem;
      transition: all 0.3s;
      border-right: 1px solid #fff;
      text-decoration: none;
    }

    @media (hover: hover) {
      &:hover {
        background-color: #efeff2;
        // margin: 0.25rem;
      }
    }

    &--active {
      background-color: #efeff2;
      // margin: 0.25rem;
    }

    &--image-error {
      padding: 1rem 1.5rem !important;
      // margin: 0.2rem 0;
    }
  }

  &__fig {
    flex: 0 0 5.8rem;
    border-radius: 50%;
    overflow: hidden;
    height: 5.8rem;
    margin-right: 2rem;
    position: relative;
    backface-visibility: hidden;

    &::before {
      content: '';
      display: block;
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      // background-image: linear-gradient(
      //   to right bottom,
      //   $color-grad-1,
      //   $color-grad-2
      // );
      opacity: 0.4;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.3s;
    }
  }

  &__data {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 2.7rem;
    row-gap: 0.1rem;
    align-items: center;
  }

  &__title {
    grid-column: 1/-1;
    font-size: 1.45rem;
    color: black;
    text-transform: uppercase;
    font-weight: 600;

    // NOTE This is how text is truncated!
    text-overflow: ellipsis;
    max-width: 40rem;
    white-space: nowrap;
    overflow: hidden;

    &--active {
      font-weight: 800;
    }
  }

  &__publisher {
    font-size: 1.15rem;
    color: $color-grey-dark-2;
    text-transform: uppercase;
    font-weight: 600;
  }

  &__user-generated {
    // background-color: darken($color-grey-light-2, 2%);

    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    width: 2rem;
    border-radius: 10rem;

    .badge {
      letter-spacing: 0.5px;
    }
  }

  &__bookmarked {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    width: 2rem;
    border-radius: 10rem;

    &--active {
      background-color: white;
    }

    svg {
      height: 1.5rem;
      width: 1.5rem;
    }
  }
}
</style>
