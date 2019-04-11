import React from 'react';
import styled from 'styled-components';
import AnswerButton from './AnswerButton';

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.expires = props.expires;
    this.question = props.question;
    this.answers = props.answers;

    this.submitAnswer = i => {
      if (this.state.playerAnswer >= 0) return;

      this.setState({
        playerAnswer: i,
      });
      props.submitAnswer(i);
    };

    this.state = {
      expired: this.isExpired(),
      playerAnswer: props.playerAnswer,
    };
  }

  isExpired() {
    return Date.now() >= this.expires;
  }

  remainingTime() {
    return Math.max(0, this.expires - Date.now());
  }

  componentDidMount() {
    const remainingSeconds = this.remainingTime() / 1000;
    const timeUntilNextSecond = remainingSeconds % Math.floor(remainingSeconds);

    const updateTimeLeft = () => {
      this.setState({
        secondsLeft: Math.ceil(this.remainingTime() / 1000),
      });

      if (this.isExpired()) {
        clearInterval(this.timerInterval);
      }
    };

    // Update at the next 1 second boundary
    setTimeout(() => {
      updateTimeLeft();

      // Then Update every second after that
      this.timerInterval = setInterval(updateTimeLeft, 1000);
    }, timeUntilNextSecond);

    updateTimeLeft();
  }

  render() {
    const QuestionModalWrapper = styled('div')`
      position: relative;
      margin: 50px 20px;
      background-color: #fff;
      border-radius: 5px;
      padding: 20px 20px;
      color: #000;

      p {
        font-size: 20px;
      }

      button {
      }
    `;

    if (this.isExpired()) {
      return '';
    }

    return (
      <QuestionModalWrapper>
        <p>{this.state.secondsLeft}</p>
        <p>
          <strong>Q:</strong> {this.question}
        </p>
        {this.answers.map((answer, i) => (
          <AnswerButton
            selected={this.state.playerAnswer === i}
            onClick={() => {
              this.submitAnswer(i);
            }}
            key={i}
          >
            {answer}
          </AnswerButton>
        ))}
      </QuestionModalWrapper>
    );
  }
}

export default Index;
