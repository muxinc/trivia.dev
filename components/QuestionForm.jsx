class QuestionForm extends React.Component {
  handleChange() {
    let questionData = Object.assign({}, this.props.question);
    let index = this.props.index;

    questionData.question = document.querySelector(`#q${index}-question`).value;
    questionData.answers = [1, 2, 3].map(n => {
      return document.querySelector(`#q${index}-answerNumber${n}`).value;
    });
    questionData.answerNumber = document.querySelector(
      `#q${index}-answerNumber`
    ).value;

    this.props.onChange(index, questionData);
  }

  render() {
    let { questionData, index } = this.props;

    let answerEls = [1, 2, 3].map(n => {
      return (
        <div key={n}>
          <label htmlFor={'q' + index + '-answerNumber' + n}>Answer {n}</label>
          <input
            id={'q' + index + '-answerNumber' + n}
            type="text"
            value={(questionData.answers && questionData.answers[n - 1]) || ''}
            onChange={this.handleChange.bind(this)}
          />
        </div>
      );
    });

    return (
      <div>
        <div>
          <label htmlFor={'q' + index + '-question'}>Question</label>
          <input
            id={'q' + index + '-question'}
            type="text"
            value={questionData.question}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        {answerEls}
        <div>
          <label>Answer Number</label>
          <input
            id={'q' + index + '-answerNumber'}
            type="text"
            value={questionData.answerNumber}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <button
          onClick={e => {
            this.props.deleteQuestion(index);
          }}
        >
          Delete Question
        </button>
      </div>
    );
  }
}

export default QuestionForm;
