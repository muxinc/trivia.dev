class QuestionForm extends React.Component {
  handleChange() {
    let question = this.props.question;
    let details = question;
    let index = this.props.index;

    details.question = document.querySelector(`#${question.id}-question`).value;
    details.answers = [0, 1, 2].map(i => {
      return document.querySelector(`#${question.id}-answer${i}`).value;
    });

    this.props.handleQuestionChange(index, details);
  }

  render() {
    let { question, updateQuestion } = this.props;

    let answerEls = [0, 1, 2].map(i => {
      return (
        <div key={i}>
          <label htmlFor={question.id + '-answer' + i}>Answer {i + 1}</label>
          <input
            id={question.id + '-answer' + i}
            type="text"
            value={(question.answers && question.answers[i]) || ''}
            onChange={this.handleChange.bind(this)}
          />
        </div>
      );
    });

    return (
      <div>
        <div>
          <label htmlFor={question.id + '-question'}>Question</label>
          <input
            id={question.id + '-question'}
            type="text"
            value={question.question}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        {answerEls}
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
