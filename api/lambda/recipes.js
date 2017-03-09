'use strict';
let rfr = require('rfr');
let data = rfr('data');
let wrapper = rfr('wrapper');
let RecipesTable = new data.RecipesTable();


function Create(event) {
  console.log("JSON to insert into Recipes table:\n" + JSON.stringify(JSON.parse(event.body),null,2));
  return RecipesTable.put(JSON.parse(event.body));
}

function Delete(event){
  // If does not exists will give 404.
  return RecipesTable.get(event.pathParameters.recipeId).then(
    () => {
      return RecipesTable.delete(event.pathParameters.recipeId)
    });
}

function Get(event) {
  return RecipesTable.get(event.pathParameters.recipeId);
}

function List(event) {
    return RecipesTable.query('categoryIndex',event.pathParameters.categoryName);
}

function Feed(event) {
  console.log("inside Feed...")
  return RecipesTable.query('categoryIndex',event.pathParameters.categoryName);
}

function Update(event) {
  let input = JSON.parse(event.body);
  return RecipesTable.get(input.recipeId).then((data) => {
    input.createTime = data.createTime;
    //input.recipeId = event.pathParameters.recipeId;
    return RecipesTable.put(input);
  })
}

module.exports = wrapper.wrapModule({
  Create,
  Delete,
  Get,
  List,
  Update,
  Feed
});
