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
      <VLoadingDots />
    </div>
  </div>
</template>

<script>
import VRecipePreview from '@/components/VRecipePreview.vue';
import VLoadingSpinner from '@/components/VLoadingSpinner.vue';
import VLoadingDots from '@/components/VLoadingDots.vue';
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
    VLoadingDots,
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

        this.$store.commit(
          'home/CREATE_NEXT_SEARCH_RESULTS_LINK',
          Object.keys(res.data._links).length ? res.data._links.next.href : null
        );

        const nextResults = res.data.hits.map(hit => hit.recipe);
        this.$store.commit('home/ADD_SEARCH_RESULTS', nextResults);

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
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

.search-container {
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

.spinner-container {
  display: flex;
  justify-content: center;
  // NOTE margin is set to be bigger here than in the trigger component, because otherwise, there will be a weird bouncing effect when the spinner overlaps with the trigger
  margin: 4rem auto;
}
</style>
