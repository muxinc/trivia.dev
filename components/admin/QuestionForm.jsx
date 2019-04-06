class QuestionForm extends React.Component {
  static defaultProps = {
    question: '',
    answers: [],
    answerNumber: '',
    sent: false,
  };

  handleChange = (field, answerIndex) => e => {
    const { question, answers, answerNumber, sent, index } = this.props;
    const questionData = { question, answers, answerNumber, sent };

    if (answerIndex === undefined) {
      questionData[field] = e.target.value;
    } else {
      questionData[field][answerIndex] = e.target.value;
    }

    this.props.onChange(index, questionData);
  };

  render() {
    const { question, answers, answerNumber, sent, index } = this.props;

    let answerEls = answers.map((value, answerIndex) => {
      return (
        <div key={answerIndex}>
          <label htmlFor={'q' + index + '-answerNumber' + answerIndex}>
            Answer {answerIndex + 1}
          </label>
          <input
            type="text"
            value={value}
            onChange={this.handleChange('answers', answerIndex)}
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
              <label htmlFor={'q' + index + '-question'}>Question</label>
              <input
                type="text"
                value={question}
                onChange={this.handleChange('question')}
              />
            </div>
            {answerEls}
            <div>
              <label>Answer Number</label>
              <input
                type="text"
                value={answerNumber}
                onChange={this.handleChange('answerNumber')}
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
