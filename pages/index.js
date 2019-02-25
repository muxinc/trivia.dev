import React from 'react';
import styled from 'styled-components';
import initialize from '../lib/firebase';
import initPlayer from '../lib/player';
import Head from 'next/head';

const GameFrame = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  let: 0;
  background-color: #333;
  z-index: -1;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

const Video = styled('video')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: -1;
`;

const TitleBar = styled.div`
  box-sizing: border-box;
  padding: 7px 5px;
  font-size: 14px;
  line-height: 16px;
  text-align: right;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
`;

const LoginModal = styled('div')`
  position: relative;
  margin: 50px 20px;
  background-color: #fff;
  border-radius: 5px;
  padding: 50px 20px;

  button {
    border: 1px solid #000;
    font-size: 16px;
    border-radius: 5px;
  }
`;

const QuestionModal = styled('div')`
  position: relative;
  margin: 50px 20px;
  background-color: #fff;
  border-radius: 5px;
  padding: 20px 20px;

  p {
    font-size: 20px;
  }

  button {
    display: block;
    width: 100%;
    padding: 0 10px;
    margin-bottom: 10px;
    font-size: 16px;
    line-height: 36px;
    border: 1px solid #000;
    border-radius: 5px;
  }
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
    initPlayer(
      'https://akamaibroadcasteruseast.akamaized.net/cmaf/live/657078/akasource/out.mpd'
    );
  }

  async gameWatcher() {
    const { firebase, db } = await initialize();
    this.firebase = firebase;
    this.db = db;

    // Listen for an open game
    let unsubscribeToGames = this.db
      .collection('games')
      .where('state', '==', 'started')
      .limit(1)
      .onSnapshot(querySnapshot => {
        console.log('game watcher');

        let gameId;
        querySnapshot.forEach(function(doc) {
          gameId = doc.id;
        });

        if (gameId) {
          console.log('gameId', gameId);
          this.setState({
            currentGameId: gameId,
          });
          unsubscribeToGames();
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
    const { currentUser, currentGameId, currentGame } = this.state;
    const currentQuestion = currentGame && currentGame.currentQuestion;

    return (
      <GameFrame>
        <Head>
          <title>My page title</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <script src="http://reference.dashif.org/dash.js/nightly/dist/dash.all.min.js" />
        </Head>
        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>

        <Video src="" controls muted autoplay />

        <TitleBar>trivia.dev</TitleBar>

        {!currentUser && (
          <LoginModal>
            <p>Log in to play.</p>
            <button onClick={this.login}>Log in with Github</button>
          </LoginModal>
        )}

        {currentUser && <p>Oh hai, {currentUser.username}</p>}

        {currentUser && !currentGameId && (
          <p>
            There's no game starting right now. Try back when a show is
            scheduled.
          </p>
        )}

        {currentUser && currentGameId && currentGame.state == 'open' && (
          <p>You're in the game! The game will start soon!</p>
        )}

        {currentQuestion && (
          <QuestionModal>
            <p>
              <strong>Q:</strong> {currentQuestion.question}
            </p>
            {currentQuestion.answers.map((answer, i) => (
              <button key={i}>{answer}</button>
            ))}
          </QuestionModal>
        )}
      </GameFrame>
    );
  }
}

export default Index;
