<template>
  <div class="search-container">
    <div v-if="!$route.query.query"></div>
    <VLoadingSpinner v-else-if="loadingSearchResults" />
    <div v-else-if="searchRecipesError" class="error">
      <div>
        <svg>
          <use :href="`${icons}#icon-alert-triangle`"></use>
        </svg>
      </div>
      <div>
        <p>{{ searchRecipesError }}</p>
      </div>
    </div>

    <VRecipePreview v-else :recipes="searchResults" :resultsActive="true" />

    <VInfiniteScrollTrigger
      v-if="
        $route.query.query &&
        searchResults.length &&
        !loadingSearchResults &&
        !loadingMoreResults &&
        nextResultsLink &&
        numPages < pageLimit
      "
      @triggerIntersected="goToNextPage()"
    />

    <div v-if="loadingMoreResults" class="spinner-container">
      <span class="spinner-border" role="status" aria-hidden="true"></span>
    </div>
  </div>
</template>

<script>
import VRecipePreview from '@/components/VRecipePreview.vue';
import VLoadingSpinner from '@/components/VLoadingSpinner.vue';
import VInfiniteScrollTrigger from '@/components/VInfiniteScrollTrigger.vue';
import { API_SEARCH_RESULTS_PAGE_LIMIT } from '@/common/config.js';
import axios from 'axios';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');

export default {
  name: 'VSearchResults',
  components: {
    VRecipePreview,
    VLoadingSpinner,
    VInfiniteScrollTrigger,
  },

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      loadingMoreResults: false,
      // searchResultsObserver: null,
    };
  },
  computed: {
    ...mapGetters([
      'searchResults',
      'searchResultsDisplay',
      'searchResultsCurrentPage',
      'searchResultsPerPage',
      'loadingSearchResults',
      'searchRecipesError',
      'nextResultsLink',
    ]),
    numPages() {
      return Math.ceil(this.searchResults.length / this.searchResultsPerPage);
    },
    // isActive(resultId) {
    //   const id = window.location.hash.slice(1);
    //   if (resultId === id) return true;
    //   else return false;
    // },
    pageLimit() {
      return API_SEARCH_RESULTS_PAGE_LIMIT;
    },
  },

  methods: {
    // ...mapMutations({ updatePagination: 'UPDATE_PAGINATION' }),
    async goToNextPage() {
      try {
        // FIXME Triggering the goToNextPage method in fast succession can result in duplicate keys error for recipe previews. Fixed by filtering out duplicate recipes in ADD_SEARCH_RESULTS, but there probably is a better way to circumvent this (e.g. not allowing trigger to remount while recipes are still loading. I attempt to do this in the setTimeout below, but it's still buggy sometimes).
        // console.log('Infinite scroll triggered');
        this.loadingMoreResults = true;
        const res = await axios.get(this.nextResultsLink);
        console.log(res.data);

        Object.keys(res.data._links).length
          ? this.$store.commit(
              'home/CREATE_NEXT_SEARCH_RESULTS_LINK',
              res.data._links.next.href
            )
          : this.$store.commit('home/CREATE_NEXT_SEARCH_RESULTS_LINK', null);

        const newResults = res.data.hits.map(hit => hit.recipe);
        this.$store.commit('home/ADD_SEARCH_RESULTS', newResults);

        // NOTE mostly prevents rapid API calls for more results, and therefore key redundancy errors. There's probably be a better way to circumvent the errors.
        setTimeout(() => {
          this.loadingMoreResults = false;
        }, 2000);

        this.$store.commit('home/UPDATE_PAGINATION', 1);
      } catch (err) {
        console.log(err);
        this.loadingMoreResults = false;
      }
    },
    // goToPreviousPage() {
    //   this.$store.commit('home/UPDATE_PAGINATION', -1);
    //   window.scrollTo({ top: 0, behavior: 'instant' });
    // },
  },
  // methods: {
  //   renderRecipe() {
  //     this.$store.dispatch('renderRecipe');
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
  min-width: 250px !important;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: lightgray;
  }

  @media only screen and (max-width: 648px) {
    // border-top: 1px solid rgb(231, 231, 231);
    padding-top: 5px;
  }

  .error {
    max-width: 40rem;
    margin: 0 auto;
    padding: 4rem 3rem;
    display: flex;

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
      white-space: pre-wrap;
      // NOTE Necessary for ios safari
      word-wrap: break-word;
    }
  }
}

.spinner {
  margin: 0 auto;
  svg {
    height: 3rem;
    width: 3rem;
    fill: $color-primary;
    animation: rotate 2s infinite linear;
  }
}

.spinner-container {
  display: flex;
  justify-content: center;
  // NOTE need to make the container bigger than the scroll trigger component, otherwise, there will be a weird bouncing effect when the spinner overlaps with the trigger
  margin: 1rem auto;

  .spinner-border {
    padding: 3rem auto;
  }
}

.page-nav {
  margin-top: 3rem;
  padding-left: 2rem;
  padding-right: 1.2rem;

  @media only screen and (max-width: 648px) {
    padding: 0 3.2rem;
  }

  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

.btn--inline {
  color: black;
  font-size: 1.3rem;
  font-weight: 600;
  border: none;
  background-color: $color-grey-light-2;
  padding: 0.8rem 1.2rem;
  border-radius: 10rem;
  cursor: pointer;
  min-width: 81px;

  // display: flex;
  align-items: center;
  transition: all 0.2s;

  svg {
    height: 1.6rem;
    width: 1.6rem;
    fill: currentColor;
    margin: 0 0.2rem;
  }

  span {
    margin: 0 0.4rem;
  }

  .spinner-border {
    max-height: 1.6rem;
    max-width: 1.6rem;
  }

  &:hover {
    background-color: $color-grey-light-3;
  }

  &:focus {
    outline: none;
  }
}
</style>
