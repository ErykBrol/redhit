import React, {
  Component
} from 'react';

import api from './api';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AnimateHeight from 'react-animate-height';

class Article extends Component {
  constructor(props) {
    super(props)

    this.source = this.props.url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/)[1];

    let parsedDate = this.props.publishedAt.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}Z/);
    this.date = parsedDate[1];
    this.time = parsedDate[2];

    this.state = {
      articleHeight: 60, //State for dropdown/up.
      showArticle: false, //Used for load-in animation.
      hovered: false, //Used for article animation.
      saving: false, //Used for save button.
      saved: props.saved || false,
      body: props.body, //Used to dynamically load in summary.
      showBody: false,
      read: false
    }

    this.handleClick = this.handleClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onSaveEnter = this.onSaveEnter.bind(this);
    this.onSaveLeave = this.onSaveLeave.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.loadSummary = this.loadSummary.bind(this);
  }

  //Fade-in article.
  componentDidMount() {
    this.timeoutId = setTimeout(() =>
      this.setState({
        showArticle: true,
      }), 900);
  }
  //Remove timeout when unmounted.
  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  //Used to display dropdownicon.
  onMouseEnter() {
    this.setState({
      hovered: true
    });
  }
  onMouseLeave() {
    this.setState({
      hovered: false
    });
  }

  //Animate dropdown/up, and load summary.
  handleClick() {
    this.setState({
      articleHeight: this.state.articleHeight === 60 ? 'auto' : 60
    }, this.loadSummary);

    if (!this.state.read && this.props.userSignedIn) {
      api.articleViewed(this.props.userID).then(res => {
        if (res.ok) {
          this.setState({
            read: true
          });
        }
      });
    }
  }

  //Loads the summary of this article.
  loadSummary() {
    return new Promise((resolve, reject) => {
      api.summarizeArticles([this.props.url]).then(
          res => {
            let summarizedArticle = res.articleSummaries[0];

            if (summarizedArticle && summarizedArticle.length > 0) {
              this.setState({
                body: summarizedArticle
              }, () => {
                //Timeout to smoothly load in summary.
                setTimeout(() => {
                  this.setState({
                    showBody: true
                  }, resolve);
                }, 100);
              });
            } else {
              throw new Error('Summary unavailable:');
            }
          })
        .catch(
          err => {
            console.log(err + 'Failed to summarize article, falling back to description.');
            //Timeout to smoothly load in fallback.
            setTimeout(() => {
              this.setState({
                showBody: true
              }, resolve);
            }, 100)
          });
    });
  }

  //Used to display save icon.
  onSaveEnter() {
    if (this.props.userSignedIn) {
      this.setState({
        saving: true
      });
    }
  }
  onSaveLeave() {
    if (this.props.userSignedIn) {
      this.setState({
        saving: false
      });
    }
  }
  onSaveClick() {
    if (this.props.userSignedIn) {
      if (this.state.saved) { //Toggle save status.
        //Unsave article.
        api.unsaveArticle(this.props.userID, this.props.url).then(
          res => {
            if (res.ok) {
              this.setState({
                saved: false
              })
            }
          }).catch(
          err => console.log('Failed to unsave article:' + err));
      } else {
        //Save article.

        if (!this.state.showBody) {
          this.loadSummary().then(() => {
            this.setState({
              showBody: true
            });
            saveArticle.bind(this)();
          });
        } else {
          saveArticle.bind(this)();
        }
      }
    }

    function saveArticle() {
      let article = {
        title: this.props.title,
        author: this.props.author,
        body: this.state.body,
        url: this.props.url,
        publishedAt: this.props.publishedAt,
        thumbnail: this.props.thumbnail
      }

      api.saveArticle(this.props.userID, article).then(
        res => {
          if (res.ok) {
            this.setState({
              saved: true
            })
          } else {
            throw new Error();
          }
        }
      ).catch(
        err => console.log('Failed to save article:' + err));
    }
  }

  render() {
    return (
      <ReactCSSTransitionGroup
         transitionName="article"
         transitionAppear={true}
         transitionAppearTimeout={800}
         transitionEnter={false}
         transitionLeave={false}
      >
        <div className="article-container" onMouseEnter={this.props.onMouseEnter}>
        <p className="article-no"
          style={{
            backgroundColor: this.state.saving ? (this.state.saved ? "#e58585" : "#85e59f") : null,
            color: this.state.saving ? "#ffffff" : (this.state.saved ? "#42e57e" : "#888888"),
            cursor: this.state.saving ? 'pointer' : 'default'
          }}
          onMouseEnter={this.onSaveEnter}
          onMouseLeave={this.onSaveLeave}
          onClick={this.onSaveClick}>
          {this.state.saving ? (this.state.saved ? '-' : '+') : (this.state.saved ? "✔" : this.props.no)}
        </p>
        <div key={this.props.url}
          onClick={this.handleClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <div className={`
            ${this.state.articleHeight === 60 ? "dropdown-icon" : "dropup-icon"}
            ${this.state.hovered ? "" : "hidden"}
            `}>
          </div>

          <AnimateHeight
            duration={400}
            height={this.state.articleHeight}
          >
            <img src={this.props.thumbnail} alt=''></img>

            <div className={`article ${this.state.showArticle ? "visible" : "hidden"}`}>
              <p>
                <a href={this.props.url}>{this.props.title}</a>
              </p>
              <p className="article-info">
                {`${this.props.author} (${this.source}) | ${this.date} - ${this.time}`}
              </p>
            </div>

            <AnimateHeight
              duration={700}
              height={this.state.showBody ? 'auto' : 0}>
              <div className={`article-body ${this.state.showBody ? 'visible' : 'hidden'}`}>
                {this.state.body}
              </div>
            </AnimateHeight>
          </AnimateHeight>
        </div>
      </div>
      </ReactCSSTransitionGroup>
    );
  }
}

export default Article;
