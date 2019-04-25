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
    let color = '#4B48B5';
    let bgColor = '#0B0898';
    let textColor = '#B3B2DD';

    if (this.correct) {
      color = '#30A300';
      bgColor = '#1C5813';
      textColor = '#fff';
    } else if (this.isPlayers) {
      color = '#A50606';
      bgColor = '#5F0303';
      textColor = '#fff';
    }

    const percent = Math.floor((this.count / this.total) * 100);

    const Bar = styled.div`
      position: relative;
      box-sizing: border-box;
      width: 100%;
      margin-bottom: 15px;
      line-height: 20px;
      border: 1px solid ${color};
      background-color: ${bgColor};
      box-sizing: border-box;
      color: ${textColor};
      height: 60px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;

      div {
        position: absolute;
        width: ${percent + '%'};
        background-color: ${color};
        height: 60px;
      }

      p {
        position: absolute;
        width: 70%;
        margin: 0;
        padding-left: 20px;
        color: inherit;
        font-weight: bold;
        text-align: left;
        line-height: 20px;
      }

      span {
        display: block;
        position: absolute;
        padding-right: 20px;
        right: 0;
        width: 50%;
        text-align: right;
        font-weight: bold;
        line-height: 60px;
        color: inherit;
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
