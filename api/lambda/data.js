'use strict';
var AWS = require('aws-sdk');
var uuid = require('uuid');
AWS.config.update({
  region: 'us-east-1',
  // logger: process.stdout
});
var dynamoDB = new AWS.DynamoDB();
var documentClient = new AWS.DynamoDB.DocumentClient();
var rfr = require('rfr');
var _ = require('underscore');
var config = rfr('config');
let LambdaError = require('./errors');

var myCredentials = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
var es = require('elasticsearch').Client({
  hosts: 'https://search-recipes-xmzhtja4kfmcod5nwh74hjsy5q.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: "us-east-1",
    credentials: myCredentials
  }
});

class Table {
  /**
   * [constructor description]
   * @param  {[type]} tableParams is a passthrough parameter for DynamoDB table definition
   * @param  {[type]} options     Custom options, currently supports timestamps and uuid parameters
   * @return {[type]}             [description]
   */
  constructor(tableParams, options) {
    this.options = options || {};
    this.timestamps = this.options.timestamps || false;
    // For all fields in options.uuid an automatic UUID is generated for each PUT request
    this.uuid = this.options.uuid || [];
    this.tableParams = tableParams;
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      documentClient.delete({
        TableName: this.tableParams.TableName,
        Key: key
      }, (err) => {
        if (err) {
          reject(LambdaError.deleteDataFailed(err));
        }
        resolve({});
      });
    })

  }

  get(key) {
    return new Promise((resolve, reject) => {
      documentClient.get({
        TableName: this.tableParams.TableName,
        Key: key
      }, (err, data) => {
        if (err || !data.Item) {
          console.log(err);
          reject(LambdaError.notFound(JSON.stringify(key)));
        } else {
          resolve(data.Item);
        }
      });
    });
  }

  query(indexName, key) {
    console.log("inside query...");
    return new Promise((resolve, reject) => {
      this.findCategoryRecipes(key).then(function (items) {
        resolve({ items });
      }).catch(function (err) {
        reject(LambdaError.putDataFailed(err));
      })
    });
  }

  scan() {
    console.log("inside scan...");
    return new Promise((resolve, reject) => {
      this.findCategoryRecipes(key).then(function (items) {
        resolve({ items });
      }).catch(function (err) {
        reject(LambdaError.putDataFailed(err));
      })
    });
  }

  put(data) {
    for (var i = 0; i < this.uuid.length; i++) {
      // If provided don't create an UUID on the property that is marked for auto uuid.
      data[this.uuid[i]] = data[this.uuid[i]] || uuid.v1();
    }
    if (this.timestamps) {
      if (data.createTime) {
        data.updateTime = new Date().toISOString();
      } else {
        data.createTime = new Date().toISOString();
      }
    }

    console.log("inserted recipe into elasticsearch...");
    return new Promise((resolve, reject) => {
      documentClient.put({
        TableName: this.tableParams.TableName,
        Item: data
      }, (err) => {
        if (err) {
          console.error(err);
          reject(LambdaError.putDataFailed(err));
        } else {
          this.addDocument(data).then(function (esReturn) {
            resolve(data);
          }).catch(function (docError) {
            reject(LambdaError.putDataFailed(docError));
          })
        }
      });
    }).catch(function (error) {
      console.log('index error:  ' + error);
    })

  }

  findCategoryRecipes(categoryValue) {
    return es.search({
      index: 'recipes',
      body: {
        query: {
          term: {
            category: categoryValue
          }
        }
      }
    }).then(function (body) {
      console.log("category hits:  " + JSON.stringify(body, null, 2));
      return _.map(body.hits.hits, function (hit) {
        return hit._source;
      });
    })
  }

  createIndex() {
    return es.indices.exists({
      index: "recipes"
    }).then(function (indexExists) {
      if (indexExists) {
        console.log("index exists:  " + indexExists);
      } else {
        return es.indices.create({
          index: "recipes"
        }).then(function (iResponse) {
          var body = {
            recipe: {
              properties: {
                name: { "type": "string", "index": "not_analyzed" },
                categories: { "type": "string", "index": "not_analyzed" }
              }
            }
          };
          return es.indices.putMapping({ index: "recipes", type: "recipe", body: body });
        });
      }
    })

  }

  addDocument(document) {
    return this.createIndex().then(function (iDone) {
      console.log("index ok, will insert recipe now...");
      return es.index({
        index: "recipes",
        type: "recipe",
        body: document
      });
    });

  }

  deleteTable() {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: this.tableParams.TableName
      };
      dynamoDB.deleteTable(params, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`Table deleted: '${this.tableParams.TableName}'`);
        resolve();
      });
    });
  }

  createTable() {
    return new Promise((resolve, reject) => {
      dynamoDB.createTable(this.tableParams, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`Table created: '${this.tableParams.TableName}'`);
        resolve();
      });
    });
  }

  safeCreateTable() {
    return new Promise((resolve, reject) => {
      dynamoDB.describeTable({
        TableName: this.tableParams.TableName,
      }, (err, data) => {
        if (err) {
          if (err.code === 'ResourceNotFoundException') {
            this.createTable()
              .then(data => { resolve(data); })
              .catch(err => { reject(err); });
          } else {
            reject(err);
          }
        } else {
          // Need to update or return?
          console.log(`Table ${this.tableParams.TableName} already exists`);//, data);
          resolve(data);
        }
      });
    });
  }
}

class RecipesTable extends Table {
  constructor() {
    super({
      // Parametrization supported for the name so it can be user configured.
      TableName: config.getName('recipes'),
      KeySchema: [{ AttributeName: 'recipeId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'recipeId', AttributeType: 'S' },
        { AttributeName: 'category', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'categoryIndex',
          KeySchema: [{ AttributeName: 'category', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },

      // These are custom options that the Table class understands
      {
        // Which parameters are auto-generated with uuid.v1() which is time dependant.
        uuid: ['recipeId'],
        // Whether to add timestamps to the entries.
        timestamps: true,
      });
  }

  delete(recipeId) {
    return super.delete({ recipeId: recipeId });
  }

  get(recipeId) {
    return super.get({ recipeId: recipeId });
  }

}

class FavoritesTable extends Table {
  constructor() {
    super({
      // Parametrization supported for the name so it can be user configured.
      TableName: config.getName('favorites'),
      KeySchema: [{ AttributeName: 'favoriteId', KeyType: 'HASH' },],
      AttributeDefinitions: [
        { AttributeName: 'favoriteId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'recipeId', AttributeType: 'S' },
        { AttributeName: 'startTimeEpochTime', AttributeType: 'N' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userIdGSI',
          KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'isUserFavorite',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'startTimeEpochTime', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'favoritesByUserByTimeGSI',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'startTimeEpochTime', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'favoritesByRecipeByTimeGSI',
          KeySchema: [
            { AttributeName: 'recipeId', KeyType: 'HASH' },
            { AttributeName: 'startTimeEpochTime', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }

      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
      // These are custom options that the Table class understands
      {
        // Which parameters are auto-generated with uuid.v1() which is time dependant.
        uuid: ['favoriteId'],
        // Whether to add timestamps to the entries.
        timestamps: true,
      });
  }

  delete(favoriteId) {
    return super.delete({
      favoriteId: favoriteId
    });
  }

  get(recipeId, startTime) {
    return super.get({
      recipeId: recipeId,
      startTime: startTime
    });
  }

  queryFavoritesByRecipeId(recipeId) {
    return new Promise((resolve, reject) => {
      let params = {
        TableName: this.tableParams.TableName,
        IndexName: 'favoritesByRecipeByTimeGSI',
        KeyConditionExpression: 'recipeId = :recipeId',
        ExpressionAttributeValues: {
          ':recipeId': recipeId,
        }
      };
      documentClient.query(params, (err, data) => {
        if (err || !data.Items) {
          reject(LambdaError.notFound(JSON.stringify(recipeId)));
        } else {
          let items = data.Items;
          resolve({ items });
        }
      });
    });
  }

  queryFavoritesByUserId(userId) {
    return new Promise((resolve, reject) => {
      let params = {
        TableName: this.tableParams.TableName,
        IndexName: 'userIdGSI',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        }
      };
      documentClient.query(params, (err, data) => {
        if (err || !data.Items) {
          reject(LambdaError.notFound(JSON.stringify(userId)));
        } else {
          let items = data.Items;
          resolve({ items });
        }
      });
    });
  }

}

class ProfilesTable extends Table {
  constructor() {
    super({
      // Parametrization supported for the name so it can be user configured.
      TableName: config.getName('profiles'),
      KeySchema: [{ AttributeName: 'identityId', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'identityId', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
      // These are custom options that the Table class understands
      {
        // Which parameters are auto-generated with uuid.v1() which is time dependant.
        uuid: ['identityId'],
        // Whether to add timestamps to the entries.
        timestamps: true,
      });
  }

  delete(identityId) {
    return super.delete({ identityId: identityId });
  }

  get(identityId) {
    return super.get({ identityId: identityId });
  }

  update(identityId) {
    return super.put({ identityId: identityId });
  }
}

module.exports = {
  RecipesTable,
  FavoritesTable,
  ProfilesTable
};
