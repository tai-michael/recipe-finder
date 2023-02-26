<template>
  <!-- <div id="app"> -->
  <div id="home">
    <html>
      <body>
        <div class="container-fluid h-100">
          <!-- TODO test whether below works on an actual mobile phone -->
          <div
            :class="{
              'position-fixed':
                searchResultsExpanded && mobileView && searchResults.length > 7,
            }"
            class="row h-100 justify-content-sm-center d-flex flex-wrap-reverse"
          >
            <VSearchResults class="col-sm-3 search-results" />
            <div class="col-sm-9 recipe overflow-auto h-100">
              <!-- <VLoadingSpinner v-if="loadingRecipe" /> -->
              <div
                v-if="
                  (!$route.query.id && $route.query.query) ||
                  ($route.query.id &&
                    $route.query.query &&
                    !Object.keys(recipe).length)
                "
                class="message message__click-recipe"
              >
                <div>
                  <svg>
                    <use :href="`${icons}#icon-smile`"></use>
                  </svg>
                </div>
                <p>Click on a recipe!</p>
              </div>

              <div
                v-else-if="
                  (!$route.query.id && !$route.query.query) ||
                  (!$route.query.id &&
                    $route.query.query &&
                    !Object.keys(searchResultsDisplay).length)
                "
              >
                <div class="message">
                  <div>
                    <svg>
                      <use :href="`${icons}#icon-global`"></use>
                    </svg>
                  </div>
                  <p>
                    Start by searching for a recipe or an ingredient in our
                    Database.
                  </p>
                </div>
                <div class="message">
                  <div>
                    <svg>
                      <use :href="`${icons}#icon-user`"></use>
                    </svg>
                  </div>
                  <p>Or, create your own recipes in 'My Cookbook'.</p>
                </div>
              </div>
              <div v-else-if="renderRecipeError" class="message">
                <p>{{ renderRecipeError }}</p>
              </div>

              <VRecipe v-if="Object.keys(recipe).length" />
            </div>
            <VLogin v-if="loginModal" />
            <VRegister v-if="registerModal" />
            <VToast v-if="toastMessage" />
          </div>
        </div>
      </body>
    </html>
  </div>
</template>

<script>
import VSearchResults from '@/components/VSearchResults.vue';
// import VLoadingSpinner from '@/components/VLoadingSpinner.vue';
import VRecipe from '@/components/VRecipe.vue';
import VLogin from '@/components/VLogin.vue';
import VRegister from '@/components/VRegister.vue';
import VToast from '@/components/VToast.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');

export default {
  name: 'VHome',
  components: {
    VSearchResults,
    // VLoadingSpinner,
    VRecipe,
    VLogin,
    VRegister,
    VToast,
  },

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      topCoord: 0,
      leftCoord: 0,
      searchResultsContainerTopCoord:
        parseInt(sessionStorage.getItem('databaseSearchResultsTopCoord')) || 0,
      searchResultsContainerLeftCoord:
        parseInt(sessionStorage.getItem('databaseSearchResultsLeftCoord')) || 0,
      searchResultsExpanded: false,
      mobileView: false,
    };
  },

  computed: {
    ...mapGetters([
      'recipe',
      'loadingRecipe',
      'renderRecipeError',
      'loginModal',
      'registerModal',
      'toastMessage',
      'searchResults',
      'setSearchContainerPosition',
    ]),
    loggedIn() {
      return this.$store.getters['auth/loggedIn'];
    },
  },

  watch: {
    '$route.query.id'(newValue) {
      // TODO test if I even need this if statement
      // console.log(newValue);
      if (newValue && !Object.keys(this.recipe).length)
        this.$store.dispatch('home/renderRecipe', {
          id: newValue,
        });
    },
    setSearchContainerPosition(newVal) {
      if (newVal) {
        setTimeout(() => {
          const searchResultsContainer =
            document.querySelector('.search-results');

          searchResultsContainer.scrollTop =
            this.searchResultsContainerTopCoord;
          searchResultsContainer.scrollLeft =
            this.searchResultsContainerLeftCoord;
        }, 1000);
      }
    },
    // 'recipe.image_url': function () {
    //   this.imageLoading = true;
    // },
  },

  methods: {
    // async init() {
    //   try {
    //     // NOTE executes a search if query is manually changed in the address bar
    //     if (
    //       this.$route.query.query &&
    //       this.$route.query.query !== sessionStorage.getItem('databaseQuery')
    //     ) {
    //       this.$router
    //         .push({
    //           query: {
    //             query: this.$route.query.query,
    //             page: 1,
    //           },
    //         })
    //         .catch(() => {});

    //       this.$store.dispatch('home/searchRecipes', {
    //         query: this.$route.query.query,
    //         page: 1,
    //         reloadingPage: true,
    //       });
    //     }

    //     // if (this.$route.query.query) {
    //     //   // NOTE delete router push below if we want to retain the page number instead of resetting to page 1
    //     //   this.$router
    //     //     .push({
    //     //       query: {
    //     //         query: this.$route.query.query,
    //     //         page: 1,
    //     //       },
    //     //     })
    //     //     .catch(() => {});

    //     //   this.$store.dispatch('home/searchRecipes', {
    //     //     query: this.$route.query.query,
    //     //     page: 1,
    //     //     // NOTE uncomment to retain page number instead of resetting to page 1
    //     //     // page: this.$route.query.page,
    //     //     reloadingPage: true,
    //     //   });
    //     // }
    //     // REVIEW consider relocating the query if-statement above to VSearchResults

    //     if (this.$route.query.id)
    //       this.$store.dispatch('home/renderRecipe', {
    //         id: this.$route.query.id,
    //       });

    //     // NOTE uncomment below to keep scroll position for recipe container upon reloading
    //     // setTimeout(() => {
    //     //   window.scrollTo({
    //     //     top: this.topCoord,
    //     //     left: this.leftCoord,
    //     //     behavior: 'instant',
    //     //   });
    //     // }, 1);

    //     console.log('home init done');
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },

    // NOTE persists the coordinates for the recipe and search results containers for page reloads while route is in home/database
    saveDetailsToSessionStorage() {
      // NOTE uncomment below to allow persistent scroll position for recipe container
      // sessionStorage.setItem(
      //   'databaseWindowTopCoord',
      //   document.scrollingElement.scrollTop
      // );
      // sessionStorage.setItem(
      //   'databaseWindowLeftCoord',
      //   document.scrollingElement.scrollLeft
      // );

      const searchResultsContainer = document.querySelector('.search-results');
      sessionStorage.setItem(
        'databaseSearchResultsTopCoord',
        searchResultsContainer.scrollTop
      );
      sessionStorage.setItem(
        'databaseSearchResultsLeftCoord',
        searchResultsContainer.scrollLeft
      );

      sessionStorage.setItem('databaseQuery', this.$route.query.query);
      sessionStorage.setItem('databasePageNum', this.$route.query.page);
    },

    // NOTE allows us to set 'position: fixed' if in mobile view and search results dropdown is expanded
    onClassChange(classAttrValue) {
      const classList = classAttrValue.split(' ');
      if (classList.includes('show')) {
        // console.log('has "show" class');
        this.searchResultsExpanded = true;
      } else {
        this.searchResultsExpanded = false;
      }
    },

    // NOTE Allows us to add/remove class depending on viewport/screen size. See below in mounted for 'addEventListener'.
    handleResize() {
      this.mobileView = window.matchMedia('(max-width: 648px)').matches
        ? true
        : false;
    },
  },

  created() {
    // const storage = localStorage.getItem('bookmarks');
    // if (storage) this.setStoredBookmarks(JSON.parse(storage));
    // console.log('VHome created');
    window.addEventListener('beforeunload', this.saveDetailsToSessionStorage);
    // this.init();
  },
  mounted() {
    // console.log('VHome mounted');
    console.log(this.$root);
    // NOTE allows us to add/remove class depending on viewport size
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener(
      'beforeunload',
      this.saveDetailsToSessionStorage
    );
  },

  beforeRouteLeave(to, from, next) {
    // NOTE stores the coordinates of entire window before leaving the page
    this.topCoord = document.scrollingElement.scrollTop;
    this.leftCoord = document.scrollingElement.scrollLeft;

    // NOTE stores the coordinates of the search results container before leaving the page
    const searchResultsContainer = document.querySelector('.search-results');
    this.searchResultsContainerTopCoord = searchResultsContainer.scrollTop;
    this.searchResultsContainerLeftCoord = searchResultsContainer.scrollLeft;
    next();

    sessionStorage.setItem(
      'databaseSearchResultsTopCoord',
      searchResultsContainer.scrollTop
    );
    sessionStorage.setItem(
      'databaseSearchResultsLeftCoord',
      searchResultsContainer.scrollLeft
    );
  },

  // NOTE The 'vm' callback for 'next' is necessary for beforeRouteEnter, as otherwise you cannot access 'this'. 'vm' refers to 'this'.
  beforeRouteEnter(to, from, next) {
    next(vm => {
      setTimeout(() => {
        // NOTE below observers are used to detect whether the search results dropdown in mobile view is expanded or not. Need to put here instead of mounted() because otherwise, switching tabs will stop the observer, as the tabs are kept alive rather than re-mounted
        vm.observer = new MutationObserver(mutations => {
          for (const m of mutations) {
            const newValue = m.target.getAttribute(m.attributeName);
            vm.$nextTick(() => {
              vm.onClassChange(newValue, m.oldValue);
            });
          }
        });

        vm.observer.observe(
          vm.$root.$children[0].$children[0].$refs.searchResults.$el,
          {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['class'],
          }
        );

        // NOTE search results are expanded by default, so need this to ensure they're collapsed if user previously collapsed them before switching to 'My Cookbook' tab
        if (!vm.searchResultsExpanded)
          vm.$root.$children[0].$children[0].$refs.searchResults.$el.classList.remove(
            'show'
          );

        // NOTE scrolls to previous position of entire window
        window.scrollTo({
          top: vm.topCoord,
          left: vm.leftCoord,
          behavior: 'instant',
        });

        // NOTE scrolls to previous position of search results container
        const searchResultsContainer =
          document.querySelector('.search-results');

        searchResultsContainer.scrollTop = vm.searchResultsContainerTopCoord;
        searchResultsContainer.scrollLeft = vm.searchResultsContainerLeftCoord;
        // console.log(vm.$root.$children[0].$children[0].$refs.searchResults);
      }, 1);
    });
    document.title = 'Epicurist – Database';
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';
// @import '@/assets/sass/components.scss';
// @import '@/assets/sass/custom.scss';

// .navbar {
//   padding: 1.5rem;
// }

html {
  box-sizing: border-box;
  // font-size: 50.5%;

  // 980px
  // @media only screen and (max-width: 61.25em) {
  //   font-size: 50%;
  // }
}

// .container-fluid {
//   margin: auto;
// }

.position-fixed {
  width: 100%;
}

.row {
  // NOTE this was key to getting 'position: sticky' work
  align-items: start;
}

.message {
  max-width: 40rem;
  margin: 0 auto;
  padding: 5rem 4rem 0 4rem;

  display: flex;

  svg {
    height: 3rem;
    width: 3rem;
    fill: $color-primary;
    transform: translateY(-0.3rem);
  }

  p {
    margin-left: 1.5rem;
    font-size: 1.8rem;
    line-height: 1.5;
    font-weight: 600;
  }

  &__click-recipe {
    @media all and (max-width: 648px) {
      display: none;
    }
  }
}

// TODO add new classes and change names to them here
.search-results {
  min-width: 260px;
  // max-width: 365px;
  padding-right: 1.5rem;
  // margin-bottom: 2rem;
  margin-right: 1rem;
  border-right: 1px solid rgb(231, 231, 231);

  // NOTE fixes the search results container and gives it a scroll bar
  position: sticky !important;
  position: -webkit-sticky;
  height: 90vh !important;
  top: 85px !important;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: lightgray;
  }

  @media only screen and (max-width: 648px) {
    // width: 100%;
    // border-right: none;

    display: none !important;
  }
}

.recipe {
  flex: 1 1 100px;
  min-width: 372px;
  max-width: 928px;
  @media only screen and (max-width: 648px) {
    margin-right: 0px !important;
    min-width: 0 !important;
  }
  // height: 90vh !important;
  // overflow: auto;
}

// body {
//   font-family: 'Nunito Sans', sans-serif;
//   font-weight: 400;
//   line-height: 1.6;
//   color: $color-grey-dark-1;
//   // background-image: $gradient;
//   // background-size: cover;
//   background-repeat: no-repeat;
//   // min-height: calc(100vh - 2 * 4vw);
// }

// .container {
//   // max-width: 120rem;
//   min-height: 117rem;
//   // margin: 4vw auto;
//   //   background-color: #fff;
//   //   border-radius: 9px;
//   // overflow: hidden;
//   // box-shadow: 0 2rem 6rem 0.5rem rgba($color-grey-dark-1, 0.2);

//   //   display: grid;
//   //   // grid-template-rows: 10rem minmax(100rem, auto);
//   //   grid-template-columns: 1fr 2fr;
//   //   // grid-template-areas:
//   //   //   'head head'
//   //   //   'list recipe';

//   //   // @media only screen and (max-width: $bp-large) {
//   //   //   max-width: 100%;
//   //   //   margin: 0;
//   //   //   border-radius: 0;
//   //   // }
// }
//
</style>
