import React, {
  Component
} from "react";
import TextField from "material-ui/TextField";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {
  grey500,
  red400
} from 'material-ui/styles/colors';

import api from './api';


class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reg_firstname: '',
      reg_fname_err: '',
      reg_lastname: '',
      reg_lname_err: '',
      reg_email: '',
      reg_email_err: '',
      reg_password: '',
      reg_pass_err: '',
      login_email: '',
      login_email_err: '',
      login_password: '',
      login_pass_err: '',
      redirectToReferrer: false,
      uid: '',
      signedIn: false
    };

    console.log(this.props.fb);

    this.authenticateEmail = this.authenticateEmail.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.signOut = this.signOut.bind(this);
    this.checkAuthStateChanged = this.checkAuthStateChanged.bind(this);
  }

  checkAuthStateChanged() {
    this.props.fb.auth().onAuthStateChanged((user) => {
      if (user) {
        var u = user.user || user;
        console.log(u);
        this.setState({
          uid: u.uid,
          signedIn: true
        });
        this.props.usi();
      } else {
        // No user is signed in
      }
    });
  }

  componentWillMount() {
    this.checkAuthStateChanged()
  }

  handleInputChange(event) {
    const property = event.target.name;
    this.setState({
      [property]: event.target.value
    });
  }

  regValidate() {
    let err = false;

    const posErrors = {
      reg_fname_err: "",
      reg_lname_err: "",
      reg_email_err: "",
      reg_pass_err: ""
    };

    // Doesn't get properly formed email
    if (!(this.state.reg_email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))) {
      err = true
      posErrors.reg_email_err = "Must be a valid email address"
    }

    if (this.state.reg_password.length < 6) {
      err = true
      posErrors.reg_pass_err = "Must be at least 6 characters long"
    }

    if (this.state.reg_firstname.length < 1) {
      err = true
      posErrors.reg_fname_err = "Required field"
    }

    if (this.state.reg_lastname.length < 1) {
      err = true
      posErrors.reg_lname_err = "Required field"
    }

    if (err) {
      this.setState({
        ...this.state,
        ...posErrors
      });
    }

    return err;
  }

  logValidate() {
    let err = false;

    return err;
  }

  handleSubmit(event) {
    // Validate fields first

    const err = this.regValidate()

    console.log(err)
    event.preventDefault();

    if (!err) {
      this.setState({
        redirectToReferrer: true
      });
      event.preventDefault();

      this.props.fb.auth().createUserWithEmailAndPassword(this.state.reg_email, this.state.reg_password)
        .then(() => {

          var user = this.props.fb.auth().currentUser;

          user.updateProfile({
            displayName: this.state.reg_firstname + " " + this.state.reg_lastname
          }).then(function() {
            // Update successful.
          }).catch(function(error) {
            // An error happened.
            console.log(error.message)
          });

          let apiUser = {
            firebaseID: user.uid,
            firstName: this.state.reg_firstname,
            lastName: this.state.reg_lastname
          };

          api.registerUser(apiUser)
            .then(res => {
              if (res.ok) {
                console.log("New user registered!");
              }
            }).catch(err => {
              console.log("Failed to register new user " + err);
            });

          this.props.history.push("/");
        })
        .catch(error => {
          const posErrors = {
            reg_fname_err: "",
            reg_lname_err: "",
            reg_email_err: "",
            reg_pass_err: ""
          };

          if (error.code === 'auth/email-already-in-use') {
            posErrors.reg_email_err = "Email already in use."
          }

          this.setState({
            ...this.state,
            ...posErrors
          });
          // Handle Errors here.
          console.log(error.message);
        });
    }
  }

  authenticateFb(thirdparty) {
    this.props.fb.auth().signInWithPopup(thirdparty)
      .then(this.authHandler)
      .catch(err => console.log(err))

    this.setState({
      signedIn: true
    });
    this.props.usi()
  }

  authenticateEmail(event) {
    // Validate fields first
    const err = this.logValidate()
    event.preventDefault();

    if (!err) {
      // fetch('/get_try')
      //   .then((res) => res.json())
      //   .then((msg) => console.log('Message fetched ... ', msg));

      event.preventDefault();

      let email = this.state.login_email;
      let password = this.state.login_password;

      this.props.fb.auth().signInWithEmailAndPassword(email, password)
        .then(this.authHandler)
        .catch(error => {
          const posErrors = {
            login_email_err: "",
            login_pass_err: ""
          };

          if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
            posErrors.login_email_err = "No accounts with that email."
          } else if (error.code === 'auth/wrong-password') {
            posErrors.login_pass_err = "Incorrect password."
          }

          this.setState({
            ...this.state,
            ...posErrors
          });
        });
    }
  }

  authHandler(authResult) {
    console.log(authResult)
    var user = authResult.user || authResult;

    this.setState({
      uid: user.uid,
      redirectToReferrer: true,
      signedIn: true
    });
    this.props.usi();
    this.forceUpdate();
    this.props.history.push("/");
  }

  signOut() {
    this.props.fb.auth().signOut().then(() => {
      // Sign out successful
      this.setState({
        uid: null,
        reg_firstname: '',
        reg_fname_err: '',
        reg_lastname: '',
        reg_lname_err: '',
        reg_email: '',
        reg_email_err: '',
        reg_password: '',
        reg_pass_err: '',
        login_email: '',
        login_email_err: '',
        login_password: '',
        login_pass_err: ''
      });
    }).catch(function(error) {
      // An error occurred
    });
    this.props.uso()
  };

  render() {
    // Show a sign-out screen if they're signed in
    if (this.props.fb.auth().currentUser) {
      return (
        <div>
        <div className="container">
        <div className="form-container--signOut">
          <form className="form-input">
          <div className="form-slate">
          <h2>See you soon!</h2>
          <div className="button-div">
          <input type="submit" value="Sign Out" onClick={this.signOut} />
          </div>
          </div>
        </form>
        </div>
        </div>
      </div>
      );
    } else {
      // Show a sign-in screern if they're not signed in
      return (
        <MuiThemeProvider>
      <div>
        <div className="container">
        <div className="form-container">
        <form className="form-input">
          <div className="form-slate">
          <h2>Register</h2>
          <TextField
            fullWidth={true}
            name="reg_firstname"
            placeholder="First Name"
            errorText={this.state.reg_fname_err}
            value={this.state.reg_firstname}
            onChange={this.handleInputChange}
            underlineStyle={styles.underlineStyle}
            underlineFocusStyle={styles.underlineStyle}
            floatingLabelFixed
          />

          <TextField
            fullWidth={true}
            name="reg_lastname"
            placeholder="Last Name"
            errorText={this.state.reg_lname_err}
            value={this.state.reg_lastname}
            onChange={this.handleInputChange}
            underlineStyle={styles.underlineStyle}
            underlineFocusStyle={styles.underlineStyle}
            floatingLabelFixed
          />


          <TextField
            fullWidth={true}
            name="reg_email"
            placeholder="email@email.com"
            errorText={this.state.reg_email_err}
            value={this.state.reg_email}
            onChange={this.handleInputChange}
            underlineStyle={styles.underlineStyle}
            underlineFocusStyle={styles.underlineStyle}
            floatingLabelFixed
          />



          <TextField
            fullWidth={true}
            name="reg_password"
            placeholder="Password"
            type="password"
            errorText={this.state.reg_pass_err}
            value={this.state.reg_password}
            onChange={this.handleInputChange}
            underlineStyle={styles.underlineStyle}
            underlineFocusStyle={styles.underlineStyle}
            floatingLabelFixed
          />


          <div className="button-div">
          <input
            type="submit"
            value="Register"
            onClick={this.handleSubmit} />
          </div>
          </div>
        </form>
        <div id="divider" className="formDivider"></div>
        <form className="form-input">
          <div className="form-slate">
          <h2>Log In</h2>

          <TextField
            fullWidth={true}
            name="login_email"
            placeholder="email@email.com"
            value={this.state.login_email}
            errorText={this.state.login_email_err}
            onChange={this.handleInputChange}
            underlineStyle={styles.underlineStyle}
            underlineFocusStyle={styles.underlineStyle}

          />



          <TextField
            fullWidth={true}
            name="login_password"
            placeholder="Password"
            type="password"
            value={this.state.login_password}
            errorText={this.state.login_pass_err}
            onChange={this.handleInputChange}
            underlineStyle={styles.underlineStyle}
            underlineFocusStyle={styles.underlineStyle}
            floatingLabelFixed
          />


          <div className="button-div">
          <input
            type="submit"
            value="Sign In"
            onClick={this.authenticateEmail} />
          </div>
          <button className="loginBtn loginBtn--facebook"
                  onClick={this.authenticateFb.bind(this, new this.props.fb.auth.FacebookAuthProvider())} >
            Login with Facebook
          </button>
          </div>
        </form>
        </div>
        </div>
      </div>
      </MuiThemeProvider>
      );
    }
  }

}

const styles = {
  errorStyle: {
    color: red400,
  },
  underlineStyle: {
    borderColor: grey500,
  },
  floatingLabelStyle: {
    color: grey500,
  },
  floatingLabelFocusStyle: {
    color: red400,
  },
};

export default LoginScreen;
