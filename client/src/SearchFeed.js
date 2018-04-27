import React, {
  Component
} from "react";
import ArticleSearch from "./ArticleSearch";
import AnimateHeight from 'react-animate-height';

class Article extends Component {
  constructor(props) {
    super(props)
    this.state = {
      articleHeight: 60,
      hovered: false
    }

    this.handleClick = this.handleClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  //Used to display dropdown icon.
  onMouseEnter() {
    this.setState(prevState => {
      return {
        articleHeight: prevState.articleHeight,
        hovered: true
      };
    })
  }
  onMouseLeave() {
    this.setState(prevState => {
      return {
        articleHeight: prevState.articleHeight,
        hovered: false
      };
    })
  }

  handleClick() {
    this.setState(prevState => {
      return {
        articleHeight: prevState.articleHeight === 60 ? 'auto' : 60,
        hovered: prevState.hovered
      }
    });
  }

  render() {
    let source = this.props.url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/)[1];

    let parsedDate = this.props.publishedAt.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}Z/);
    let date = parsedDate[1];
    let time = parsedDate[2];

    return (
      <div className="article-container"
        onClick={this.handleClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <p className="article-no">{this.props.no}</p>

        <div className={`
          ${this.state.articleHeight === 60 ? "dropdown-icon" : "dropup-icon"}
          ${this.state.hovered ? "" : "hidden"}
          `}>
        </div>

        <AnimateHeight
          duration={500}
          height={this.state.articleHeight}
        >
          <img src={this.props.thumbnail} alt=''></img>
          <div className="article">
            <p>
              <a href={this.props.url}>{this.props.title}</a>
            </p>
            <p className="article-info">
              {`${this.props.author} (${source}) | ${date} - ${time}`}
            </p>
          </div>

          <div className="article-body">
            {this.props.body}
          </div>
        </AnimateHeight>
      </div>
    );
  }
}

class SearchFeed extends Component {
  constructor(props) {
    super(props)

    let type;
    if (this.props.location.pathname.startsWith('/feed/search?')) {
      type =
        '?' + this.props.location.pathname.substring(this.props.location.pathname.indexOf('?') + 1);
      type = type === '?' ? '?trump' : type;
    } else {
      type = 'hot' //Default.
    }

    this.state = {
      articles: [],
      type: type
    }
  }

  componentWillMount() {
    this.mountArticles();
  }

  render() {
    return (
      <div>
        <ArticleSearch handleSubmit={this.handleSearch} history={this.props.history}
        feed={this} mountArticles={this.mountArticles}/>
        {this.state.articles}
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
        / >
    );
  }

  //Handle searching of keywords.
  handleSearch(event) {
    event.preventDefault()
    this.props.history.push('/feed/search?' + this.state.value);
  }

  fetchArticles(url) {
    return fetch(url, {
      headers: {
        'X-Api-Key': process.env.REACT_APP_NEWS_API_KEY
      }
    }).then(data => data.json());
  }

  mountArticles() {
    console.log('mount')
    //Fetch article information, and update state, based on pathname
    let queryURL = 'https://newsapi.org/v2/top-headlines?country=us';
    if (this.state.type === 'hot') {
      queryURL = 'https://newsapi.org/v2/top-headlines?country=us';
    } else if (this.state.type.startsWith('?')) {
      queryURL = `https://newsapi.org/v2/top-headlines?country=us&q=${this.state.type.substring(1)}`;
    }

    this.fetchArticles(queryURL).then(data => {
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

      this.setState(prevState => {
        return {
          articles: articles,
          type: prevState.type
        }
      });
    });
  }
}

export default SearchFeed;
