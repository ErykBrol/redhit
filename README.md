# Redhit - News at your fingertips
To access the webpage, visit https://redhit.herokuapp.com

To access the development version of the webpage, in the server folder:

```
npm install
```

```
cd ../client && npm run build && cd ../server && node server.js
```

```
visit localhost:5000
```

Make sure to fill in the NewsAPI key at ``client/.env`` and the MongoURI in ``server/server.js``. 

**What is Redhit?**

Redhit is an idea inspired by the popular website “Reddit”. Instead of displaying user created and voted posts, Redhit pulls popular news articles from across the internet via the News API (https://newsapi.org/). It provides an organized and clean way to preview what articles have to offer through summaries, the ability to subscribe to different topics, save articles they have viewed and more. With Redhit you always have the most relevant articles at your fingertips.





## Features

### Country and Popular Topic Filter

On the left-hand side of the feed page, users are provided with the option to filter results by country. The supported countries are US, Canada, France, and the UK. This provides more relevant articles to users that live in those countries. (Only available for the topics, tags cannot be filtered by country).

There is also a list of popular topics beneath the country filter which allow users to quickly switch between topics such as Entertainment, Business, and Sports.

### Article Summaries

Clicking on an article either in your feed, or under your saved articles in your profile page will reveal a short summary of the article. These summaries allow for users to determine at a glance if they’re interested in reading a particular article before clicking the link to be taken to the actual article.

### Topic Subscriptions

Redhit allows users to subscribe to search keywords which will then filter articles that they view. This allows users to mainly view articles that they would be interested in, instead of getting everything that's currently popular. 

### Saved Articles

Users are able to save articles so that they can come back to them later. Saved articles are displayed on their profile page under the saved header, with the same features that the article view provides for convenience.

### Social Login

Redhit allows users to login using their Facebook accounts to make the sign-up process quick and easy as a majority of users have Facebook. For users who do not or prefer to create a seperate account for Redhit, we also provide that option. 

### Search Bar

Users are able to search through articles with the search box feature which will further narrow the results they see. This allows a user’s feed to be tailored to exactly the articles they would like to view.


------


## End Users

End users of our app will be people who like to be kept in the loop and have quick and easy access to all sorts of news. Redhit makes it easy to go from keeping up with politics to finding out about the latest news about your hometown sports teams. 

The app is intended to provide a clean and seamless interface for users to not only get their news but be served a custom experience made just for them. This is made possible by the authentication aspect which for the end user takes one of 2 forms: connecting via Facebook or signing up with an email and password. 

## Authors

**Eryk Brol** - (https://github.com/ErykBrol)

**Yoson Chiu** - (https://github.com/yo-ch)

**Vincent Li** - (https://github.com/vincentli1997)
