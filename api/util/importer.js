'use strict';
var rfr = require('rfr');
var recipes = rfr('lambda/recipes');
var favorites = rfr('lambda/favorites');
var cognito = rfr('util/cognito');
var logger = rfr('util/logger');

var SampleUsers = [
  {
    username: 'bdinsmor',
    email: 'admin@example.com',
    givenName: 'Admin',
    familyName: 'User',
    admin: 'true',
    password: 'Test123!'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    givenName: 'Sample',
    familyName: 'User',
    admin: 'true',
    password: 'Test123!'
  }
];

class SampleData {

  constructor() {
    
  }

  generateSampleData() {
    return Promise.all([
      // Venetian
      this.generateSampleRecipe('Pumpkin Pie')
      .then(recipeId => {
       }),
      
      // Mirage
      this.generateSampleRecipe('Sugar Cakes')
      .then(recipeId => {
        
      })
    ]);
  }

  generateSampleRecipe(name) {
    return new Promise((resolve, reject) => {
      recipes.Create({
        body: JSON.stringify({
          name: name,
          ingredients: [{name: '3 cups flour'}],
          instructions: [{notes: 'Bake'}],
          difficulty: '3',
          servings: '5'
        })},
        { /* Empty context object */ },
        (err, out) => {
          if (err!==null) {
            reject(err);
          } else {
            // return the locationId
            let data = JSON.parse(out.body);
            resolve(data.recipeId);
          }
        }
      );
    });
  }

  


  static createPromiseToCreateUser(user) {
    let promise = new Promise((resolve, reject) => {
      cognito.adminCreateUser(user)
      .then((data) => { resolve(data); })
      .catch((err) => { reject(err); });
    });
    return promise;
  }

  static generateSampleUsers() {
    let promises = [];
    for (let user of SampleUsers) {
      // create a Promise for each user creation task
      let promise = SampleData.createPromiseToCreateUser(user);
      promises.push(promise);
    }
    // now, run all those Promises in parallel
    return Promise.all(promises);
  }

  //TODO: Update following method to accept a particular username or user details object and lookup their corresponding user identity pools Id
  static getSampleUser() {
    return new Promise((resolve) => {
      let user = SampleUsers[1];
      cognito.getIdentityPoolUserId(user).then((data) => {
        // logger.info(data);
        resolve(data);
      });
    });
  }

} // end class

module.exports = {
  SampleData
};
