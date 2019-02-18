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
  async componentDidMount() {
    const { firebase, authProvider, db } = await initialize();

    console.log(firebase.auth().currentUser);
    if (!firebase.auth().currentUser) {
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      const session = await firebase.auth().signInWithPopup(authProvider);
      console.log(session);
    }
  }

  render() {
    return (
      <div>
        <Title>Welcome to trivia.dev!</Title>
        <Content />
      </div>
    );
  }
}

export default Index;
