import React from 'react';
import Link from 'next/link';
import styled from 'styled-components'

const Title = styled.h1`
  font-size: 50px;
`;

// nogame | starting | started
let Content = (props) => {
  if (props.gameState == 'starting') {
    return (
      <p>Enter your name</p>
    );
  } else if (props.gameState == 'started') {
    return (
      <p>A game already started. You missed it. :(</p>
    );
  } else {
    return (
      <p>There's no game right now.</p>
    );
  }
};

const Index = () => (
  <div>
    <Title>Welcome to trivia.dev!</Title>
    <Content />
  </div>
);

export default Index;

// export default class extends React.Component {
//
//   static async getInitialProps ({ query }) {
//     const { p } = query
//     const stories = await getStories('topstories', { page })
//     return { page, stories }
//   }
//
//   render () {
//     const { page, url, stories } = this.props
//     const offset = (page - 1) * 30
//     return <Page>
//       <Stories page={page} offset={offset} stories={stories} />
//     </Page>
//   }
//
// }
