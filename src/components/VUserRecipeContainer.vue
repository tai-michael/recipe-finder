<template>
  <div class="recipe">
    <VLoadingSpinner v-if="loadingRecipe" />

    <div v-else-if="!Object.keys(userRecipes).length" class="message">
      <div>
        <svg>
          <use :href="`${icons}#icon-smile`"></use>
        </svg>
      </div>
      <p>Start by adding a recipe.</p>
    </div>

    <div
      v-else-if="
        (!$route.query.userRecipeId &&
          !$route.query.userRecipeQuery &&
          Object.keys(userRecipes).length) ||
        ($route.query.userRecipeQuery &&
          !$route.query.userRecipeId &&
          Object.keys(searchResultsDisplay).length)
      "
      class="message"
    >
      <div>
        <svg>
          <use :href="`${icons}#icon-smile`"></use>
        </svg>
      </div>
      <p>Click on or add a recipe.</p>
    </div>

    <div
      v-else-if="
        $route.query.userRecipeQuery &&
        !$route.query.userRecipeId &&
        !Object.keys(searchResultsDisplay).length
      "
    ></div>

    <div v-else-if="renderRecipeError" class="message">
      <p>{{ renderRecipeError }}</p>
    </div>

    <VUserRecipe v-if="Object.keys(userRecipe).length" />
  </div>
</template>

<script>
import VLoadingSpinner from './VLoadingSpinner.vue';
import VUserRecipe from '@/components/VUserRecipe.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapMutations } = createNamespacedHelpers('home');
import fracty from 'fracty';
import _ from 'lodash';

export default {
  name: 'VUserRecipeContainer',
  components: { VLoadingSpinner, VUserRecipe },
  data() {
    return {
      // icons: '@/assets/images/icons.svg',
      icons: require('@/assets/images/icons.svg'),
      placeholder: require('@/assets/images/placeholder.jpg'),
      image_error: require('@/assets/images/image_error.jpg'),
      imageLoading: true,
      fracty,
      recipe: {},
      // REVIEW Instead of below, could get the value from init. Or, I could also use something like v-if="this.$router.currentRoute.value.path === '/login'". However, this would require that my url changes when I do a search (currently it doesn't).
      // existingRecipe: this.$route.params.id,
    };
  },
  watch: {
    '$route.query.userRecipeId'(newValue) {
      // TODO  This if-statement prevents rendering a recipe if user is simply uploading one. It's a band-aid fix for not being able to remove the userRecipeId query param.
      if (newValue && newValue !== 'draft') this.renderAndCloneRecipe(newValue);
    },
    'recipe.image_url': function () {
      this.imageLoading = true;
    },
  },
  computed: {
    ...mapGetters({
      userRecipe: 'userRecipe',
      userRecipes: 'userRecipes',
      searchResultsDisplay: 'userRecipeSearchResultsDisplay',
      loadingRecipe: 'loadingRecipe',
      renderRecipeError: 'renderRecipeError',
      // recipeBookmarked: 'recipeBookmarked',
    }),
    loggedIn() {
      return this.$store.getters['auth/loggedIn'];
    },
    // validRecipe() {
    //   if (Object.keys(this.recipe).length) return true;
    //   return false;
    // },
  },
  methods: {
    // TODO delete the unused
    ...mapMutations({
      toggleRegisterModal: 'TOGGLE_REGISTER_MODAL',
    }),
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
    // bookmarkRecipe() {
    //   // if (!this.loggedIn) this.$router.push({ name: 'register' });
    //   if (!this.loggedIn) this.toggleRegisterModal();
    //   else this.$store.dispatch('home/toggleBookmark', this.recipe);
    // },
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

    // TODO move this to either App.vue, VHome.vue, upon login, or upon user state change.
    // Concerns: if I put this in App, it would render the recipe even if I begin in another tab, thereby using resources and slowing things down. Or maybe that doesn't matter?
    // I could try to avoid the above issue by putting the function in Home, but I would also need to fetch user and fetch user recipes if I begin in another tab. So perhaps App is where I fetchUser and fetchUserRecipes. Home is where I render the recipe, user recipes tab is where I do something else. This separation makes sense, but how do I ensure that renderUserRecipe is only dispatched after fetchUser and fetchUserRecipes? Does it go by order automatically, since App is the base level? Could try to experiment.

    // TODO probably put this in RecipePreview and make it execute upon clicking a preview. Though perhaps also leave it in mounted() below in case of reloading or pasting in a recipe URL.
    // async renderNewRecipe() {
    //   try {
    //     window.addEventListener('hashchange', async () => {
    //       await this.$store.dispatch('home/renderUserRecipe', {
    //         id: this.$route.hash.slice(1),
    //       });
    //     });
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },
  },
  created() {
    // this.init();
    // this.renderNewRecipe();
    // this.$store.dispatch('home/reloadSearchResults');
    // document.addEventListener('visibilitychange', () => {
    //   if (document.visibilityState === 'hidden') {
    //     this.$store.dispatch('home/uploadBookmarks');
    //   }
    // });
    // NOTE if you reload from edit or upload view, the action below allows for the correct recipe to render after its preview is clicked (because recipe view is not created after you reload)
    // if (this.$route.query.userRecipeId) {
    // }
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
      height: 2rem;
      width: 2rem;
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
  margin-bottom: 4rem;
  text-align: center;
  // transform: skewY(-3deg);
}

.row-gap {
  row-gap: 2.4rem !important;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

// NOTE no need because of v-if
// .hidden {
//   visibility: hidden;
//   opacity: 0;
// }

.message {
  justify-content: center;
  max-width: 40rem;
  margin: 0 auto;
  padding: 5rem 4rem;
  display: flex;

  svg {
    height: 3rem;
    width: 3rem;
    // fill: $color-primary;
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
