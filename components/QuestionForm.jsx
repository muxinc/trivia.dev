class QuestionForm extends React.Component {
  handleChange() {
    let question = this.props.question;
    let details = question;
    let index = this.props.index;

    console.log(question.id);
    details.question = document.querySelector(
      `#q-${question.id}-question`
    ).value;
    details.answerNumber = document.querySelector(
      `#q-${question.id}-answerNumber`
    ).value;
    details.answers = [1, 2, 3].map(i => {
      return document.querySelector(`#q-${question.id}-answerNumber${i}`).value;
    });

    this.props.handleQuestionChange(index, details);
  }

  render() {
    let { question, updateQuestion } = this.props;

    let answerEls = [1, 2, 3].map(n => {
      return (
        <div key={n}>
          <label htmlFor={'q-' + question.id + '-answerNumber' + n}>
            Answer {n}
          </label>
          <input
            id={'q-' + question.id + '-answerNumber' + n}
            type="text"
            value={(question.answers && question.answers[n - 1]) || ''}
            onChange={this.handleChange.bind(this)}
          />
        </div>
      );
    });

    return (
      <div>
        <div>
          <label htmlFor={'q-' + question.id + '-question'}>Question</label>
          <input
            id={'q-' + question.id + '-question'}
            type="text"
            value={question.question}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        {answerEls}
        <div>
          <label>Answer Number</label>
          <input
            id={'q-' + question.id + '-answerNumber'}
            type="text"
            value={question.answerNumber}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <button
          onClick={e => {
            this.props.updateQuestion(this.props.question.id);
          }}
        >
          Save Question
        </button>
        <button
          onClick={e => {
            this.props.deleteQuestion(this.props.question.id);
          }}
        >
          Delete Question
        </button>
      </div>
    );
  }
}

export default QuestionForm;
