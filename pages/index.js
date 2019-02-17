export default class extends React.Component {

  static async getInitialProps ({ query }) {
    const { p } = query
    const stories = await getStories('topstories', { page })
    return { page, stories }
  }

  render () {
    const { page, url, stories } = this.props
    const offset = (page - 1) * 30
    return <Page>
      <Stories page={page} offset={offset} stories={stories} />
    </Page>
  }

}
