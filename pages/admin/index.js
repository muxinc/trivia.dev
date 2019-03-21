import React from 'react';
import styled from 'styled-components';
import initialize from '../../lib/firebase';
import Head from 'next/head';
import QuestionForm from '../../components/QuestionForm';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: undefined,
      currentGameId: undefined,
    };
  }

  async componentDidMount() {
    const { firebase, db } = await initialize();
    this.firebase = firebase;
    this.db = db;

    // If they're already logged in...
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setUser(user);
      }
    });
  }

  login = async () => {
    const authProvider = new this.firebase.auth.GithubAuthProvider();

    await this.firebase
      .auth()
      .setPersistence(this.firebase.auth.Auth.Persistence.LOCAL);

    const session = await this.firebase.auth().signInWithPopup(authProvider);
    this.setUser(session.user);
  };

  async setUser(user) {
    this.setState({
      currentUser: {
        // username: session.additionalUserInfo.username,
        email: user.email,
        name: user.displayName,
      },
    });

    this.getGameIds();
  }

  async getGameIds() {
    let gamesQuerySnapshot = await this.db.collection('games').get();

    this.setState({
      gameIds: gamesQuerySnapshot.docs.map(gameDocSnap => {
        return gameDocSnap.id;
      }),
    });
  }

  createGame() {
    this.db
      .collection('games')
      .add({
        created: this.firebase.firestore.FieldValue.serverTimestamp(),
        state: 'new',
      })
      .then(docRef => {
        this.setGameId(docRef.id);
      })
      .catch(error => {
        alert('Error adding game');
        console.error('Error adding document: ', error);
      });
  }

  async setGameId(gameId) {
    let gameRef = this.db.collection('games').doc(gameId);

    this.unsubscribeFromGame = gameRef.onSnapshot(doc => {
      this.setState({
        currentGameId: gameId,
        currentGameData: doc.data(),
      });
    });

    this.unsubscribeFromQuestions = gameRef
      .collection('questions')
      .onSnapshot(querySnapshot => {
        console.log('querySnapshot', querySnapshot);
        let questions = [];

        querySnapshot.docs.forEach((doc, i) => {
          questions[i] = doc.data();
          questions[i].id = doc.id;
        });

        this.setState({
          questions: questions,
        });
      });
  }

  openGame() {
    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        state: 'open',
      })
      .then(docRef => {
        console.log('Game opened');
      })
      .catch(error => {
        alert('Error opening game');
        console.error('Error opening game: ', error);
      });
  }

  startGame() {
    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        state: 'started',
      })
      .then(docRef => {
        console.log('Game Started');
      })
      .catch(error => {
        alert('Error starting game');
        console.error('Error starting game: ', error);
      });
  }

  closeGame() {
    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        state: 'closed',
      })
      .then(docRef => {
        console.log('Game closed');
      })
      .catch(error => {
        alert('Error closing game');
        console.error('Error closing game: ', error);
      });
  }

  async createQuestion(question, answers) {
    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .collection('questions')
      .add({
        created: this.firebase.firestore.FieldValue.serverTimestamp(),
        question: '',
        answers: [],
      })
      .then(docRef => {
        console.log('question created');
      })
      .catch(error => {
        alert('Error creating question');
        console.error('Error creating question', error);
      });
  }

  handleQuestionChange(i, details) {
    let questions = this.state.questions;
    questions[i] = details;
    this.setState({
      questions: questions,
    });
  }

  updateQuestion(id) {
    let details;

    this.state.questions.forEach(question => {
      if (question.id == id) {
        details = question;
      }
    });

    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .collection('questions')
      .doc(id)
      .update(details)
      .then(docRef => {
        console.log('question updated');
      })
      .catch(error => {
        alert('Error updating question');
        console.error('Error updating question', error);
      });
  }

  deleteQuestion(id) {
    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .collection('questions')
      .doc(id)
      .delete()
      .then(docRef => {
        console.log('question deleted');
      })
      .catch(error => {
        alert('Error deleting question');
        console.error('Error deleting question', error);
      });
  }

  sendNextQuestion() {
    const questions = this.state.questions;
    let question;

    for (var i = 0; i < questions.length; i++) {
      if (!questions[i].sent) {
        question = questions[i];
        break;
      }
    }

    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        currentQuestion: {
          index: i,
          question: question.question,
          answers: question.answers,
          expires: Date.now() + 10 * 1000,
        },
      })
      .then(docRef => {
        console.log('question sent');
        question.sent = true;
        this.updateQuestion(question.id);
      })
      .catch(error => {
        alert('Error adding question');
        console.error('Error adding document: ', error);
      });
  }

  showResults() {
    const questionIndex = this.state.currentGameData.currentQuestion.index;
    const currentQuestion = this.state.questions[questionIndex];

    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        'currentQuestion.answer': currentQuestion.answer,
        'currentQuestion.results': [100, 2, 50],
      })
      .then(docRef => {
        console.log('Added results');
      })
      .catch(error => {
        alert('Error adding results');
        console.error('Error adding results: ', error);
      });
  }

  render() {
    const {
      currentUser,
      currentGameId,
      currentGameData,
      gameIds,
      questions,
    } = this.state;

    return (
      <div>
        <Head>
          <title>Trivia Admin</title>
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

        {!currentUser && (
          <>
            <p>Log in to play.</p>
            <button onClick={this.login}>Log in with Github</button>
          </>
        )}

        {currentUser && !currentGameId && (
          <div>
            <p>Oh hai, {currentUser.name}</p>
            <button onClick={this.createGame.bind(this)}>Create Game</button>
            {gameIds &&
              gameIds.map(gameId => (
                <div key={gameId}>
                  <a
                    onClick={e => {
                      this.setGameId(gameId);
                    }}
                  >
                    {gameId}
                  </a>
                </div>
              ))}
          </div>
        )}

        {currentUser && currentGameId && (
          <div>
            <p>Oh hai, {currentUser.name}</p>
            <p>Game: {currentGameId}</p>

            {currentGameData.state == 'new' && (
              <button onClick={this.openGame.bind(this)}>Open Game</button>
            )}

            {currentGameData.state == 'open' && (
              <button onClick={this.startGame.bind(this)}>Start Game</button>
            )}

            {currentGameData.state == 'started' && (
              <>
                <button onClick={this.sendNextQuestion.bind(this)}>
                  Send Next Question
                </button>
                <button onClick={this.showResults.bind(this)}>
                  Show Results
                </button>
                <button onClick={this.closeGame.bind(this)}>Close Game</button>
              </>
            )}

            {currentGameData.state == 'closed' && <p>This game is closed.</p>}

            {questions &&
              questions.map((question, i) => (
                <QuestionForm
                  key={i}
                  index={i}
                  question={question}
                  handleQuestionChange={this.handleQuestionChange.bind(this)}
                  updateQuestion={this.updateQuestion.bind(this)}
                  deleteQuestion={this.deleteQuestion.bind(this)}
                />
              ))}

            <button onClick={this.createQuestion.bind(this)}>
              Add Question
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default Index;
