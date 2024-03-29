<template>
  <div class="recipe">
    <div>
      <img
        :src="imageLoading ? placeholder : recipe.image_url"
        @load="imageLoading = false"
        @error="recipe.image_url = image_error"
        :alt="recipe.title"
        class="recipe__img"
      />

      <div class="recipe__title d-flex flex-row justify-content-between mb-2">
        <span>{{ recipe.title }}</span>
      </div>

      <div
        class="recipe__details justify-content-between flex-wrap-reverse gap-5 row-gap"
      >
        <div class="d-flex flex-row align-items-center">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use :href="`${icons}#icon-clock`"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">{{
              recipe.cooking_time
            }}</span>
            <span>minutes</span>
          </div>

          <div class="recipe__info">
            <svg class="recipe__info-icon-users">
              <use :href="`${icons}#icon-users`"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">{{
              recipe.servings
            }}</span>
            <!-- <span>{{ recipe.servings > 1 ? 'servings' : 'serving' }}</span> -->
            <span>serving(s)</span>

            <div class="recipe__info-buttons">
              <button
                class="btn btn-outline-success"
                @click="updateServings(-1)"
              >
                <span> – </span>
              </button>
              <button
                class="btn btn-outline-success"
                @click="updateServings(1)"
              >
                <span> + </span>
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex flex-row align-items-end">
          <button
            @click="deleteUserRecipe"
            class="btn--round me-3"
            title="Delete this recipe"
          >
            <svg>
              <use :href="`${icons}#icon-delete`"></use>
            </svg>
            <span>Delete</span>
          </button>

          <button
            @click="editUserRecipe"
            class="btn--round"
            title="Edit this recipe"
          >
            <svg>
              <use :href="`${icons}#icon-edit`"></use>
            </svg>
            <span>Edit</span>
          </button>
          <!-- <button
            @click="bookmarkRecipe"
            class="btn--round"
            :title="`${
              recipeBookmarked ? 'Unsave this recipe' : 'Save this recipe'
            }`"
          >
            <svg class="btn--bookmark">
              <use
                :href="`${icons}#icon-favorite${
                  recipeBookmarked ? '-fill' : ''
                }`"
              ></use>
            </svg>
          </button> -->
        </div>
      </div>

      <div class="recipe__ingredients">
        <h2 class="heading--2">Ingredients</h2>
        <ul class="recipe__ingredient-list">
          <li
            class="recipe__ingredient"
            v-for="(ing, index) in recipe.ingredients"
            :key="index"
          >
            <svg class="bullet">
              <use :href="`${icons}#icon-bullet`"></use>
            </svg>
            <div class="recipe__quantity">
              {{ ingQuantity(ing) }}
            </div>
            <div class="recipe__description">
              <span class="recipe__unit">{{ ing.unit }}</span>
              {{ ing.description }}
            </div>
          </li>
        </ul>
      </div>

      <div class="recipe__directions">
        <h2 class="heading--2">Directions</h2>
        <p class="recipe__directions-text">
          This recipe was thoughtfully developed by
          <span class="recipe__publisher">{{ recipe.publisher }}</span
          >. You can find the instructions for it on their website.
        </p>
        <a
          class="btn btn-outline-success"
          :href="recipe.source_url"
          target="_blank"
        >
          <span>Directions </span>
          <svg class="search__icon">
            <use :href="`${icons}#icon-arrow-right`"></use>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');
import fracty from 'fracty';
import _ from 'lodash';

export default {
  name: 'VUserRecipe',
  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      placeholder: require('@/assets/images/placeholder.jpg'),
      image_error: require('@/assets/images/image_error.jpg'),
      imageLoading: true,
      fracty,
      recipe: {},
    };
  },
  watch: {
    stateRecipe() {
      console.log('child component watcher triggered');
      this.recipe = _.cloneDeep(this.stateRecipe);
    },
    'recipe.image_url': function () {
      this.imageLoading = true;
    },
  },
  computed: {
    ...mapGetters({
      stateRecipe: 'userRecipe',
      userRecipes: 'userRecipes',
      searchResultsDisplay: 'userRecipeSearchResultsDisplay',
      loadingRecipe: 'loadingRecipe',
      renderRecipeError: 'renderRecipeError',
      // recipeBookmarked: 'recipeBookmarked',
    }),
    loggedIn() {
      return this.$store.getters['auth/loggedIn'];
    },
  },
  methods: {
    async renderAndCloneRecipe(value) {
      await this.$store.dispatch('home/renderUserRecipe', {
        id: value,
      });

      this.recipe = _.cloneDeep(this.stateRecipe);
      console.log(this.recipe);
    },
    ingQuantity(ingredient) {
      return ingredient.quantity ? fracty(ingredient.quantity).toString() : '';
    },
    updateServings(amount) {
      if (this.recipe.servings + amount <= 0) return;

      const prevServings = this.recipe.servings;
      this.recipe.servings += amount;
      this.recipe.ingredients.forEach(ing => {
        ing.quantity *= this.recipe.servings / prevServings;
      });
    },
    editUserRecipe() {
      this.$router.push({ name: 'edit' }).catch(() => {});
    },
    deleteUserRecipe() {
      this.$store.dispatch('home/deleteUserRecipe');
    },
  },
  mounted() {
    this.recipe = _.cloneDeep(this.stateRecipe);
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

.btn {
  padding: 1.5rem 4rem;
  font-size: 1.5rem;
  font-weight: 600;

  svg {
    height: 2.25rem;
    width: 2.25rem;
    fill: currentColor;
  }
}

.btn--round {
  height: 3.8rem;
  border-radius: 18px;
  font-family: inherit;
  color: inherit;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  padding: 0 1.3rem;
  transition: all 0.25s;
  // transition: border-bottom 0.25s;
  // added below just for non-bootstrap version
  // text-decoration: none;
  // border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;

  svg {
    height: 2.4rem;
    width: 2.4rem;
    fill: black;
    margin-right: 0.7rem;
    @media only screen and (max-width: 767px) {
      height: 1.8rem;
      width: 1.8rem;
    }
  }

  @media (hover: hover) {
    &:hover {
      background-color: rgb(230, 230, 230);
    }
  }

  @media only screen and (max-width: 767px) {
    height: 3.15rem;
    font-size: 13px;
  }
}

.heading--2 {
  font-size: 2rem;
  font-weight: 700;
  color: black;
  text-transform: uppercase;
  margin-bottom: 3.5rem;
  text-align: center;
  // transform: skewY(-3deg);
}

.row-gap {
  row-gap: 3.4rem !important;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

.recipe {
  background-color: white;
  // max-width: 984px;

  &__img {
    width: 100%;
    display: block;
    height: 240px;
    object-fit: cover;
    border-radius: 16px;

    @media only screen and (max-width: 767px) {
      // height: 60%;
      padding-right: 0 !important;
      padding-left: 0 !important;
      height: 200px;
    }
  }

  &__title {
    font-size: 36px;
    font-family: DD-TTNorms, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol';
    font-weight: 700;
    // line-height: 48px;
    letter-spacing: -0.04ch;
    text-transform: capitalize;
    color: rgb(25, 25, 25);
    margin: 25px 0 0 0;
    // text-align: center;
    padding: 0px;
    display: block;
    font-variant-ligatures: no-common-ligatures;

    @media only screen and (max-width: 767px) {
      font-size: 22px;
    }
  }

  // NOTE DETAILS
  &__details {
    display: flex;
    // align-items: center;
    padding: 1rem 0 3.5rem 0;
  }

  &__info {
    font-size: 1.65rem;
    text-transform: uppercase;
    display: flex;
    align-items: center;

    &:not(:last-child) {
      margin-right: 3rem;
    }
  }

  &__info-icon {
    height: 2.8rem;
    width: 2.8rem;
    // fill: $color-primary;
    margin-right: 0.6rem;
    margin-bottom: 0.3rem;
    // fill: $color-primary;
    // stroke: $color-primary;
    // stroke-width: 0;
  }

  &__info-icon-users {
    height: 2.8rem;
    width: 2.8rem;
    // fill: $color-primary;
    // margin-top: 0.1rem;
    margin-right: 0.6rem;
    // fill: $color-primary;
    // stroke: $color-primary;
    // stroke-width: 0;
  }

  &__info-data {
    margin-right: 0.5rem;
    font-weight: 700;
  }

  &__info-buttons {
    display: flex;
    margin-left: 1rem;
    column-gap: 0.5rem;

    .btn-outline-success {
      height: 2.3rem;
      border-width: 0.2rem;
      font-size: 2rem;
      padding: 0;
      display: flex;
      align-items: center;
      transition: all 0.25s;
      justify-content: center;
      align-content: center;

      span {
        display: flex;
        height: 2rem;
        width: 2rem;
        justify-content: center;
        align-items: center;
        padding-bottom: 2.5px;
        @media only screen and (max-width: 648px) {
          padding-bottom: 0;
        }
      }
    }
  }

  &__user-generated {
    background-color: darken($color-grey-light-2, 2%);

    display: flex;
    align-items: center;
    justify-content: center;
    height: 4.5rem;
    width: 4.5rem;
    border-radius: 8rem;

    margin-left: auto;
    margin-right: 1.75rem;

    @media only screen and (max-width: 767px) {
      height: 3.15rem;
      width: 3.15rem;
    }

    svg {
      height: 2.5rem;
      width: 2.5rem;
      // fill: $color-grad-2;
      fill: black;

      @media only screen and (max-width: 767px) {
        height: 1.75rem;
        width: 1.75rem;
      }
    }
  }

  // NOTE INGREDIENTS
  &__ingredients {
    padding: 5rem 4rem;
    margin-bottom: 2rem;
    font-size: 1.6rem;
    line-height: 1.4;
    background-color: #efeff2;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 12px;

    @media all and (max-width: 648px) {
      padding: 4rem 1.5rem;
    }
  }

  &__ingredient-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem 3rem;
    list-style: none;
  }

  &__ingredient {
    display: flex;

    .bullet {
      height: 1rem;
      width: 1rem;
      fill: $color-primary;
      margin-right: 1.1rem;
      flex: 0 0 auto;
      margin-top: 0.7rem;

      stroke: $color-primary;
      stroke-width: 1px;
    }
  }

  &__icon {
    height: 2rem;
    width: 2rem;
    fill: $color-primary;
    margin-right: 1.1rem;
    flex: 0 0 auto;
    margin-top: 0.1rem;
  }

  &__quantity {
    margin-right: 0.5rem;
    flex: 0 0 auto;
  }

  // NOTE DIRECTIONS
  &__directions {
    padding: 5rem 18rem;
    padding-bottom: 5rem;
    display: flex;
    flex-direction: column;
    align-items: center;

    @media all and (max-width: 767px) {
      padding: 5rem 12rem;
    }

    @media all and (max-width: 648px) {
      padding: 4rem 5rem;
    }
  }

  &__directions-text {
    font-size: 1.7rem;
    text-align: center;
    margin-bottom: 3.5rem;
    color: $color-grey-dark-2;
  }

  &__publisher {
    font-weight: 700;
  }
}
</style>
