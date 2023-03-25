<template>
  <div id="app">
    <!-- NOTE Code for if I use a navbar instead -->
    <!-- <header></header> -->
    <!-- <top-header></top-header> -->
    <!-- <div id="nav"> -->
    <!-- <router-link to="/">Home</router-link>| -->
    <!-- <router-link to="/about">About</router-link>| -->
    <!-- <div v-if="!loggedIn">
        <router-link to="/register">Register</router-link>|
        <router-link to="/login">Login</router-link>
      </div>
      <div v-else>
        <button @click="$store.dispatch('auth/logout')">Logout</button>
      </div> -->
    <!-- <router-link to="/secret">Secret</router-link> -->
    <!-- </div> -->
    <VHeader />
    <keep-alive><router-view /></keep-alive>
    <VLogin v-if="loginModal" />
    <VRegister v-if="registerModal" />
  </div>
</template>

<script>
import VHeader from '@/components/VHeader.vue';
import VLogin from '@/components/VLogin.vue';
import VRegister from '@/components/VRegister.vue';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('home');
import {
  WEBSITE_NAME,
  DATABASE_TAB_NAME,
  USER_RECIPES_TAB_NAME,
} from '@/common/config.js';

export default {
  name: 'app',
  components: {
    VHeader,
    VLogin,
    VRegister,
  },
  computed: {
    loggedIn() {
      return this.$store.getters['auth/loggedIn'];
    },
    ...mapGetters(['loginModal', 'registerModal', 'recipe', 'userRecipe']),

    documentTitle() {
      return `${WEBSITE_NAME} | ${this.currentTabTitle}`;
    },
    currentTabTitle() {
      // if (this.$route.name === 'home')
      //   if (Object.keys(this.recipe).length) return this.recipe.label;
      //   else return DATABASE_TAB_NAME;
      // else if (this.$route.name === 'user-recipes')
      //   if (Object.keys(this.userRecipe).length) return this.userRecipe.title;
      //   else return USER_RECIPES_TAB_NAME;
      // else if (this.$route.name === 'upload') return 'Upload Recipe';
      // else if (this.$route.name === 'edit') return 'Edit Recipe';
      // else
      //   return (
      //     this.$route.name.charAt(0).toUpperCase() + this.$route.name.slice(1)
      //   );

      switch (this.$route.name) {
        case 'home':
          return Object.keys(this.recipe).length
            ? this.recipe.label
            : DATABASE_TAB_NAME;
        case 'user-recipes':
          return Object.keys(this.userRecipe).length
            ? this.userRecipe.title
            : USER_RECIPES_TAB_NAME;
        case 'upload':
          return 'Upload Recipe';
        case 'edit':
          return 'Edit Recipe';
        default:
          return (
            this.$route.name.charAt(0).toUpperCase() + this.$route.name.slice(1)
          );
      }
    },
  },
  watch: {
    documentTitle(newTitle) {
      document.title = newTitle;
    },
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
          await this.$store.dispatch('home/fetchUserBookmarksAndRecipes');
          this.initUserRecipes();
        }
        this.initDatabase();

        this.$store.commit('home/TOGGLE_USER_RECIPES_SPINNER', false);
        this.$store.commit('home/TOGGLE_RECIPE_SPINNER', false);
      } catch (err) {
        console.log(err);
      }
    },

    initUserRecipes() {
      try {
        if (this.$route.query.userRecipeQuery)
          this.$store.dispatch('home/searchUserRecipes', {
            query: this.$route.query.userRecipeQuery,
            page: this.$route.query.userRecipeQueryPage,
            reloadingPage: true,
          });

        if (this.$route.query.userRecipeId)
          this.$store.dispatch('home/renderUserRecipe', {
            id: this.$route.query.userRecipeId,
          });

        console.log('user recipes init done');
      } catch (err) {
        console.log(err);
      }
    },

    initDatabase() {
      try {
        // NOTE executes a search if query is manually changed in the address bar
        if (
          this.$route.query.query &&
          this.$route.query.query !== sessionStorage.getItem('databaseQuery')
        ) {
          this.$router
            .push({
              query: {
                query: this.$route.query.query,
                page: 1,
              },
            })
            .catch(() => {});

          this.$store.dispatch('home/searchRecipes', {
            query: this.$route.query.query,
            page: 1,
            reloadingPage: true,
          });
        }

        // if (this.$route.query.query) {
        //   // NOTE delete router push below if we want to retain the page number instead of resetting to page 1
        //   this.$router
        //     .push({
        //       query: {
        //         query: this.$route.query.query,
        //         page: 1,
        //       },
        //     })
        //     .catch(() => {});

        //   this.$store.dispatch('home/searchRecipes', {
        //     query: this.$route.query.query,
        //     page: 1,
        //     // NOTE uncomment to retain page number instead of resetting to page 1
        //     // page: this.$route.query.page,
        //     reloadingPage: true,
        //   });
        // }
        // REVIEW consider relocating the query if-statement above to VSearchResults

        if (this.$route.query.id)
          this.$store.dispatch('home/renderRecipe', {
            id: this.$route.query.id,
          });

        // NOTE uncomment below to keep scroll position for recipe container upon reloading
        // setTimeout(() => {
        //   window.scrollTo({
        //     top: this.topCoord,
        //     left: this.leftCoord,
        //     behavior: 'instant',
        //   });
        // }, 1);

        console.log('home init done');
      } catch (err) {
        console.log(err);
      }
    },
  },
  created() {
    this.init();
    document.title = this.documentTitle;
  },
};
</script>

<style lang="scss">
::-webkit-scrollbar {
  width: 9px;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(197, 197, 197);
}
</style>
