<template>
  <!-- <div id="app"> -->
  <div id="personal">
    <html>
      <body class="min-vh-80">
        <!-- <VHeader /> -->
        <div class="container-fluid">
          <div
            :class="{
              'position-fixed':
                userRecipesDropdownExpanded &&
                mobileView &&
                userRecipes.length > 7,
            }"
            class="row justify-content-sm-center d-flex navbar"
          >
            <button
              v-if="Object.keys(userRecipes).length"
              class="narrowscreen navbar-toggler dropdown-toggle p-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#userRecipesDropdown"
              aria-controls="userRecipesDropdown"
              aria-expanded="false"
              aria-label="Toggle user recipes display"
            >
              <span class="fs-2 fw-normal p-2">Created Recipes</span>
            </button>

            <VUserSearchResults
              v-show="Object.keys(userRecipes).length"
              ref="userRecipesDropdown"
              :class="{
                show: userRecipesSearchSubmitted,
              }"
              class="narrowscreen collapse show navbar-nav-scroll mb-3"
              id="userRecipesDropdown"
            />

            <!-- <div v-show="Object.keys(userRecipes).length">
              <VUserSearchResults
                ref="userRecipesDropdown"
                class="narrowscreen collapse show navbar-nav-scroll mb-3"
                id="userRecipesDropdown"
              />
            </div> -->

            <button
              @click="uploadUserRecipe"
              class="btn btn-success btn-lg btn__add-recipe"
            >
              <svg>
                <use :href="`${icons}#icon-add-circle-fill`"></use>
              </svg>
              <span>Add a recipe</span>
            </button>

            <VUserSearchResults class="search-results-widescreen col-sm-3" />

            <router-view></router-view>

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
// import VHeader from '@/components/VHeader.vue';
import VUserSearchResults from '@/components/VUserSearchResults.vue';
// import VUserRecipe from '@/components/VUserRecipe.vue';
// import VUploadRecipe from '@/components/VUploadRecipe.vue';
// import VEditRecipe from '@/components/VEditRecipe.vue';
import VLogin from '@/components/VLogin.vue';
import VRegister from '@/components/VRegister.vue';
import VToast from '@/components/VToast.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');

export default {
  name: 'VPersonal',
  components: {
    // VHeader,
    VUserSearchResults,
    // VUserRecipe,
    // VUploadRecipe,
    // VEditRecipe,
    VLogin,
    VRegister,
    VToast,
  },

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      topCoord: 0,
      leftCoord: 0,
      mobileView: false,
      userRecipesDropdownExpanded: true,
    };
  },

  computed: {
    ...mapGetters([
      'userRecipes',
      'loginModal',
      'registerModal',
      'toastMessage',
      'userRecipesSearchSubmitted',
    ]),
    loggedIn() {
      return this.$store.getters['auth/loggedIn'];
    },
    // userRecipesDropdownExpanded() {
    //   return this.$refs.userRecipesDropdown.$el.classList.contains('show');
    // },
  },
  methods: {
    async init() {
      try {
        this.$store.commit('home/TOGGLE_USER_RECIPES_SPINNER', true);
        this.$store.commit('home/TOGGLE_RECIPE_SPINNER', true);
        this.$store.commit('home/TOGGLE_BOOKMARKS_SPINNER', true);

        // NOTE await is necessary for these, otherwise the user recipes and bookmarks won't display
        await this.$store.dispatch('auth/fetchUser', null, { root: true });
        if (this.loggedIn) {
          this.$store.dispatch('home/fetchBookmarks');
          await this.$store.dispatch('home/fetchUserRecipes');
        }
        this.$store.commit('home/TOGGLE_USER_RECIPES_SPINNER', false);

        if (this.$route.query.userRecipeQuery)
          this.$store.dispatch('home/searchUserRecipes', {
            query: this.$route.query.userRecipeQuery,
            page: this.$route.query.userRecipeQueryPage,
            reloadingPage: true,
          });

        if (this.$route.query.userRecipeId)
          this.$store.dispatch('home/renderRecipe', {
            id: this.$route.query.userRecipeId,
          });
      } catch (err) {
        console.log(err);
      }
    },

    uploadUserRecipe() {
      this.$refs.userRecipesDropdown.$el.classList.remove('show');

      this.$router
        .replace({ name: 'upload', query: { userRecipeId: 'draft' } })
        .catch(() => {});
    },

    handleResize() {
      this.mobileView = window.matchMedia('(max-width: 648px)').matches
        ? true
        : false;
    },

    onClassChange(classAttrValue) {
      const classList = classAttrValue.split(' ');
      if (classList.includes('show')) {
        // console.log('has "show" class');
        this.userRecipesDropdownExpanded = true;
      } else {
        this.userRecipesDropdownExpanded = false;
      }
    },
  },

  created() {
    // const storage = localStorage.getItem('bookmarks');
    // if (storage) this.setStoredBookmarks(JSON.parse(storage));
    // console.log('VPersonal created');
    this.init();
  },
  mounted() {
    // console.log('VPersonal mounted');
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    console.log(this);
    // await this.$nextTick();
    // console.log(this);
    this.observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        const newValue = m.target.getAttribute(m.attributeName);
        this.$nextTick(() => {
          this.onClassChange(newValue, m.oldValue);
        });
      }
    });

    this.observer.observe(this.$refs.userRecipesDropdown.$el, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class'],
    });
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
  // NOTE applies the coordinates while re-entering the page. The callback for 'next' is necessary for beforeRouteEnter, as otherwise you cannot access 'this'
  beforeRouteEnter(to, from, next) {
    next(vm => {
      setTimeout(() => {
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

.btn {
  display: none;
  width: 95%;
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
      display: flex;
      margin-bottom: 4rem;
    }
  }
}

// TODO add new classes and change names to them here

.narrowscreen {
  display: none;

  @media only screen and (max-width: 648px) {
    // min-width: 260px;

    // width: 100%;
    // border-right: none;
    // min-height: 10vh;

    display: block;
  }
}

.position-fixed {
  width: 100%;
}

.container-fluid {
  @media only screen and (max-width: 648px) {
    padding-right: 0px !important;
  }
}

.navbar {
  @media only screen and (max-width: 648px) {
    margin-right: 0px !important;
  }
  align-items: start;
}

.navbar-toggler {
  width: 95%;
  margin-bottom: 2rem !important;
  @media only screen and (max-width: 648px) {
    margin-left: 1.5rem !important;
  }
}

.search-results-widescreen {
  min-width: 260px;
  // max-width: 365px;
  min-height: 90vh;
  padding-right: 1.2rem;
  margin-bottom: 2rem;
  margin-right: 0.8rem;
  border-right: 1px solid rgb(231, 231, 231);

  @media only screen and (max-width: 648px) {
    // min-width: 260px;

    // width: 100%;
    // border-right: none;
    // min-height: 10vh;

    display: none !important;
  }
}

.recipe {
  flex: 1 1 100px;
  min-width: 372px;
  max-width: 928px;
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
