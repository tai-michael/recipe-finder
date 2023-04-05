<template>
  <div class="recipe">
    <VLoadingSpinner v-if="loadingRecipe" />

    <div v-else-if="noUserRecipes" class="message">
      <div>
        <svg>
          <use :href="`${icons}#icon-smile`"></use>
        </svg>
      </div>
      <p>Start by adding a recipe.</p>
    </div>

    <div v-else-if="shouldShowMessage" class="message">
      <div>
        <svg>
          <use :href="`${icons}#icon-smile`"></use>
        </svg>
      </div>
      <p>Click on or add a recipe.</p>
    </div>

    <div v-else-if="shouldShowNothing"></div>

    <div v-else-if="renderRecipeError" class="message">
      <p>{{ renderRecipeError }}</p>
    </div>

    <VUserRecipe v-if="userRecipeSelected" />
  </div>
</template>

<script>
import VLoadingSpinner from './VLoadingSpinner.vue';
import VUserRecipe from '@/components/VUserRecipe.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapMutations } = createNamespacedHelpers('home');
import fracty from 'fracty';
// import _ from 'lodash';

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
      // REVIEW Instead of below, could get the value from init. Or, I could also use something like v-if="this.$router.currentRoute.value.path === '/login'". However, this would require that my url changes when I do a search (currently it doesn't).
      // existingRecipe: this.$route.params.id,
    };
  },
  watch: {
    '$route.query.userRecipeId'(newValue) {
      // TODO  This if-statement prevents rendering a recipe if user is simply uploading one. It's a band-aid fix for not being able to remove the userRecipeId query param.
      if (newValue !== 'draft') {
        console.log('container watcher triggered');
        this.$store.dispatch('home/renderUserRecipe', {
          id: newValue,
        });
      }
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
    noUserRecipes() {
      return !Object.keys(this.userRecipes).length;
    },
    shouldShowMessage() {
      return (
        (!this.$route.query.userRecipeId &&
          !this.$route.query.userRecipeQuery &&
          Object.keys(this.userRecipes).length) ||
        (this.$route.query.userRecipeQuery &&
          !this.$route.query.userRecipeId &&
          Object.keys(this.searchResultsDisplay).length)
      );
    },
    shouldShowNothing() {
      return (
        this.$route.query.userRecipeQuery &&
        !this.$route.query.userRecipeId &&
        !Object.keys(this.searchResultsDisplay).length
      );
    },
    userRecipeSelected() {
      return (
        Object.keys(this.userRecipe).length && this.$route.query.userRecipeId
      );
    },
  },
  methods: {
    // TODO delete the unused
    ...mapMutations({
      toggleRegisterModal: 'TOGGLE_REGISTER_MODAL',
    }),
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
    if (this.$route.query.userRecipeId) {
      this.$store.dispatch('home/renderUserRecipe', {
        id: this.$route.query.userRecipeId,
      });
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

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
