import React from 'react';
import styled from 'styled-components';
import { db } from '../lib/firebase';

// const GameStarting = () => {
//   return <p>The game is starting soon...</p>;
// };

let Content = props => {
  if (props.gameState == 'started') {
    return <p>Heres the game</p>;
  } else {
    return GameStarting;
  }
};

const Game = () => (
  <div>
    <p>The game is starting soon...</p>
  </div>
);

export default Game;
