/*
 * Wrapper to interface with the backend API.
 */

let api = {
  registerUser: (user) => {
    if (!user || !user.firebaseID || !user.firstName || !user.lastName) throw new Error('Missing information.');

    return fetch('/registerUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
  },

  saveArticle: (firebaseID, article) => {
    if (!firebaseID || !article) throw new Error('Missing information.');

    return fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebaseID: firebaseID,
        article: article
      })
    });
  },

  unsaveArticle: (firebaseID, articleURL) => {
    if (!firebaseID || !articleURL) throw new Error('Missing information.');

    return fetch('/unsave', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebaseID: firebaseID,
        articleURL: articleURL
      })
    });
  },

  subscribeTag: (firebaseID, tag) => {
    if (!firebaseID || !tag) throw new Error('Missing information.');

    return fetch('/subscribe', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebaseID: firebaseID,
        tag: tag.replace(/%20/g, ' ')
      })
    });
  },

  unsubscribeTag: (firebaseID, tag) => {
    if (!firebaseID || !tag) throw new Error('Missing information.');

    return fetch('/unsubscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebaseID: firebaseID,
        tag: tag
      })
    });
  },

  articleViewed: (firebaseID) => {
    if (!firebaseID) throw new Error('Missing information.');

    return fetch('/articleViewed', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebaseID: firebaseID
      })
    });
  },

  updateName: (firebaseID, name) => {
    if (!firebaseID || !name || !name.firstName || !name.lastName) throw new Error('Missing information.');

    return fetch('/updateName', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebaseID: firebaseID,
        name: name
      })
    });
  },

  getUserInfo: (firebaseID) => {
    if (!firebaseID) throw new Error('Missing information.');

    return fetch(`/getUser?firebaseID=${firebaseID}`).then(res => {
      if (res.ok) return res.json();
      else throw new Error();
    }).catch(err => console.log(err));
  },

  summarizeArticles: (articles) => {
    if (!Array.isArray(articles)) throw new Error('Invalid param. Pass an array of article URLs.');
    if (!articles.length) throw new Error('No articles supplied.');

    return fetch('/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        articleURLs: articles
      })
    }).then(res => {
      if (res.ok) return res.json();
      else throw new Error();
    }).catch(err => console.log(err));
  }
}

export default api;
