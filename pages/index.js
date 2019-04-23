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
import QuestionResultsModal from '../components/QuestionResultsModal';

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

const EliminatedBanner = styled('div')`
  width: 100px;
  margin: 0px auto;
  background-color: #f00;
  border-radius: 20px;
  padding: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
`;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      gameId: undefined,
      eliminated: false,
    };
  }

  componentDidMount() {
    initialize().then(({ firebase, db }) => {
      this.firebase = firebase;
      this.db = db;

      // If they're already logged in...
      firebase.auth().onAuthStateChanged(user => {
        this.setUser(user);
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

  loginWithName(e) {
    let name = document.querySelector('#loginName').value;

    if (!name) name = 'guest' + Math.floor(Math.random() * 1000);

    this.setUser({
      displayName: name,
      uid: name + '-' + Math.floor(Math.random() * 1000000),
      email: '...',
    });
  }

  setUser(user) {
    if (!user) {
      this.setState({
        user: null,
      });
      return;
    }

    this.setState({
      user: {
        // username: session.additionalUserInfo.username,
        email: user.email,
        name: user.displayName,
        id: user.uid,
      },
    });

    this.findGame();
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
    // Add player to the game
    this.db
      .collection('games')
      .doc(gameId)
      .collection('players')
      .doc(this.state.user.id)
      .set({
        name: this.state.user.name,
      })
      .then(docRef => {
        this.subscribeToGamePlayer(gameId, this.state.user.id);
      })
      .catch(error => {
        console.error('Error adding player: ', error);
      });

    this.unsubscribeFromGame = this.db
      .collection('games')
      .doc(gameId)
      .onSnapshot(doc => {
        // let prevGameData = this.state.gameData
        // if (prevGameData && prevGameData.currentQuestion && prevGameData.)

        this.setState({
          gameId: gameId,
          gameData: doc.data(),
        });
      });
  }

  subscribeToGamePlayer(gameId, playerId) {
    if (!gameId || !playerId) return;

    this.unsubscribeFromGamePlayer = this.db
      .collection('games')
      .doc(gameId)
      .collection('players')
      .doc(playerId)
      .onSnapshot(doc => {
        let data = doc.data();

        this.setState({
          playerData: data,
        });

        // Only update when true
        console.log('data.eliminated', data.eliminated);
        if (data.eliminated) {
          this.setState({
            eliminated: true,
          });
        }
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
  submitAnswer(answerNumber) {
    const playerData = this.state.playerData || {};
    const questionIndex = this.state.gameData.currentQuestion.number - 1;

    playerData.answers = playerData.answers || [];
    playerData.answers[questionIndex] = answerNumber;

    this.setState({
      playerData: playerData,
    });

    this.db
      .collection('games')
      .doc(this.state.gameId)
      .collection('players')
      .doc(this.state.user.id)
      .set(playerData)
      .then(docRef => {
        console.log('Submitted Answer. Document written with');
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });

    this.db
      .collection('games')
      .doc(this.state.gameId)
      .collection('playerAnswers')
      .add({
        created: this.firebase.firestore.FieldValue.serverTimestamp(),
        userId: this.state.user.id,
        questionNumber: this.state.gameData.currentQuestion.number,
        answerNumber: answerNumber,
      })
      .then(docRef => {
        console.log('Submitted Answer. Document written with ID: ', docRef.id);
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  render() {
    const { user, gameId, gameData, playerData, eliminated } = this.state;
    const currentQuestion = gameData && gameData.currentQuestion;
    const playerAnswer =
      currentQuestion &&
      playerData.answers &&
      playerData.answers[currentQuestion.number - 1];
    const winners = gameData && gameData.winners;

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
            <p>Or just enter your name.</p>
            <input id="loginName" type="text" />
            <br />
            <button onClick={this.loginWithName.bind(this)}>
              Log in with Name
            </button>
          </LoginModal>
        )}

        {user && <p>Oh hai, {user.name}</p>}

        {eliminated && <EliminatedBanner>Eliminated</EliminatedBanner>}

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
            eliminated={eliminated}
          />
        )}

        {currentQuestion && currentQuestion.answerNumber && (
          <QuestionResultsModal
            question={currentQuestion.question}
            answers={currentQuestion.answers}
            answerNumber={currentQuestion.answerNumber}
            results={currentQuestion.results}
            playerAnswer={playerAnswer}
          />
        )}

        {winners && (
          <div>
            <h3>Here are the winners!</h3>
            {winners.map((winner, i) => (
              <div key={i}>{winner.name}</div>
            ))}
          </div>
        )}
      </GameFrame>
    );
  }
}

export default Index;
