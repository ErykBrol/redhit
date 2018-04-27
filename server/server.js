const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const summarizer = require('node-tldr');
const path = require('path');
const assert = require('assert');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const MongoURI = 'MongoURI';

let db; //DB instance.
let users; //users collection.

// Connect to Mongo database.
MongoClient.connect(MongoURI, (err, res) => {
  assert.equal(null, err);
  console.log('Connected to database!');

  db = res.db('redhit');
  users = db.collection('users');

  app.listen(PORT, err => {
    if (err) throw err;

    console.log(`Server started on port ${PORT}`);
  });
});

/*
 * Middleware.
 */
app.use(function(req, res, next) {
  // Add whatever origins we want to be able to connect to the server here
  var allowedOrigins = ['http://localhost:3000', 'https://redhit.herokuapp.com'];
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

app.use(express.static(path.resolve(__dirname, '../client/build')));

//Auto parse JSON.
app.use(bodyParser.json());

//Serve webpage.
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
});

/*
 * Database CRUD routes.
 */

//Initialize new user.
app.post('/registerUser', (req, res) => {
  let user = req.body;

  if (user.firebaseID && user.firstName && user.lastName) {
    users.insertOne({
      _id: user.firebaseID,
      savedArticles: [],
      subscribedTags: ['entertainment', 'business', 'health', 'science', 'sports', 'technology'],
      profileData: {
        joinDate: new Date().toString(),
        articlesViewed: 0,
        articlesSaved: 0,
        firstName: user.firstName,
        lastName: user.lastName
      }
    }).then(() => res.sendStatus(200)).catch(() => res.send(400));
  } else {
    res.send(400, 'Invalid/missing user information.');
  }
});

//Save article.
app.post('/save', (req, res) => {
  let firebaseID = req.body.firebaseID;
  let article = req.body.article;

  if (firebaseID && validArticle(article)) {
    users.update({
      _id: firebaseID
    }, {
      $addToSet: {
        savedArticles: article
      },
      $inc: {
        'profileData.articlesSaved': 1
      }
    }).then(() => res.sendStatus(200)).catch(() => res.send(400));

  } else {
    res.send(400, 'Missing ID or article information.');
  }
});

//Unsave article.
app.delete('/unsave', (req, res) => {
  let firebaseID = req.body.firebaseID;
  let articleURL = req.body.articleURL;

  if (firebaseID && articleURL) {
    users.update({
      _id: firebaseID
    }, {
      $pull: {
        'savedArticles': {
          url: articleURL
        }
      },
      $inc: {
        'profileData.articlesSaved': -1
      }
    }).then(() => {
      res.sendStatus(200);
    }).catch(() => res.sendStatus(400));
  } else {
    res.send(400, 'Missing ID or article URL.');
  }
});

//Subscribe to tag.
app.put('/subscribe', (req, res) => {
  let firebaseID = req.body.firebaseID;
  let tag = req.body.tag;

  if (firebaseID && tag) {
    users.update({
      _id: firebaseID
    }, {
      $addToSet: {
        subscribedTags: tag
      }
    }).then(() => res.sendStatus(200)).catch(() => res.send(400));
  } else {
    res.send(400, 'Missing ID or tag.');
  }
});

//Unsubscribe to tag.
app.delete('/unsubscribe', (req, res) => {
  let firebaseID = req.body.firebaseID;
  let tag = req.body.tag;
  if (firebaseID && tag) {
    users.update({
      _id: firebaseID
    }, {
      $pull: {
        subscribedTags: tag
      }
    }).then(() => res.sendStatus(200)).catch(() => res.send(400));
  } else {
    res.send(400, 'Missing ID or tag.');
  }
});

//Increment article viewed.
app.put('/articleViewed', (req, res) => {
  let firebaseID = req.body.firebaseID;

  if (firebaseID) {
    users.update({
      _id: firebaseID
    }, {
      $inc: {
        'profileData.articlesViewed': 1
      }
    }).then(() => res.sendStatus(200)).catch(() => res.send(400));
  } else {
    res.send(400, 'Missing ID');
  }
});

//Retrieve user data.
app.get('/getUser', (req, res) => {
  let firebaseID = req.query.firebaseID;
  try {
    if (firebaseID) {
      users.findOne({
        _id: firebaseID
      }).then(
        user => {
          if (user) {
            res.json(user);
          } else {
            throw 'User does not exist.';
          }
        }
      );
    } else {
      throw 'Missing id.';
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

//Endpoint to summarize articles and return summaries.
app.post('/summarize', (req, res) => {
  let articleURLs = req.body.articleURLs;

  let summaryPromises = [];
  for (let article of articleURLs) {
    summaryPromises.push(summarizeArticle(article));
  }

  Promise.all(summaryPromises).then(summaries => {
    res.json({
      articleSummaries: summaries
    });
  });
});

//Helper functions.
function validArticle(article) {
  return true;
}

function summarizeArticle(url) {
  return new Promise((resolve, reject) => {
    summarizer.summarize(url, (result, fail) => {

      if (fail) {
        resolve(null);
      } else {
        resolve(result.summary.join('\n'));
      }
    });
  });
}
