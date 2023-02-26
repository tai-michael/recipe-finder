<template>
  <form
    v-if="$route.name === 'home'"
    class="search"
    @submit.prevent="submitSearch"
  >
    <svg class="fa-magnifying-glass" @click.prevent="submitSearch">
      <use :href="`${icons}#icon-search`"></use>
    </svg>
    <input
      type="search"
      class="form-control"
      placeholder="Search our database of 2.3m recipes"
      v-model="query"
    />
  </form>
  <form
    v-else-if="$route.path.startsWith('/personal')"
    class="search"
    @submit.prevent="submitUserRecipeSearch"
  >
    <svg class="fa-magnifying-glass">
      <use :href="`${icons}#icon-search`"></use>
    </svg>
    <input
      type="search"
      class="form-control"
      placeholder="Search among your own recipes"
      v-model="userRecipeQuery"
    />
  </form>
</template>

<script>
export default {
  name: 'VSearch',

  data() {
    return {
      icons: require('@/assets/images/icons.svg'),
      // NOTE: retains search query in search field after reloading the page
      query: this.$route.query.query,
      userRecipeQuery: this.$route.query.userRecipeQuery,
    };
  },
  watch: {
    // NOTE used for resetting the search input to '' after pressing 'Back to all recipes' in search results container
    '$route.query.userRecipeQuery'(newValue) {
      this.userRecipeQuery = newValue;
    },
  },
  methods: {
    submitSearch() {
      this.$store.dispatch('home/searchRecipes', { query: this.query });
    },
    submitUserRecipeSearch() {
      this.$store.dispatch('home/searchUserRecipes', {
        query: this.userRecipeQuery,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/sass/style.scss';

.form-control {
  text-overflow: ellipsis;
  font-weight: 500;
}

.search {
  // display: flex;
  max-width: 50rem;
  width: 100%;
  position: relative;
  border-radius: 10rem;
  box-shadow: 0 1px 8px rgb(67 41 163 / 10%);
  // box-sizing: border-box;
  // max-width: 450px;
  @media all and (max-width: 648px) {
    max-width: 80rem;
  }
}

.search .fa-magnifying-glass {
  position: absolute;
  top: 11px;
  left: 16px;
  width: 20px;
  height: 20px;

  @media all and (max-width: 648px) {
    top: 7px;
    left: 20px;
    width: 16px;
    height: 16px;
  }
}

.search input {
  height: 42px;
  border: 1px solid #8f8fa1;
  border-radius: 10rem;
  font-size: 1.8rem;
  padding: 1.3rem 1.3rem 1.3rem 3em;

  @media all and (max-width: 648px) {
    height: 30px;
    font-size: 16px;
    padding: 1.3rem 1.3rem 1.3rem 3em;
  }
}

.search input:focus {
  box-shadow: none;
  border: 2px solid black;
}
</style>
