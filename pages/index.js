import React from 'react';
import styled from 'styled-components';
import initialize from '../lib/firebase';

const Title = styled.h1`
  font-size: 50px;
`;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: undefined,
      currentGameId: undefined,
    };
  }

  componentDidMount() {
    this.gameWatcher();
  }

  async gameWatcher() {
    const { firebase, db } = await initialize();
    this.firebase = firebase;
    this.db = db;

    // Listen for an open game
    let unsubscribeToGames = this.db
      .collection('games')
      .where('state', '==', 'open')
      .limit(1)
      .onSnapshot(querySnapshot => {
        let gameId;
        querySnapshot.forEach(function(doc) {
          gameId = doc.id;
        });

        if (gameId) {
          console.log('gameId', gameId);
          unsubscribeToGames();
          this.setState({
            currentGameId: gameId,
          });
          // Subscribe to game updates
          this.subscribeToGame();
        }
      });
  }

  subscribeToGame() {
    console.log('this.state.currentGameId', this.state.currentGameId);

    this.unsubscribeFromGame = this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .onSnapshot(
        {
          // Listen for document metadata changes
          includeMetadataChanges: true,
        },
        doc => {
          console.log(doc.data());
          this.setState({
            currentGame: doc.data(),
          });
        }
      );
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

        {this.state.currentUser && !this.state.currentGameId && (
          <p>
            There's no game starting right now. Try back when a show is
            scheduled.
          </p>
        )}

        {this.state.currentUser &&
          this.state.currentGameId &&
          this.state.currentGame.state == 'open' && (
            <p>You're in the game! The game will start soon!</p>
          )}

        {this.state.currentUser &&
          this.state.currentGameId &&
          this.state.currentGame.state == 'started' && (
            <p>You're in the game!</p>
          )}
      </div>
    );
  }
}

export default Index;
