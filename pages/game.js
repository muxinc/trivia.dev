import React from 'react';
import styled from 'styled-components'

const GameStarting = () => (
  <p>The game is starting soon...</p>
);

let Content = (props) => {
  if (props.gameState == 'started') {

  } else {
    return GameStarting;
  }
};

const Game = () => (
  <div>
    <Content />
  </div>
);

export default Game;
