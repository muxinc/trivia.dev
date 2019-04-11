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
      user: undefined,
      gameId: undefined,
    };
  }

  componentDidMount() {
    initialize().then(({ firebase, db }) => {
      this.firebase = firebase;
      this.db = db;

      // If they're already logged in...
      firebase.auth().onAuthStateChanged(user => {
        this.setUser(user);

        if (user) {
          this.findGame();
        }
      });
    });
  }

  login = async () => {
    const authProvider = new this.firebase.auth.GithubAuthProvider();

    await this.firebase
      .auth()
      .setPersistence(this.firebase.auth.Auth.Persistence.SESSION);

    const session = await this.firebase.auth().signInWithPopup(authProvider);

    // this.setUser(session.user);
  };

  setUser(user) {
    this.setState({
      user: {
        // username: session.additionalUserInfo.username,
        email: user.email,
        name: user.displayName,
        id: user.uid,
      },
    });
  }

  // Listen for an open game
  async findGame() {
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
        }
      });
  }

  joinGame(gameId) {
    let gameRef = this.db.collection('games').doc(gameId);

    this.unsubscribeFromGame = gameRef.onSnapshot(
      {
        // Listen for document metadata changes
        // includeMetadataChanges: true,
      },
      doc => {
        this.setState({
          gameId: gameId,
          gameData: doc.data(),
        });

        // Add player to the game
        doc.ref
          .collection('players')
          .doc(this.state.user.id)
          .set({})
          .then(docRef => {
            this.subscribeToGamePlayer(gameId, this.state.user.id);
          })
          .catch(error => {
            console.error('Error adding player: ', error);
          });
      }
    );
  }

  subscribeToGamePlayer(gameId, playerId) {
    if (!gameId || !playerId) return;

    this.unsubscribeFromGamePlayer = this.db
      .collection('games')
      .doc(gameId)
      .collection('players')
      .doc(playerId)
      .onSnapshot(doc => {
        this.setState({
          playerData: doc.data(),
        });
      });
  }

  leaveGame() {
    this.unsubscribeFromGame && this.unsubscribeFromGame();
    this.unsubscribeFromGamePlayer && this.unsubscribeFromGamePlayer();
  }

  // Submit an answer for the user.
  // Record can include the GameID, UserID, and answer index.
  // Only the first submitted answer will be used.
  // The UI should not allow changes, and should reflect the first answer.
  submitAnswer(answerIndex) {
    this.db
      .collection('games')
      .doc(this.state.gameId)
      .collection('playerAnswers')
      .add({
        created: this.firebase.firestore.FieldValue.serverTimestamp(),
        userId: this.state.user.id,
        question: this.state.gameData.currentQuestion.index,
        answer: answerIndex,
      })
      .then(docRef => {
        this.setState({
          playerAnswer: answerIndex,
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
    const { user, gameId, gameData, userAnswers, playerAnswer } = this.state;
    const currentQuestion = gameData && gameData.currentQuestion;
    const answered = playerAnswer >= 0;

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

        {!user && (
          <LoginModal>
            <p>Log in to play.</p>
            <button onClick={this.login}>Log in with Github</button>
          </LoginModal>
        )}

        {user && <p>Oh hai, {user.name}</p>}

        {user && !gameId && (
          <p>
            There's no game starting right now. Try back when a show is
            scheduled.
          </p>
        )}

        {user && gameId && gameData.state == 'open' && (
          <p>You're in the game! ({gameId}) The game will start soon!</p>
        )}

        {currentQuestion && currentQuestion.expires >= Date.now() && (
          <QuestionModal
            question={currentQuestion.question}
            expires={currentQuestion.expires}
            answers={currentQuestion.answers}
            playerAnswer={playerAnswer}
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
