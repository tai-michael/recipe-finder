<template>
  <!-- <div id="app"> -->
  <div id="home">
    <html>
      <body class="min-vh-80">
        <div class="container-fluid">
          <!-- TODO test whether below works on an actual mobile phone -->
          <div
            :class="{
              'position-fixed':
                searchResultsExpanded &&
                mobileView &&
                searchResultsDisplay.length > 7,
            }"
            class="row justify-content-sm-center d-flex flex-wrap-reverse"
          >
            <VSearchResults class="col-sm-3 search-results" />
            <div class="col-sm-9 recipe">
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
                class="message"
              >
                <div>
                  <svg>
                    <use :href="`${icons}#icon-smile`"></use>
                  </svg>
                </div>
                <p>Start by searching for a recipe or an ingredient.</p>
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

  // props: ['searchResultsExpanded'],

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      topCoord: 0,
      leftCoord: 0,
      searchResultsExpanded: false,
      mobileView: false,
    };
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
    // 'recipe.image_url': function () {
    //   this.imageLoading = true;
    // },
  },

  computed: {
    ...mapGetters([
      'recipe',
      'loadingRecipe',
      'renderRecipeError',
      'loginModal',
      'registerModal',
      'toastMessage',
      'searchResultsDisplay',
    ]),
    loggedIn() {
      return this.$store.getters['auth/loggedIn'];
    },
  },

  methods: {
    // ...mapMutations({
    //   setStoredBookmarks: 'SET_STORED_BOOKMARKS',
    //   toggleUploadRecipeView: 'TOGGLE_UPLOAD_USER_RECIPE_VIEW',
    // }),

    // TODO complete this, and add v-if to above (e.g. v-if !loading spinner), then clone the recipe in created(), etc., like before. Alternatively, try v-if userFetched or something in VRecipes. Final, probably best method: revert to original way of rendering recipe in VHome, then use getters, create variables that get data from these getters, and manipulate (toggleServings or whatever) only on this data. This should work, as it'd mean the original data is not actually touched (aside from when bookmarking it)
    // if (this.$route.query.id) TOGGLE RECIPE SPINNER

    async init() {
      try {
        this.$store.commit('home/TOGGLE_BOOKMARKS_SPINNER', true);

        // NOTE await is necessary for these, otherwise the user recipes and bookmarks won't display
        await this.$store.dispatch('auth/fetchUser', null, { root: true });
        if (this.loggedIn) {
          await this.$store.dispatch('home/fetchBookmarks');
          // NOTE allows persistent selection of user recipe once user tabs over
          if (this.$route.query.userRecipeId)
            this.$store.dispatch('home/fetchUserRecipes');
        }

        if (this.$route.query.query)
          this.$store.dispatch('home/searchRecipes', {
            query: this.$route.query.query,
            page: this.$route.query.page,
            reloadingPage: true,
          });

        // NOTE commented out because this code is relocated to VRecipe component itself, to allow cloning of the recipe in VRecipe
        // REVIEW also consider relocating the query if-statement above to VSearchResults
        if (this.$route.query.id)
          this.$store.dispatch('home/renderRecipe', {
            id: this.$route.query.id,
          });
        console.log('home init done');
      } catch (err) {
        console.log(err);
      }
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
    this.init();
  },
  mounted() {
    // console.log('VHome mounted');

    // NOTE allows us to add/remove class depending on viewport size
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
  },

  // NOTE stores the coordinates before leaving the page
  beforeRouteLeave(to, from, next) {
    this.topCoord = document.scrollingElement.scrollTop;
    this.leftCoord = document.scrollingElement.scrollLeft;

    next();
  },

  // NOTE applies the coordinates while re-entering the page. The callback for 'next' is necessary for beforeRouteEnter, as otherwise you cannot access 'this'. 'vm' refers to 'this'.
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

        // NOTE search results are expanded by default, so need this to ensure they're collapsed if user previously collapsed them before switching to 'My Recipes' tab
        if (!vm.searchResultsExpanded)
          vm.$root.$children[0].$children[0].$refs.searchResults.$el.classList.remove(
            'show'
          );

        window.scrollTo({
          top: vm.topCoord,
          left: vm.leftCoord,
          behavior: 'instant',
        });
      }, 1);
    });
  },
};
</script>

<style lang="scss" scoped>
// @import '@/assets/sass/style.scss';
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

.message {
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
  min-height: 80vh;
  padding-right: 1.2rem;
  margin-bottom: 2rem;
  margin-right: 0.8rem;
  border-right: 1px solid rgb(231, 231, 231);

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
  }
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
