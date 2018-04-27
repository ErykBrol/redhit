import React, {
  Component
} from "react";
import {
  Route,
  NavLink,
  HashRouter,
  Redirect
} from "react-router-dom";

import Feed from "./Feed";
import Profile from "./Profile";
import Login from "./Login";

import firebase from 'firebase';

// Initialize Firebase
const config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};
firebase.initializeApp(config);

const routerActive = {
  textDecoration: 'underline',
  color: 'rgba(40,40,40,1)'
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userSignedIn: false,
      userID: '',
      articles: [],
      feedType: 'hot',
      subscribedTags: []
    };

    this.checkAuthStateChanged = this.checkAuthStateChanged.bind(this);
  }

  updateSignedIn() {
    var user = firebase.auth().currentUser;
    this.setState({
      userSignedIn: true,
      userID: user.uid
    })
  }

  updateSignedOut() {
    this.setState({
      userSignedIn: false,
      userID: ''
    })
  }

  //Persist feed between routes.
  updateFeedArticles(articles, type, subscribedTags) {
    this.setState({
      articles: articles,
      feedType: type,
      subscribedTags: subscribedTags
    });
  }

  checkAuthStateChanged() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        var u = user.user || user;
        console.log(u);
        this.updateSignedIn();
      } else {
        // No user is signed in
        this.updateSignedOut();
      }
    });
  }

  componentWillMount() {
    this.checkAuthStateChanged();
  }

  render() {
    return (
      <div className="content">
        <h1 className="header">
          R
        </h1>
        <HashRouter>
          <div>
            <ul className="router">
              <li><NavLink to="/feed/hot" activeStyle={routerActive}>FEED</NavLink></li>
              <li><NavLink to="/profile" activeStyle={routerActive}>PROFILE</NavLink></li>
              <li><NavLink to="/login" activeStyle={routerActive}>LOGIN</NavLink></li>
            </ul>
            <div className="content">
              <Route exact path="/" render={()=> <Redirect to="/feed/hot" />}/>
              <Route path="/feed/hot"
                render={(routeProps)=> <Feed {...routeProps} {...this.state} updateFeedArticles={this.updateFeedArticles.bind(this)}/>}/>
              <Route path="/profile" render={routeProps=> <Profile {...routeProps} {...this.state}/>}/>
              <Route path="/login" render={routeProps => <Login fb={firebase} {...routeProps} usi={() => this.updateSignedIn()} uso={() => this.updateSignedOut()}/>}/>
            </div>
          </div>
        </HashRouter>
    </div>
    );
  }
}

export default Main;
