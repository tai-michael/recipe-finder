<template>
  <ul :class="{ results: resultsActive }">
    <li
      class="preview"
      :class="{
        'preview__link--active': getId(recipe) === $route.query.id && image,
        'preview__bookmark-link-active':
          getId(recipe) === $route.query.id && !image && !resultsActive,
      }"
      v-for="recipe in recipes"
      :key="getId(recipe)"
    >
      <!-- v-if in router-link is needed to prevent TypeError: undefined -->
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
          data-bs-target="#searchResultsDropdown"
          data-bs-toggle="collapse"
          @click="scrollToTop"
        >
          <figure class="preview__fig" v-if="image">
            <img
              :src="recipe.image"
              :alt="recipe.label"
              @error="handleImageError"
            />
          </figure>

          <div class="preview__data">
            <div class="preview__container">
              <h4
                class="preview__title"
                :class="{
                  'preview__title--active': getId(recipe) === $route.query.id,
                }"
              >
                {{ recipe.label }}
              </h4>
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
            <!-- NOTE the container and its 100% 'width' is necessary for the publisher title to be truncated with ellipsis  -->
            <div class="preview__container">
              <h4 class="preview__publisher">
                {{ recipe.source }}
              </h4>
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
  name: 'VRecipePreview',

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
      errorCount: 0,
      maxErrorCount: 1,
    };
  },

  computed: {
    ...mapGetters(['searchResultsDisplay', 'recipeBookmarks']),
  },
  // watch: {
  //   image(newVal) {
  //     if (newVal === false && !this.resultsActive) {
  //       console.log('image set to false');
  //       this.$store.commit('home/SET_IMAGE_EXPIRATION_STATUS', true);
  //     }
  //   },
  // },
  methods: {
    isBookmarked(id) {
      // console.log(id);
      // console.log(this.recipeBookmarks);
      // console.log(this.recipeBookmarks[0].uri);
      // return this.recipeBookmarks.some(recipe => recipe.id === id);
      return this.recipeBookmarks.some(recipe => recipe.uri === id);
    },
    getId(recipe) {
      return getRecipeId(recipe);
    },
    handleImageError() {
      if (this.resultsActive) return;
      this.image = false;

      // NOTE Below method was meant to refresh the website whenever a recipe's image becomes unavailable (which happens because the edamame api image tokens expire after some time). However, this method can lead to infinite refreshes, as certain images are simply broken on the api's end.
      // this.errorCount++;
      // if (this.errorCount === this.maxErrorCount && this.resultsActive) {
      //   console.log('refreshing Search');
      //   this.$store.dispatch('home/refreshSearch');
      // }
      // // Reduce the error count to avoid calling the error handling method multiple times
      // this.errorCount = -1;
    },
    scrollToTop() {
      // NOTE timeout is necessary for mobile view b/c we need to wait for the 'collapsing' transition for the search results to finish before we can scroll to the top.
      if (window.innerWidth <= 648) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      } else {
        // NOTE smooth behavior is buggy; it stops sometimes mid-scroll to the top, unless the method is placed in setTimeout with 200-300 delay
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
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

// NOTE unnecessary because of v-if
// .hidden {
//   visibility: hidden;
//   opacity: 0;
// }

.preview {
  list-style: none;
  margin-bottom: 1px;

  &__link {
    padding: 0.75rem 1rem 0.75rem 0.75rem;

    &:link,
    &:visited {
      display: flex;
      align-items: center;
      transition: all 0.3s;
      border-right: 1px solid #fff;
      text-decoration: none;
    }

    @media (hover: hover) {
      &:hover {
        background-color: #efeff2;
        // transform: translateY(-2px);
        border-radius: 16px;
      }
    }

    &--active {
      background-color: #efeff2;
      border-radius: 16px;
    }

    &--image-error {
      padding: 1rem 1.5rem !important;
      @media (hover: hover) {
        &:hover {
          border-radius: 0;
        }
      }
    }
  }

  &__bookmark-link-active {
    background-color: #efeff2 !important;
  }

  &__fig {
    flex: 0 0 8rem;
    // border-radius: 50%;
    border-radius: 16px;
    overflow: hidden;
    height: 8rem;
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
    // display: grid;
    width: 100%;
    // grid-template-columns: 1fr 2.7rem;
    row-gap: 0.5rem;
    align-items: center;
    display: flex;
    align-items: start;
    flex-flow: column;
    justify-content: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__container {
    display: flex;
    flex-direction: row;
    // align-items: start;
    justify-content: space-between;
    width: 100%;
  }

  &__title {
    // grid-column: 1/-1;
    font-size: 1.45rem;
    color: black;
    text-transform: uppercase;
    font-weight: 600;

    // NOTE This is how text is truncated!
    text-overflow: ellipsis;
    // max-width: 160px;
    // white-space: nowrap;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    padding-right: 1rem;

    &--active {
      font-weight: 800;
    }
  }

  &__publisher {
    font-size: 1.15rem;
    color: $color-grey-dark-2;
    text-transform: uppercase;
    font-weight: 600;
    padding-right: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 15px;
    // max-width: 140px;
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
    // margin-left: auto;
    // margin-right: 1.75rem;

    // &--active {
    //   background-color: white;
    // }

    // svg {
    //   height: 1.2rem;
    //   width: 1.2rem;
    //   fill: $color-primary;
    // }
  }

  &__bookmarked {
    // background-color: darken($color-grey-light-2, 2%);

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

  // .btn--round {
  //   background-image: $gradient;
  //   border-radius: 50%;
  //   border: none;
  //   cursor: pointer;
  //   height: 4.5rem;
  //   width: 4.5rem;
  //   // margin-left: auto;
  //   transition: all 0.2s;

  //   display: flex;
  //   align-items: center;
  //   justify-content: center;

  //   &:hover {
  //     transform: scale(1.07);
  //   }

  //   &:focus {
  //     outline: none;
  //   }

  //   svg {
  //     height: 2.5rem;
  //     width: 2.5rem;
  //     fill: #fff;
  //   }
  // }
}
</style>
