import React from 'react';
import styled from 'styled-components';
import initialize from '../lib/firebase';

const Title = styled.h1`
  font-size: 50px;
`;

// nogame | starting | started
let Content = props => {
  if (props.gameState == 'starting') {
    return <p>Enter your name</p>;
  } else if (props.gameState == 'started') {
    return <p>A game already started. You missed it. :(</p>;
  } else {
    return <p>There's no game right now.</p>;
  }
};

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentUser: undefined };
  }
  async componentDidMount() {
    const { firebase } = await initialize();
    this.firebase = firebase;
  }

  login = async () => {
    const authProvider = new this.firebase.auth.GithubAuthProvider();

    await this.firebase
      .auth()
      .setPersistence(this.firebase.auth.Auth.Persistence.SESSION);

    const session = await this.firebase.auth().signInWithPopup(authProvider);

    this.setState({
      currentUser: {
        username: session.additionalUserInfo.username,
        email: session.user.email,
        name: session.user.displayName,
      },
    });
    console.log(session);
  };

  render() {
    return (
      <div>
        <Title>Welcome to trivia.dev!</Title>
        {!this.state.currentUser && (
          <button onClick={this.login}>Log in with Github</button>
        )}
        {this.state.currentUser && (
          <p>Oh hai, {this.state.currentUser.username}</p>
        )}
        <Content />
      </div>
    );
  }
}

export default Index;
