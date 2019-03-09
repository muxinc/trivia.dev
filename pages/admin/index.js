import React from 'react';
import styled from 'styled-components';
import initialize from '../../lib/firebase';
import Head from 'next/head';

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

  createGame() {
    this.db
      .collection('games')
      .add({
        created: this.firebase.firestore.FieldValue.serverTimestamp(),
        state: 'new',
      })
      .then(docRef => {
        console.log(docRef);
        this.setState({
          currentGameRef: docRef,
        });
      })
      .catch(error => {
        alert('Error adding game');
        console.error('Error adding document: ', error);
      });
  }

  openGame() {
    this.state.currentGameRef
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
    this.state.currentGameRef
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
    this.state.currentGameRef
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

  sendQuestion() {
    this.state.currentGameRef
      .update({
        currentQuestion: {
          index: 0,
          question: 'What is my name?',
          answers: ['bob', 'john', 'ringo'],
        },
      })
      .then(docRef => {
        console.log('question added');
      })
      .catch(error => {
        alert('Error adding question');
        console.error('Error adding document: ', error);
      });
  }

  showResults() {
    this.state.currentGameRef
      .update({
        'currentQuestion.answer': 1,
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
      currentGameRef,
      currentGameId,
      currentGame,
    } = this.state;
    const currentQuestion = currentGame && currentGame.currentQuestion;

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

        {currentUser && !currentGameRef && (
          <div>
            <p>Oh hai, {currentUser.username}</p>
            <button onClick={this.createGame.bind(this)}>Create Game</button>
          </div>
        )}

        {currentUser && currentGameRef && (
          <div>
            <p>Ok we are in a game</p>

            <p>Oh hai, {currentUser.username}</p>
            <button onClick={this.openGame.bind(this)}>Open Game</button>
            <button onClick={this.startGame.bind(this)}>Start Game</button>
            <button onClick={this.sendQuestion.bind(this)}>
              Send Question
            </button>
            <button onClick={this.showResults.bind(this)}>Show Results</button>
            <button onClick={this.closeGame.bind(this)}>Close Game</button>
          </div>
        )}
      </div>
    );
  }
}

export default Index;
