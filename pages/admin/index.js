import React from 'react';
import styled from 'styled-components';
import initialize from '../../lib/firebase';
import Head from 'next/head';
import QuestionForm from '../../components/admin/QuestionForm';

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
    if (!user) {
      this.setState({ currentUser: false });
      return;
    }

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
    let gamesQuerySnapshot = await this.db
      .collection('games')
      .orderBy('created', 'desc')
      .get();

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
      console.log('game update', doc.data());
      this.setState({
        currentGameId: gameId,
        currentGameData: doc.data(),
      });
    });

    // Questions are under a 'private' collection in a doc.
    // Using a doc with an array of questions to keep ordering of questions
    // easier, compared to each question being a doc.
    // i.e. you can just delete a question from the middle and the
    // indexes get updated.
    this.unsubscribeFromQuestions = gameRef
      .collection('private')
      .doc('questionsDoc')
      .onSnapshot(doc => {
        console.log('questions snapshot');

        let data = doc.data() || {};
        let questions = data.questions || [];

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
    let questions = this.state.questions || [];

    questions.push({
      question: '',
      answers: new Array(3).fill(''),
    });

    this.setState({
      questions: questions,
      questionsEdited: true,
    });
  }

  handleQuestionChange(index, data) {
    let questions = this.state.questions;
    questions[index] = data;
    this.setState({
      questions: questions,
      questionsEdited: true,
    });
  }

  saveQuestions() {
    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .collection('private')
      .doc('questionsDoc')
      .set({
        questions: this.state.questions,
      })
      .then(docRef => {
        console.log('Questions Saved');
        this.setState({
          questionsEdited: false,
        });
      })
      .catch(error => {
        alert('Error updating question');
        console.error('Error updating question', error);
      });
  }

  deleteQuestion(index) {
    let questions = this.state.questions;
    questions.splice(index, 1);
    this.setState({
      questionsEdited: true,
    });
  }

  showNextQuestion() {
    const questions = this.state.questions;
    let questionData;

    for (var i = 0; i < questions.length; i++) {
      if (!questions[i].sent) {
        questionData = questions[i];
        break;
      }
    }

    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        currentQuestion: {
          index: i,
          number: i + 1,
          question: questionData.question,
          answers: questionData.answers,
          expires: Date.now() + 10 * 1000,
        },
      })
      .then(docRef => {
        console.log('question sent');
        questionData.sent = true;
        this.saveQuestions();
      })
      .catch(error => {
        alert('Error adding question');
        console.error('Error adding document: ', error);
      });
  }

  async showQuestionResults() {
    const questionNumber = this.state.currentGameData.currentQuestion.number;
    const currentQuestion = this.state.questions[questionNumber - 1];
    const answerNumber = currentQuestion.answerNumber;
    let results = [0, 0, 0];

    let playerAnswersSnapshot = await this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .collection('playerAnswers')
      .where('questionNumber', '==', questionNumber)
      .orderBy('created', 'asc')
      .get();

    playerAnswersSnapshot.forEach(docSnap => {
      const playerAnswerNumber = docSnap.data().answerNumber;
      results[playerAnswerNumber - 1]++;
    });

    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        'currentQuestion.answerNumber': currentQuestion.answerNumber,
        'currentQuestion.results': results,
      })
      .then(docRef => {
        console.log('Added results');
      })
      .catch(error => {
        alert('Error adding results');
        console.error('Error adding results: ', error);
      });
  }

  clearQuestionResults() {
    const questionIndex = this.state.currentGameData.currentQuestion.index;
    const currentQuestion = this.state.questions[questionIndex];

    currentQuestion.finished = true;

    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        currentQuestion: null,
      })
      .then(docRef => {
        console.log('Finished Question');
        this.saveQuestions();
      })
      .catch(error => {
        alert('Error adding results');
        console.error('Error adding results: ', error);
      });
  }

  async showWinners() {
    let playerAnswersQuerySnapshot = await this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .collection('playerAnswers')
      .orderBy('created', 'asc')
      .get();

    let playerAnswers = {};

    playerAnswersQuerySnapshot.forEach(docSnap => {
      const { userId, questionNumber, answerNumber } = docSnap.data();
      const questionIndex = questionNumber - 1;
      const rightAnswer = this.state.questions[questionIndex].answerNumber;

      // Make sure the player exists in the list
      if (!playerAnswers[userId]) playerAnswers[userId] = [];

      playerAnswers[userId][questionIndex] = !!(answerNumber == rightAnswer);
    });

    let winners = [];
    Object.keys(playerAnswers).forEach(userId => {
      const answers = playerAnswers[userId];
      const correct = answers.reduce((a, b) => a + b);

      if (correct == this.state.questions.length) {
        winners.push(userId);
      }
    });

    console.log('winners', winners);

    this.db
      .collection('games')
      .doc(this.state.currentGameId)
      .update({
        winners: winners,
      })
      .then(docRef => {
        console.log('Showing Winners');
      });
  }

  render() {
    const {
      currentUser,
      currentGameId,
      currentGameData,
      gameIds,
      questions,
      questionsEdited,
    } = this.state;

    const currentQuestion = currentGameData && currentGameData.currentQuestion;
    const currentAnswerNumber = currentQuestion && currentQuestion.answerNumber;
    const questionsLeft =
      questions &&
      questions.reduce((total, q) => {
        return total + (q.sent ? 0 : 1);
      }, 0);

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
                {!currentQuestion && !!questionsLeft && (
                  <button onClick={this.showNextQuestion.bind(this)}>
                    Show Next Question
                  </button>
                )}
                {currentQuestion &&
                  typeof currentAnswerNumber == 'undefined' && (
                    <button onClick={this.showQuestionResults.bind(this)}>
                      Send Results
                    </button>
                  )}
                {currentAnswerNumber > 0 && (
                  <button onClick={this.clearQuestionResults.bind(this)}>
                    Clear Results
                  </button>
                )}
                {questionsLeft === 0 && (
                  <button onClick={this.showWinners.bind(this)}>
                    Show Game Results
                  </button>
                )}

                <button onClick={this.closeGame.bind(this)}>Close Game</button>
              </>
            )}

            {currentGameData.state == 'closed' && <p>This game is closed.</p>}

            {questions &&
              questions.map((questionData, i) => (
                <QuestionForm
                  key={i}
                  index={i}
                  question={questionData.question}
                  answers={questionData.answers}
                  answerNumber={questionData.answerNumber}
                  sent={questionData.sent}
                  onChange={this.handleQuestionChange.bind(this)}
                  deleteQuestion={this.deleteQuestion.bind(this)}
                />
              ))}

            <button onClick={this.createQuestion.bind(this)}>
              Add Question
            </button>

            {questionsEdited && (
              <button onClick={this.saveQuestions.bind(this)}>
                Save Changes
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Index;
