'use strict';
let rfr = require('rfr');
let data = rfr('data');
let wrapper = rfr('wrapper');
let FavoritesTable = new data.FavoritesTable();


function Create(event) {
  let input = JSON.parse(event.body);
  return FavoritesTable.put(input);
}

function Delete(event){
  return FavoritesTable.delete(
    event.pathParameters.favoriteId
  )
}

function Get(event) {
  return FavoritesTable.isUserFavorite(event.pathParameters.userId,event.pathParameters.recipeId);
}

function ListByRecipeId(event) {
  return FavoritesTable.queryFavoritesByRecipeId(event.pathParameters.recipeId);
}

function ListByUserId(event) {
  return FavoritesTable.queryFavoritesByUserId(event.pathParameters.userId);
}


module.exports = wrapper.wrapModule({
  Create,
  Delete,
  Get,
  ListByRecipeId,
  ListByUserId,
});
