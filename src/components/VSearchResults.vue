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

    <VRecipePreview
      v-else
      :recipes="searchResultsDisplay"
      :resultsActive="true"
    />

    <div
      v-if="!loadingSearchResults && $route.query.query && searchResults.length"
      class="page-nav"
    >
      <!-- NOTE If 1st page and there are multiple pages -->
      <button
        v-if="
          searchResultsCurrentPage === 1 &&
          totalSearchResultsLength > searchResultsPerPage
        "
        @click="goToNextPage()"
        class="btn--inline float-end"
        :disabled="loadingMoreResults"
      >
        <span
          class="spinner-border"
          role="status"
          aria-hidden="true"
          v-if="loadingMoreResults"
        ></span>
        <div v-else>
          <span>Page {{ searchResultsCurrentPage + 1 }}</span>
          <svg class="search__icon">
            <use :href="`${icons}#icon-arrow-right`"></use>
          </svg>
        </div>
      </button>

      <!-- <button
        v-else-if="searchResultsCurrentPage === numPages-1 && numPages > 1"
        @click="goToNextPage(true)"
        class="btn--inline"
      >
        <svg class="search__icon">
          <use :href="`${icons}#icon-arrow-left`"></use>
        </svg>
        <span>Page {{ searchResultsCurrentPage - 1 }}</span>
      </button> -->

      <!-- NOTE If last page and there are multiple pages-->
      <button
        v-else-if="
          searchResultsCurrentPage === pageLimit ||
          searchResultsDisplay.length < searchResultsPerPage
        "
        @click="goToPreviousPage()"
        class="btn--inline"
      >
        <svg class="search__icon">
          <use :href="`${icons}#icon-arrow-left`"></use>
        </svg>
        <span>Page {{ searchResultsCurrentPage - 1 }}</span>
      </button>

      <!-- NOTE If between 1st & last page of multiple pages -->
      <div class="d-flex justify-content-between" v-else>
        <button @click="goToPreviousPage()" class="btn--inline">
          <svg class="search__icon">
            <use :href="`${icons}#icon-arrow-left`"></use>
          </svg>
          <span>Page {{ searchResultsCurrentPage - 1 }}</span>
        </button>

        <button
          @click="goToNextPage()"
          class="btn--inline"
          :disabled="loadingMoreResults"
        >
          <span
            class="spinner-border"
            role="status"
            aria-hidden="true"
            v-if="loadingMoreResults"
          ></span>
          <div v-else>
            <span>Page {{ searchResultsCurrentPage + 1 }}</span>
            <svg class="search__icon">
              <use :href="`${icons}#icon-arrow-right`"></use>
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import VRecipePreview from '@/components/VRecipePreview.vue';
import VLoadingSpinner from '@/components/VLoadingSpinner.vue';
import { API_SEARCH_RESULTS_PAGE_LIMIT } from '@/common/config.js';
import axios from 'axios';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');

export default {
  name: 'VSearchResults',
  components: {
    VRecipePreview,
    VLoadingSpinner,
  },

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      loadingMoreResults: false,
    };
  },
  computed: {
    ...mapGetters([
      'searchResults',
      'searchResultsDisplay',
      'searchResultsCurrentPage',
      'totalSearchResultsLength',
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
        if (
          this.numPages < API_SEARCH_RESULTS_PAGE_LIMIT &&
          this.searchResultsCurrentPage === this.numPages
        ) {
          this.loadingMoreResults = true;
          const res = await axios.get(this.nextResultsLink);
          // console.log(res);

          if (Object.keys(res.data._links).length) {
            this.$store.commit(
              'home/CREATE_NEXT_SEARCH_RESULTS_LINK',
              res.data._links.next.href
            );
          }
          const newResults = res.data.hits.map(hit => hit.recipe);
          this.$store.commit('home/ADD_SEARCH_RESULTS', newResults);
          this.loadingMoreResults = false;
          // console.log('triggered');
        }
        this.$store.commit('home/UPDATE_PAGINATION', 1);
      } catch (err) {
        console.log(err);
        // NOTE if api call fails (presumably b/c of hitting the daily limit), then the website will just navigate to the next page without doing an api call for additional results
        this.loadingMoreResults = false;
        this.$store.commit('home/UPDATE_PAGINATION', 1);
      }
    },
    goToPreviousPage() {
      this.$store.commit('home/UPDATE_PAGINATION', -1);
    },
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
