<template>
  <div class="search-container">
    <!-- <button
      @click="uploadUserRecipe"
      class="btn btn-success btn-lg btn__add-recipe"
    >
      <svg>
        <use :href="`${icons}#icon-add-circle-fill`"></use>
      </svg>
      <span>Add a recipe</span>
    </button> -->

    <VLoadingSpinner v-if="loadingUserRecipes || loadingSearchResults" />

    <VUserRecipePreview
      v-else-if="!$route.query.userRecipeQuery"
      :recipes="userRecipes"
      :resultsActive="true"
    />

    <div v-else-if="!Object.keys(searchResultsDisplay).length">
      <div class="error">
        <div>
          <svg>
            <use :href="`${icons}#icon-alert-triangle`"></use>
          </svg>
        </div>
        <div>
          <p>No recipes for your search terms were found.</p>
        </div>
      </div>

      <VUserRecipePreview :recipes="userRecipes" :resultsActive="true" />
    </div>

    <div
      v-else-if="
        searchResultsDisplay.length > 0 &&
        searchResultsDisplay.length < userRecipes.length
      "
    >
      <button @click="resetSearchResults" class="btn btn-primary btn-lg">
        <svg>
          <use :href="`${icons}#icon-go-back`"></use>
        </svg>
        <span>Back to all recipes</span>
      </button>
      <VUserRecipePreview
        :recipes="searchResultsDisplay"
        :resultsActive="true"
      />
    </div>

    <VUserRecipePreview
      v-else
      :recipes="searchResultsDisplay"
      :resultsActive="true"
    />
  </div>
</template>

<script>
import VUserRecipePreview from '@/components/VUserRecipePreview.vue';
import VLoadingSpinner from '@/components/VLoadingSpinner.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapMutations } = createNamespacedHelpers('home');

export default {
  name: 'VUserSearchResults',
  components: {
    VUserRecipePreview,
    VLoadingSpinner,
  },

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
    };
  },
  computed: {
    ...mapGetters({
      userRecipes: 'userRecipes',
      searchResults: 'userRecipeSearchResults',
      searchResultsDisplay: 'userRecipeSearchResultsDisplay',
      searchResultsCurrentPage: 'userRecipeSearchResultsCurrentPage',
      searchResultsPerPage: 'searchResultsPerPage',
      loadingSearchResults: 'loadingSearchResults',
      loadingUserRecipes: 'loadingUserRecipes',
    }),
    numPages() {
      return Math.ceil(
        this.searchResultsDisplay.length / this.searchResultsPerPage
      );
    },
    // isActive(resultId) {
    //   const id = window.location.hash.slice(1);
    //   if (resultId === id) return true;
    //   else return false;
    // },
  },

  methods: {
    ...mapMutations({
      updatePagination: 'UPDATE_PAGINATION',
      createSearchResults: 'CREATE_USER_RECIPE_SEARCH_RESULTS',
    }),

    resetSearchResults() {
      this.createSearchResults({ results: this.userRecipes, page: 1 });
      this.$router
        .replace({
          query: {
            userRecipeQuery: '',
          },
        })
        .catch(() => {});
    },

    uploadUserRecipe() {
      this.$router
        .replace({ name: 'upload', query: { userRecipeId: 'draft' } })
        .catch(() => {});
    },
  },

  // methods: {
  //   renderUserRecipe() {
  //     this.$store.dispatch('renderUserRecipe');
  //   },
  // },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

.search-container {
  // padding: 3rem 0;
  // display: flex;
  flex-direction: column;
  min-width: 245px !important;

  // NOTE gives the container a scroll bar when it exceeds the max-height
  // max-height: 700px;
  // overflow: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: lightgray;
  }

  @media only screen and (max-width: 648px) {
    border-bottom: 1px solid rgb(231, 231, 231);
    padding-bottom: 5px;
    // TODO test on actual mobile phone to see if there's enough space at the bottom for 'Add a recipe' button. If not, then decrease the max-height 'vh' to '60' or something.
    max-height: 70vh;
  }

  // .header {
  //   display: flex;
  //   margin-bottom: 2rem;
  //   justify-content: space-between;
  // }

  .btn {
    display: flex;
    width: 98%;
    margin: 1rem auto 2rem auto;
    align-items: center;
    justify-content: center;
    column-gap: 7px;

    svg {
      height: 2.25rem;
      width: 2.25rem;
      fill: currentColor;
      // margin-right: 5px;
      overflow: visible;
      align-self: center;
    }

    span {
      font-weight: 500;
      align-self: center;
      font-size: 14px;
    }

    &__add-recipe {
      @media only screen and (max-width: 648px) {
        display: none !important;
      }
    }
  }

  .error {
    max-width: 40rem;
    margin: 0 auto;
    margin-bottom: 1rem;
    padding: 3rem 2rem 1rem 2rem;
    display: flex;
    border-bottom: 1px solid grey;

    svg {
      height: 3rem;
      width: 3rem;
      fill: rgb(230, 71, 32);
    }
    p {
      margin-left: 1.5rem;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      font-weight: 600;
      line-height: 1.5;
    }
  }
}
</style>
