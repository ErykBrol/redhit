import React, {
  Component
} from "react";
import {
  Redirect
} from "react-router-dom";
import Article from "./Article";
import api from "./api";


class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      articles: [],
      displayName: '',
      accCreationTime: '',
      numViewed: 0,
      numSaved: 0,
      subTags: [],
      input: ''
    }

    this.fetchData = this.fetchData.bind(this);
    this.renderArticle = this.renderArticle.bind(this);
    this.createSubList = this.createSubList.bind(this);
    this.onUnsubClick = this.onUnsubClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    //used to redirect if user is not signed in.
    if (!this.props.userSignedIn) {
      this.redirect = setTimeout(() => {
        this.props.history.push('/login');
      }, 2000);
    }
  }

  componentWillReceiveProps() {
    this.setState((prevState, props) => {
      if (props.userSignedIn && !this.props.userSignedIn) {
        clearTimeout(this.redirect);
        this.fetchData(props);
        setTimeout(() => this.setState({
          receivedProps: true
        }), 500);
      }
    })
  }

  componentDidMount() {
    if (this.props.userSignedIn) {
      this.fetchData();
    }
  }

  // API call to retrive data 
  fetchData(props) {
    if (props == null) {
      props = this.props;
    }

    api.getUserInfo(props.userID).then(res => {
      var dates = res.profileData.joinDate.split(' ');

      let savedArticles = res.savedArticles;
      let articles = []
      for (let i = 0; i < savedArticles.length; i++) {
        articles.push(this.renderArticle({
          no: i + 1,
          title: savedArticles[i].title,
          author: savedArticles[i].author,
          body: savedArticles[i].body,
          url: savedArticles[i].url,
          publishedAt: savedArticles[i].publishedAt,
          thumbnail: savedArticles[i].thumbnail
        }))
      };

      articles = articles.reverse();

      this.setState({
        numViewed: res.profileData.articlesViewed,
        numSaved: res.savedArticles.length,
        subTags: res.subscribedTags,
        displayName: res.profileData.firstName + ' ' + res.profileData.lastName.substring(0, 1),
        accCreationTime: dates[2] + ' ' + dates[1] + ', ' + dates[3]
      })
      this.setState(prevState => {
        return {
          articles: articles,
        }
      });
    }).catch(err => console.log(err));
  }

  // Displaying the saved articles
  renderArticle(article) {
    return (
      <Article
        no={article.no}
        key={article.url}
        title={article.title}
        author={article.author}
        body={article.body}
        url={article.url}
        publishedAt={article.publishedAt}
        thumbnail={article.thumbnail}
        saved={true}
        userSignedIn={this.props.userSignedIn}
        userID={this.props.userID}
      />
    );
  }

  // Display the list of subscribed keywords
  createSubList() {
    let list = []
    for (let i = 0; i < this.state.subTags.length; i++) {
      list.push(<p onClick={this.onUnsubClick.bind(this, this.state.subTags[i])} className="sub-word">{this.state.subTags[i]}</p>)
    }
    return list
  }


  // Clicking on sub keywords unsubs the user
  onUnsubClick(tag) {
    if (this.props.userSignedIn) {
      api.unsubscribeTag(this.props.userID, tag).catch(
        err => console.log('Failed to unsubscribe to tag:' + err));
    }
    this.fetchData();
  }

  handleChange(e) {
    this.setState({
      input: e.target.value
    });
  }
  // Subscribing to new keyword from input
  handleSubmit() {
    //Subscribe to tag.
    if (this.state.input !== '') {
      api.subscribeTag(this.props.userID, this.state.input.trim()).catch(
        err => console.log('Failed to subscribe to tag:' + err));

    }
    this.setState({
      input: ''
    });
    this.fetchData();
  }

  render() {
    if (this.props.userSignedIn) {
      return (
        <div className="profile-page">
        <div className="cards">
          <div className="profile-card">
            <h2>{this.state.displayName}</h2>
            <img src="https://res.cloudinary.com/airwotever/image/upload/v1395969197/default-profile-pic_hkmqpe.png" width="128" height="128" alt='' />
            <div className="stat">
              <p><strong>{this.state.numViewed}</strong> articles read</p>
              <p><strong>{this.state.numSaved}</strong> articles saved</p>
              <p className="join-text">Joined on {this.state.accCreationTime}</p>
            </div>
          </div>
          <div className="sub-card">
            <h2 className="profile-card">Subscriptions</h2>
            {this.createSubList()}
            <input className="input-field" type="text" name="word" required size="12"
              placeholder="Keyword" value={this.state.input} onChange={(e)=>this.handleChange(e)}></input>
            <span className="validity"></span>

            <input className="add-icon" type="image" src="https://png.icons8.com/ios-glyphs/50/000000/plus.png" alt='' onClick={this.handleSubmit.bind(this)}></input>

          </div>
        </div>
        <p className="profile-header">SAVED</p>
        <div className="feed-container">
          <div className="feed">
            {this.state.articles}
          </div>
        </div>
      </div>
      );
    } else if (this.state.receivedProps) {
      return (
        <Redirect to='/Login'/>
      );
    } else {
      return null;
    }
  }
}

export default Profile;
