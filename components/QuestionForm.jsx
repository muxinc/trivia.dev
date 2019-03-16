class QuestionForm extends React.Component {
  handleChange() {
    let details = {};
    let question = this.props.question;
    let index = this.props.index;

    details.question = document.querySelector(`#${question.id}-question`).value;

    this.props.handleQuestionChange(index, details);
  }

  render() {
    let { question, updateQuestion } = this.props;

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
        <div>
          <label htmlFor={question.id + '-answer0'}>Answer 1</label>
          <input
            id={question.id + '-answer0'}
            type="text"
            value={question.answers && question.answers[0]}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <div>
          <label htmlFor={question.id + '-answer1'}>Answer 2</label>
          <input
            id={question.id + '-answer1'}
            type="text"
            value={question.answers && question.answers[1]}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <div>
          <label htmlFor={question.id + '-answer2'}>Answer 3</label>
          <input
            id={question.id + '-answer2'}
            type="text"
            value={question.answers && question.answers[2]}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <button
          onClick={e => {
            this.updateQuestion(question.id);
          }}
        >
          Update Question
        </button>
      </div>
    );
  }
}

export default QuestionForm;
