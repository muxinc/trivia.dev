class QuestionForm extends React.Component {
  static defaultProps = {
    question: '',
    answers: [],
    answerNumber: '',
    sent: false,
  };

  handleChange(field, answerIndex, event) {
    const { question, answers, answerNumber, sent, index } = this.props;
    const questionData = { question, answers, answerNumber, sent };

    if (answerIndex === undefined) {
      questionData[field] = event.target.value;
    } else {
      questionData[field][answerIndex] = event.target.value;
    }

    this.props.onChange(index, questionData);
  }

  render() {
    const { question, answers, answerNumber, sent, index } = this.props;

    let answerEls = answers.map((value, answerIndex) => {
      return (
        <div key={answerIndex}>
          <label>Answer {answerIndex + 1}</label>
          <input
            type="text"
            value={value}
            onChange={this.handleChange.bind(this, 'answers', answerIndex)}
          />
        </div>
      );
    });

    return (
      <div>
        <h3>Question #{index + 1}</h3>

        {sent && <p>Sent</p>}

        {!sent && (
          <form>
            <div>
              <label>Question</label>
              <input
                type="text"
                value={question}
                onChange={this.handleChange.bind(this, 'question', undefined)}
              />
            </div>
            {answerEls}
            <div>
              <label>Answer Number</label>
              <input
                type="text"
                value={answerNumber}
                onChange={this.handleChange.bind(
                  this,
                  'answerNumber',
                  undefined
                )}
              />
            </div>
            <button
              onClick={e => {
                this.props.deleteQuestion(index);
              }}
            >
              Delete Question
            </button>
          </form>
        )}
      </div>
    );
  }
}

export default QuestionForm;
