import React from 'react';
import styled from 'styled-components';
import initialize from '../lib/firebase';
// import initPlayer from '../lib/player';
import Head from 'next/head';
import GameFrame from '../components/GameFrame';
import VideoPlane from '../components/VideoPlane';
import TitleBar from '../components/TitleBar';
import AnswerButton from '../components/AnswerButton';
import QuestionModal from '../components/QuestionModal';

const LoginModal = styled('div')`
  position: relative;
  margin: 50px 20px;
  background-color: #fff;
  border-radius: 5px;
  padding: 50px 20px;
  color: #000;

  button {
    border: 1px solid #000;
    font-size: 16px;
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
    this.gameFinder();
  }

  login = async () => {
    const authProvider = new this.firebase.auth.GithubAuthProvider();

    await this.firebase
      .auth()
      .setPersistence(this.firebase.auth.Auth.Persistence.SESSION);

    const session = await this.firebase.auth().signInWithPopup(authProvider);

    this.setUser(session.user);
  };

  setUser(user) {
    this.setState({
      currentUser: {
        // username: session.additionalUserInfo.username,
        email: user.email,
        name: user.displayName,
        id: user.uid,
      },
    });
  }

  async gameFinder() {
    const { firebase, db } = await initialize();
    this.firebase = firebase;
    this.db = db;

    // If they're already logged in...
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setUser(user);
      }
    });

    // Listen for an open game
    let stopListeningForAGame = this.db
      .collection('games')
      .where('state', '==', 'open')
      .limit(1)
      .onSnapshot(querySnapshot => {
        let gameDoc;

        // Use the latest open game ID
        querySnapshot.forEach(function(doc) {
          gameDoc = doc;
        });

        if (gameDoc) {
          stopListeningForAGame();
          // Subscribe to game updates
          this.joinGame(gameDoc.id);

          // Add player to the game
          gameDoc.ref
            .collection('players')
            .doc(this.state.currentUser.id)
            .set({})
            .then(docRef => {})
            .catch(error => {
              console.error('Error adding player: ', error);
            });
        }
      });
  }

  joinGame(gameId) {
    let gameRef = this.db.collection('games').doc(gameId);

    this.unsubscribeFromGame = gameRef.onSnapshot(
      {
        // Listen for document metadata changes
        includeMetadataChanges: true,
      },
      doc => {
        console.log('Game Update');

        this.setState({
          currentGameId: gameId,
          playerAnswersRef: gameRef.collection('playerAnswers'),
          currentGameData: doc.data(),
        });
      }
    );
  }

  subscribeToGamePlayer() {}

  leaveGame() {
    this.unsubscribeFromGame && this.unsubscribeFromGame();
  }

  // Submit an answer for the user.
  // Record can include the GameID, UserID, and answer index.
  // Only the first submitted answer will be used.
  // The UI should not allow changes, and should reflect the first answer.
  submitAnswer(answerIndex) {
    this.state.playerAnswersRef
      .add({
        created: this.firebase.firestore.FieldValue.serverTimestamp(),
        userId: this.state.currentUser.id,
        question: this.state.currentGameData.currentQuestion.index,
        answer: answerIndex,
      })
      .then(docRef => {
        this.setState({
          currentAnswer: answerIndex,
        });
        console.log('answer', answerIndex);
        console.log('Submitted Answer. Document written with ID: ', docRef.id);
      })
      .catch(error => {
        alert('Error adding answer');
        console.error('Error adding document: ', error);
      });
  }

  render() {
    const {
      currentUser,
      currentGameId,
      currentGameData,
      userAnswers,
      currentAnswer,
    } = this.state;
    const currentQuestion = currentGameData && currentGameData.currentQuestion;
    const answered = currentAnswer >= 0;

    return (
      <GameFrame>
        <Head>
          <title>My page title</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            color: #fff;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>

        <VideoPlane src={this.state.streamURL} controls muted autoplay />

        <TitleBar>trivia.dev</TitleBar>

        {!currentUser && (
          <LoginModal>
            <p>Log in to play.</p>
            <button onClick={this.login}>Log in with Github</button>
          </LoginModal>
        )}

        {currentUser && <p>Oh hai, {currentUser.name}</p>}

        {currentUser && !currentGameId && (
          <p>
            There's no game starting right now. Try back when a show is
            scheduled.
          </p>
        )}

        {currentUser && currentGameId && currentGameData.state == 'open' && (
          <p>You're in the game! ({currentGameId}) The game will start soon!</p>
        )}

        {currentQuestion && currentQuestion.expires >= Date.now() && (
          <QuestionModal
            currentQuestion={currentQuestion}
            currentAnswer={currentAnswer}
            submitAnswer={this.submitAnswer.bind(this)}
          />
        )}

        {currentQuestion && typeof currentQuestion.answerNumber != 'undefined' && (
          <div>
            <p>Q: {currentQuestion.question}</p>
            <p>Here are the results!</p>
            {currentQuestion.results.map((result, i) => (
              <div key={i}>
                {currentQuestion.answers[i]} | {result}
              </div>
            ))}
          </div>
        )}
      </GameFrame>
    );
  }
}

export default Index;
