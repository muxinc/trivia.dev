import React from 'react';
import styled from 'styled-components';
import initialize from '../lib/firebase';
// import initPlayer from '../lib/player';
import Head from 'next/head';
import GameFrame from '../components/GameFrame';
import VideoPlane from '../components/VideoPlane';
import TitleBar from '../components/TitleBar';
import AnswerButton from '../components/AnswerButton';

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

    this.setState({
      currentUser: {
        username: session.additionalUserInfo.username,
        email: session.user.email,
        name: session.user.displayName,
        id: session.user.uid,
      },
    });
  };

  async gameFinder() {
    const { firebase, db } = await initialize();
    this.firebase = firebase;
    this.db = db;

    // Listen for an open game
    let stopListeningForAGame = this.db
      .collection('games')
      .where('state', '==', 'open')
      .limit(1)
      .onSnapshot(querySnapshot => {
        console.log('Game Listener');

        // Use the latest open game ID
        let gameId;
        querySnapshot.forEach(function(doc) {
          gameId = doc.id;
        });

        if (gameId) {
          stopListeningForAGame();
          this.setState({
            currentGameId: gameId,
          });
          // Subscribe to game updates
          this.subscribeToGame();
        }
      });
  }

  subscribeToGame() {
    let gameRef = this.db.collection('games').doc(this.state.currentGameId);

    this.unsubscribeFromGame = gameRef.onSnapshot(
      {
        // Listen for document metadata changes
        includeMetadataChanges: true,
      },
      doc => {
        this.setState({
          gameRef: gameRef,
          playerAnswersRef: gameRef.collection('playerAnswers'),
          currentGameData: doc.data(),
          // // Fake Game
          // currentGameData: {
          //   created: 'now',
          //   state: 'open',
          //   currentQuestion: {
          //     index: 0,
          //     question: 'What is my favorite color?',
          //     answers: ['blue', 'green', 'clear'],
          //   },
          // },
        });
      }
    );
  }

  // Submit an answer for the user.
  // Record can include the GameID, UserID, and answer index.
  // Only the first submitted answer will be used.
  // The UI should not allow changes, and should reflect the first answer.
  submitAnswer(answerIndex) {
    this.state.playerAnswersRef
      .add({
        userId: this.state.currentUser.id,
        question: this.state.currentGameData.currentQuestion.index,
        answer: answerIndex,
      })
      .then(docRef => {
        this.setState({
          currentAnswer: answerIndex,
        });
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
    } = this.state;
    const currentQuestion = currentGameData && currentGameData.currentQuestion;
    const currentAnswer = this.state.currentAnswer;
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

        {currentUser && <p>Oh hai, {currentUser.username}</p>}

        {currentUser && !currentGameId && (
          <p>
            There's no game starting right now. Try back when a show is
            scheduled.
          </p>
        )}

        {currentUser && currentGameId && currentGameData.state == 'open' && (
          <p>You're in the game! The game will start soon!</p>
        )}

        {currentQuestion && (
          <QuestionModal>
            <p>
              <strong>Q:</strong> {currentQuestion.question}
            </p>
            {currentQuestion.answers.map((answer, i) => (
              <AnswerButton
                selected={currentAnswer === i}
                onClick={() => {
                  !answered && this.submitAnswer(i);
                }}
                key={i}
              >
                {answer}
              </AnswerButton>
            ))}
          </QuestionModal>
        )}
      </GameFrame>
    );
  }
}

export default Index;
