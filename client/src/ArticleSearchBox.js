import React, {
  Component
} from "react";

class ArticleSearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    this.props.onSearch(this.state.value.trim().toLowerCase());
  }

  render() {
    return (
      <div className="search">
        <div className="search-icon">
          <img src={require("./images/search.png")} alt='' width="64" height="64"></img>
        </div>
        <form onSubmit={this.handleSubmit}>
          <input type="text" name="name" placeholder="search a keyword" onChange={this.handleChange} />
        </form>
      </div>
    );
  }
}

export default ArticleSearchBox;
