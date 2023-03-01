export const getRecipeId = function (recipe) {
  // NOTE optional chaining needed to prevent TypeError: undefined. Note also that Vue 2 doesn't support optional chaining in html template (only Vue 3 does). That's why I need to use a method, like here.
  return recipe?.uri.split('#recipe_')[1];
};

export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
