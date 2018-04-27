import React, {
  Component
} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Article from './Article';
import ArticleSearchBox from './ArticleSearchBox';

import countries from './countries';
import api from './api';

const topics = ['entertainment', 'business', 'health', 'science', 'sports', 'technology'];

class Feed extends Component {
  constructor(props) {
    super(props);

    //Determine type of feed.
    let type;
    if (this.props.feedType) {
      type = this.props.feedType;
    } else if (this.props.location.search) {
      type = this.props.location.search;
    } else {
      type = 'hot' //Default.
    }

    this.state = {
      articles: this.props.articles,
      type: type, //Type of feed.
      countries: countries, //Keeps track of the country filter list, and the selected country.
      subscribedTags: this.props.subscribedTags,
      subscribeButton: null
    }

    //Listen to path changes to refetch appropriate articles.
    this.unlisten = this.props.history.listen((location, action) => {
      this.setState({
        articles: []
      });
      if (location.search) {
        this.setState({
          type: location.search
        }, () => {
          this.mountArticles();
        });
      } else if (location.pathname === '/feed/hot') {
        this.setState({
          type: 'hot'
        }, () => {
          this.mountArticles();
        });
      }
    });
  }

  componentDidMount() {
    if (!this.state.articles.length) this.mountArticles();
  }

  componentWillUnmount() {
    this.unlisten();
  }

  //Update user details when we receive user props from Main.
  componentWillReceiveProps() {
    this.setState((prevState, props) => {
      if (props.userSignedIn && !prevState.subscribedTags.length)
        api.getUserInfo(props.userID).then(
          res => {
            this.setState({
              subscribedTags: res.subscribedTags
            });

            this.props.updateFeedArticles(this.state.articles, this.state.type, res.subscribedTags);
            this.setState({
              articles: this.state.articles.map(a => {
                a.props.userSignedIn = props.userSignedIn;
                a.props.userID = props.userID;
                return a;
              })
            });
          }).catch(
          err => console.log(err));
      return null;
    });
  }

  render() {
    return (
      <div className="feed-container">
        <div className="filter-container">
          <div className={`country-flag flag-${this.state.countries[0].iso}`}/>
          <ul className="country-dropdown">
            {this.renderCountry(this.state.countries[0], true)}
            {this.state.countries.slice(1).map(this.renderCountry.bind(this))}
          </ul>
          <div>
             {this.props.userSignedIn && this.state.subscribedTags.length ?
              this.state.subscribedTags.map(this.renderShortcut.bind(this)) : null}
          </div>
        </div>

        <div className="feed">
          <p className="filter-header">
            {`/${this.state.type[0] === '?' ? this.state.type.substring(1).replace(/%20/g, ' ') : this.state.type}`}
          </p>

          {this.state.subscribeButton}
          <ArticleSearchBox onSearch={this.onSearch.bind(this)} history={this.props.history}/>
          {this.state.articles}
        </div>
      </div>
    );
  }

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
        userSignedIn={this.props.userSignedIn}
        userID={this.props.userID}
        / >
    );
  }

  renderShortcut(label) {
    return (
      <ReactCSSTransitionGroup
        transitionName="shortcut"
        transitionAppear={true}
        transitionAppearTimeout={500}
        transitionEnter={false}
        transitionLeave={false}>
        <Shortcut key={label} label={label} onShortcutClick={this.onShortcutClick.bind(this)}/>
      </ReactCSSTransitionGroup>
    );
  }

  renderCountry(country, selected = false) {
    return (
      <li className={`country-option ${selected === true ? 'selected-country' : ''}`} key={country.iso} onClick={()=>this.onCountryClick(country)}>{country.name}</li>
    );
  }

  renderSubscribeButton() {
    if (this.state.type !== 'hot') {
      return (<SubscribeButton
        onClick={this.onSubscribeClick.bind(this)}
        subscribed={this.state.subscribedTags.indexOf(this.state.type.substring(1)) > -1}
      />);
    } else {
      return null;
    }
  }

  //Fetch article information, and update state, based on pathname
  mountArticles() {
    let queryURL = `https://newsapi.org/v2/top-headlines?country=${this.state.countries[0].iso}`;
    if (this.state.type === 'hot') {
      queryURL = `https://newsapi.org/v2/top-headlines?country=${this.state.countries[0].iso}`;
    } else if (this.state.type.startsWith('?')) {
      if (topics.includes(this.state.type.substring(1))) {
        queryURL = `https://newsapi.org/v2/top-headlines?country=${this.state.countries[0].iso}&category=${this.state.type.substring(1)}`
      } else {
        queryURL = `https://newsapi.org/v2/everything?q=${this.state.type.substring(1)}&sortBy=popularity`;
      }
    }

    fetchArticles(queryURL).then(data => {
      let articles = [];

      for (let article of data.articles) {
        articles.push(this.renderArticle({
          no: articles.length + 1,
          title: article.title,
          author: article.author ? article.author : 'Anonymous',
          body: article.description ? article.description : 'Summary unavailable.',
          url: article.url,
          publishedAt: article.publishedAt,
          thumbnail: article.urlToImage
        }));
      }

      this.setState({
        articles: articles,
        subscribeButton: null
      }, () => this.setState({
        subscribeButton: this.renderSubscribeButton()
      }));

      this.props.updateFeedArticles(articles, this.state.type, this.state.subscribedTags);
    });
  }

  //Handle searching of keywords.
  onSearch(query) {
    this.props.history.push('/feed/hot?' + query);
  }

  //Handle clicking of shortcuts.
  onShortcutClick(shortcut) {
    this.props.history.push('/feed/hot?' + shortcut);
  }

  //Handle clicking of country options.
  onCountryClick(country) {
    //Move selected country to top of list, and reload articles.
    let newCountries = this.state.countries.filter(c => c.iso !== country.iso && c.name !== country.name);
    newCountries.unshift(country);

    this.setState({
      country: country.iso,
      countries: newCountries
    }, () => this.mountArticles());
  }

  //Handle clicking of the subscribe button.
  onSubscribeClick(success) {
    //Toggle subscription to the tag if logged in.
    if (this.props.userSignedIn) {
      if (this.state.subscribedTags.indexOf(this.state.type.substring(1)) > -1) {
        //Unsubscribe to tag.
        api.unsubscribeTag(this.props.userID, this.state.type.substring(1))
          .then(
            res => {
              if (res.ok) {
                success();
                this.setState({
                  subscribedTags: this.state.subscribedTags.filter(t => t !== this.state.type.substring(1).replace(/%20/g, ' '))
                }, () => {
                  this.props.updateFeedArticles(this.state.articles, this.state.type, this.state.subscribedTags);
                });
              }
            })
          .catch(
            err => console.log('Failed to unsubscribe to tag:' + err));
      } else {
        //Subscribe to tag.
        api.subscribeTag(this.props.userID, this.state.type.substring(1))
          .then(
            res => {
              if (res.ok) {
                success();
                this.setState({
                  subscribedTags: this.state.subscribedTags.push(this.state.type.substring(1).replace(/%20/g, ' '))
                }, () => {
                  this.props.updateFeedArticles(this.state.articles, this.state.type, this.state.subscribedTags);
                });
              }
            })
          .catch(
            err => console.log('Failed to subscribe to tag:' + err));
      }
    }
  }
}

class Shortcut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showBg: false,
      bg: nextRed()
    }

    this.onHover = this.onHover.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onHover() {
    this.setState({
      showBg: !this.state.showBg
    })
  }

  onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    this.props.onShortcutClick(this.props.label);
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="shortcut"
      onMouseEnter={this.onHover}
      onMouseLeave={this.onHover}
      onClick={this.onClick}
      style={{
        backgroundColor: this.state.showBg ? this.state.bg : 'rgba(0,0,0,0)',
        color: this.state.showBg ? '#ffffff' : '#888888'
      }}
      >
        {this.props.label}
      </div>
    );
  }
}

class SubscribeButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      'subscribed': props.subscribed
    }

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(() => {
      this.setState({
        'subscribed': !this.state.subscribed
      });
    });
  }

  render() {
    return (
      <div className={`subscribe-button ${this.state.subscribed ? 'white-out' : ''}`} onClick={this.onClick}> {this.state.subscribed ? 'subscribed' : 'subscribe'} </div>
    );
  }
}

function fetchArticles(url) {
  return fetch(url, {
    headers: {
      'X-Api-Key': process.env.REACT_APP_NEWS_API_KEY
    }
  }).then(data => data.json());
}

//Function to sequentially return red color codes.
let nextRed = getRed();

function getRed() {
  let g = Math.floor(Math.random() * 100) + 60;
  let b = Math.floor(Math.random() * 100) + 60;
  let ginc = g === 160;
  let binc = g === 160;
  return () => {
    if (g === 60 || g === 160) {
      ginc = !ginc;
    }
    if (b === 60 || b === 160) {
      binc = !binc;
    }
    if (ginc) {
      g += 20;
    } else {
      g -= 20;
    }

    if (binc) {
      b += 10;
    } else {
      b -= 10;
    }

    return `rgb(255,${g},${b}`;
  }
}

export default Feed;
