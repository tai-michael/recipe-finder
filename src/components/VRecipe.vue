<template>
  <div class="recipe">
    <VLoadingSpinner v-if="loadingRecipe" />

    <div v-else-if="Object.keys(recipe).length">
      <img
        :src="imageLoading ? placeholder : recipe.image"
        @load="imageLoading = false"
        @error="handleImageError"
        :alt="recipe.label"
        class="recipe__img"
      />

      <div class="recipe__title d-flex flex-row justify-content-between mb-2">
        <span>{{ recipe.label }}</span>
        <!-- NOTE uncomment to enable personal recipe tag -->
        <!-- <div
            v-if="recipe.user_generated"
            title="This recipe was created by you"
          >
            <h4>
              <span class="badge bg-primary text-uppercase">Personal</span>
            </h4>
          </div> -->
      </div>

      <div
        class="recipe__details justify-content-between flex-wrap-reverse gap-4 row-gap"
      >
        <div class="d-flex flex-row align-items-center">
          <div v-if="recipe.totalTime" class="recipe__info">
            <svg class="recipe__info-icon">
              <use :href="`${icons}#icon-clock`"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">{{
              recipe.totalTime
            }}</span>
            <span>minutes</span>
          </div>

          <div class="recipe__info">
            <svg class="recipe__info-icon-users">
              <use :href="`${icons}#icon-users`"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">{{
              recipe.yield
            }}</span>
            <span>
              <!-- {{ recipe.yield > 1 ? 'servings' : 'serving' }} -->
              serving(s)
            </span>

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
          <!-- NOTE uncomment to enable personal recipe buttons -->
          <!-- <button
          v-if="recipe.user_generated"
          @click="deleteUserRecipe"
          class="btn--round"
          title="Delete this recipe"
        >
          <svg>
            <use :href="`${icons}#icon-delete`"></use>
          </svg>
        </button> -->
          <button
            @click="copyRecipeLink"
            class="btn--round me-3"
            title="Copy link to this recipe"
          >
            <svg>
              <use :href="`${icons}#icon-link`"></use>
            </svg>
            <span>Share</span>
          </button>
          <button
            @click="bookmarkRecipe"
            class="btn--round"
            :title="`${recipeBookmarked ? 'Unsave' : 'Save'}`"
          >
            <svg class="btn--bookmark">
              <use
                :href="`${icons}#icon-favorite${
                  recipeBookmarked ? '-fill' : ''
                }`"
              ></use>
            </svg>
            <span>Save</span>
          </button>
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
            <!-- <div class="recipe__quantity">
              {{ ingQuantity(ing) }}
            </div>
            <div class="recipe__description">
              <span v-if="ing.measure !== '<unit>'" class="recipe__unit">{{
                ing.measure
              }}</span>
              {{ ing.food }}
            </div> -->
            <!-- !isNaN(ing.text.split(' ')[0]) -->
            <div>
              {{ ingDescription(ing) }}
            </div>
          </li>
        </ul>
      </div>

      <div class="recipe__nutrients">
        <h2 class="heading--2">Nutrients / serving</h2>
        <div class="recipe__nutrient-list">
          <div
            v-for="(column, i) in columns"
            :key="i"
            class="recipe__nutrient-column"
          >
            <div
              v-for="(item, index) in Object.keys(column)"
              :key="index"
              class="recipe__nutrient"
            >
              <svg class="bullet">
                <use :href="`${icons}#icon-bullet`"></use>
              </svg>
              <div>
                {{ column[item].label }} - {{ Math.round(column[item].quantity)
                }}{{ column[item].unit }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="recipe__directions">
        <h2 class="heading--2">Directions</h2>
        <p class="recipe__directions-text">
          This recipe was thoughtfully developed by
          <span class="recipe__publisher">{{ recipe.source }}</span
          >. You can find the instructions for the recipe on their website.
        </p>
        <a class="btn btn-outline-success" :href="recipe.url" target="_blank">
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
import VLoadingSpinner from './VLoadingSpinner.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapMutations } = createNamespacedHelpers('home');
import { getRecipeId } from '@/common/helpers.js';
import fracty from 'fracty';
import _ from 'lodash';

export default {
  name: 'VRecipe',
  components: { VLoadingSpinner },
  data() {
    return {
      // icons: '@/assets/images/icons.svg',
      icons: require('@/assets/images/icons.svg'),
      placeholder: require('@/assets/images/placeholder.jpg'),
      image_error: require('@/assets/images/image_error.jpg'),
      imageLoading: true,
      fracty,
      // REVIEW Instead of below, could get the value from init. Or, I could also use something like v-if="this.$router.currentRoute.value.path === '/login'". However, this would require that my url changes when I do a search (currently it doesn't).
      // existingRecipe: this.$route.params.id,
      // recipeServingsCopy: null,
      // recipeIngredientsCopy: {},
      recipe: {},
      // Could I instead make this a computed property that is based on window width? e.g. using the ternary operator, to give 2 if at or below mobile width, and 3 otherwise
      mobileView: false,
      // cols: 3,
    };
  },
  watch: {
    '$route.query.id'(newValue) {
      // console.log(newValue);
      this.renderAndCloneRecipe(newValue);
    },
    // 'recipe.image_url': function () {
    //   this.imageLoading = true;
    // },
  },
  computed: {
    ...mapGetters([
      // 'recipe',
      'recipeBookmarked',
      'loadingRecipe',
      'searchResultsDisplay',
      'recipeServings',
      'recipeIngredients',
    ]),
    stateRecipe() {
      return this.$store.getters['home/recipe'];
    },
    loggedIn() {
      return this.$store.getters['auth/loggedIn'];
    },
    cols: function () {
      return this.mobileView ? 2 : 3;
    },
    columns: function () {
      const labelsToSkip = [
        'Saturated',
        'Trans',
        'Monounsaturated',
        'Polyunsaturated',
        'Carbohydrates (net)',
      ];

      const filteredNutrients = Object.values(
        this.recipe.totalNutrients
      ).filter(val => !labelsToSkip.includes(val.label));

      for (let nutrient of filteredNutrients) {
        if (nutrient.label === 'Energy') {
          nutrient.label = 'Calories';
          nutrient.unit = '';
        }
      }

      let columns = [];
      let mid = Math.ceil(Object.keys(filteredNutrients).length / this.cols);

      for (let col = 0; col < this.cols; col++) {
        columns.push(
          Object.entries(filteredNutrients)
            .slice(col * mid, col * mid + mid)
            .map(entry => entry[1])
        );
      }
      return columns;
    },
  },
  methods: {
    ...mapMutations({
      toggleRegisterModal: 'TOGGLE_REGISTER_MODAL',
    }),
    parseFraction(fraction) {
      if (fraction.includes('/')) {
        const [numerator, denominator] = fraction.split('/').map(Number);
        return numerator / denominator;
      } else {
        const [numerator, denominator] = fraction.split('⁄').map(Number);
        return numerator / denominator;
      }
    },
    ingQuantity(ingredient) {
      return ingredient.quantity ? fracty(ingredient.quantity).toString() : '';
    },
    ingDescription(ingredient) {
      const parenthesesDeleted = ingredient.text.replace(/(\(.*?\))/, '');

      const splitWords = parenthesesDeleted.split(' ');

      for (const [i, word] of splitWords.entries()) {
        const normalizedWord = word.normalize('NFKD');
        if (normalizedWord.includes('⁄')) {
          splitWords.splice(
            splitWords.indexOf(word),
            1,
            this.parseFraction(normalizedWord)
          );
        }

        if (normalizedWord.includes('/')) {
          if (isNaN(word.split('/')[0]) || isNaN(word.split('/')[1])) {
            // console.log('triggered 2');
            splitWords.splice(splitWords[1], 1, ingredient.measure);
            return `${this.ingQuantity(ingredient)} ${splitWords.join(' ')}`;
          } else {
            splitWords.splice(i, 1, this.parseFraction(word));
          }
        }
      }

      if (!isNaN(splitWords[0]) && !isNaN(splitWords[1])) {
        splitWords[0] = +splitWords[0] + +splitWords[1];
        splitWords.splice(splitWords.indexOf(splitWords[1]), 1);
      }

      if (ingredient.quantity === 0 && isNaN(splitWords[0])) {
        // console.log('pure text');
        return ingredient.text;
      } else if (ingredient.quantity && isNaN(splitWords[0])) {
        if (!isNaN(splitWords[0].split('')[0]))
          return `${this.ingQuantity(ingredient)} ${
            ingredient.measure
          } ${splitWords.slice(1).join(' ')}`;

        return `${this.ingQuantity(ingredient)} ${
          splitWords.join(' ').charAt(0).toLowerCase() +
          splitWords.join(' ').slice(1)
        }`;
      } else {
        return `${this.ingQuantity(ingredient)} ${splitWords
          .slice(1)
          .join(' ')}`;
      }
    },

    updateServings(amount) {
      if (this.recipe.yield + amount <= 0) return;

      const prevServings = this.recipe.yield;
      this.recipe.yield += amount;
      this.recipe.ingredients.forEach(ing => {
        ing.quantity *= this.recipe.yield / prevServings;
      });
    },

    // updateServings(amount) {
    //   if (this.recipe.yield + amount <= 0) return;
    //   this.prevServings = this.recipe.yield;
    //   this.currentServings = this.recipe.yield + amount;
    /// then in the template:
    //     {{ ing.quantity * this.recipe.yield / prevServings }};
    // },

    bookmarkRecipe() {
      // if (!this.loggedIn) this.$router.push({ name: 'register' });
      if (!this.loggedIn) this.toggleRegisterModal();
      else this.$store.dispatch('home/toggleBookmark');
    },
    // deleteUserRecipe() {
    //   this.$store.dispatch('home/deleteUserRecipe', this.recipe);
    // },
    copyRecipeLink() {
      // FIXME change the base URL below after deploying this app
      navigator.clipboard.writeText(
        `https://epicurist.netlify.app/home?id=${getRecipeId(this.recipe)}`
      );
      this.$store.commit(
        'home/SET_TOAST_MESSAGE',
        'Recipe link copied to clipboard'
      );
    },
    async renderAndCloneRecipe(value) {
      await this.$store.dispatch('home/renderRecipe', {
        id: value,
      });

      this.recipe = _.cloneDeep(this.stateRecipe);
      console.log(this.recipe);
    },
    // async init() {
    //   if (this.$route.query.id) {
    //     await this.$store.dispatch('home/renderRecipe', {
    //       id: this.$route.query.id,
    //     });
    //     this.recipe = _.cloneDeep(this.stateRecipe);
    //   }
    // },
    handleResize() {
      this.mobileView = window.matchMedia('(max-width: 648px)').matches
        ? true
        : false;
    },

    handleImageError() {
      this.recipe.image = this.image_error;

      // NOTE Below method was meant to refresh the website whenever a recipe's image becomes unavailable (which happens because the edamame api image tokens expire after some time). However, this method can lead to infinite refreshes, as certain images are simply broken on the api's end.
      // console.log('refreshing Search');
      // this.$store.dispatch('home/refreshSearch');
    },
  },
  created() {
    // this.init();
    this.recipe = _.cloneDeep(this.stateRecipe);
    console.log(this.recipe);
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
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

  .btn--bookmark {
    fill: white;
    stroke: red;
    stroke-width: 2.5px;
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

// NOTE no need because of v-if
// .hidden {
//   visibility: hidden;
//   opacity: 0;
// }

//////////////////
/// From _recipe.scss

.recipe {
  background-color: white;
  padding-bottom: 1rem;

  @media only screen and (max-width: 648px) {
    margin-right: 0.6rem !important;
  }

  &__img {
    width: 100%;
    display: block;
    height: 200px;
    object-fit: cover;
    border-radius: 16px;

    @media only screen and (max-width: 767px) {
      // height: 60%;
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

  ///////////
  // DETAILS
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

  ///////////
  // INGREDIENTS
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

    @media all and (max-width: 648px) {
      // gap: 1.5rem 1.5rem;
      gap: 2.5rem 1.75rem;
    }
  }

  &__ingredient {
    display: flex;
    align-items: start;

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

  // &__quantity {
  //   margin-right: 0.5rem;
  //   flex: 0 0 auto;
  // }

  ///////////
  // NUTRIENTS

  &__nutrients {
    padding: 5rem 4rem;
    margin-bottom: 2rem;
    font-size: 1.6rem;

    display: flex;
    flex-direction: column;

    @media all and (max-width: 648px) {
      padding: 4rem 1rem;
    }
  }

  &__nutrient-list {
    // display: grid;
    // grid-template-columns: 1fr 1fr 1fr;
    // gap: 2.5rem 3rem;
    display: flex;
    list-style: none;
    justify-content: space-between;
    column-gap: 4rem;

    @media all and (max-width: 648px) {
      max-height: 900px !important;
      justify-content: center;
    }
  }

  &__nutrient-column {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;

    @media all and (max-width: 648px) {
      max-width: 135px;
    }
  }

  &__nutrient {
    display: flex;
    align-items: start;
    margin: 6px 0;

    .bullet {
      height: 1rem;
      width: 1rem;
      fill: $color-primary;
      margin-right: 1.1rem;
      flex: 0 0 auto;
      margin-top: 0.8rem;

      stroke: $color-primary;
      stroke-width: 1px;
    }
  }

  ///////////
  // DIRECTIONS
  &__directions {
    padding: 5rem 18rem;
    padding-bottom: 5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 12px;
    background-color: #efeff2;

    @media all and (max-width: 767px) {
      padding: 5rem 12rem;
    }

    @media all and (max-width: 648px) {
      padding: 4rem 5rem;
      margin-bottom: 1rem;
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
