import React from 'react';
import styled from 'styled-components';

class ResultsAnswerBar extends React.Component {
  constructor(props) {
    super(props);

    this.answer = props.answer;
    this.count = props.count;
    this.total = props.total;
    this.correct = props.correct;
    this.isPlayers = props.isPlayers;
  }

  render() {
    let color = 'gray';

    if (this.correct) {
      color = 'green';
    } else if (this.isPlayers) {
      color = 'red';
    }

    const percent = Math.floor((this.count / this.total) * 100);

    const Bar = styled('div')`
      position: relative;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #ccc;
      height: 40px;
      margin-bottom: 10px;
      border-radius: 20px;

      div {
        position: absolute;
        width: ${percent + '%'};
        background-color: ${color};
        height: 40px;
        border-radius: 20px;
      }

      p {
        position: absolute;
        width: 100%;
        margin: 0;
        padding-left: 20px;
        color: #000;
        font-weight: bold;
        text-align: left;
        line-height: 40px;
      }

      span {
        display: block;
        position: absolute;
        padding-right: 20px;
        width: 100%;
        text-align: right;
        color: #000;
        font-weight: bold;
        line-height: 40px;
      }
    `;

    return (
      <Bar>
        <div />
        <p>{this.answer}</p>
        <span>{this.count}</span>
      </Bar>
    );
  }
}

export default ResultsAnswerBar;
