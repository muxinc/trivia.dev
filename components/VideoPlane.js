import React from 'react';
import styled, { css } from 'styled-components';
import dashjs from 'dashjs';

const VideoContainer = styled.div`
  width: 100%;
  text-align: center;

  ${props =>
    props.hide &&
    css`
    height 0;
    width: 0;

    video {
      height 0;
      width: 0;
      border: none;
    }
  `}
`;

const VideoEl = styled.video`
  position: relative;
  margin: 20px auto;
  width: 320px;
  height: 180px;
  background-color: #000;
  border: 7px solid #ffef82;
`;

class VideoPlane extends React.Component {
  componentDidMount() {
    let videoEl = document.querySelector('video');
    let player = dashjs.MediaPlayer().create();
    player.initialize(videoEl, 'https://mux.ngrok.io/out.mpd', true);
    // player.initialize(
    //   videoEl,
    //   'https://akamaibroadcasteruseast.akamaized.net/cmaf/live/657078/akasource/out.mpd',
    //   true
    // );

    // player.setLowLatencyEnabled(true);
    player.setLiveDelay(4);
    player.getDebug().setLogToBrowserConsole(true);
    player.getDebug().setLogLevel(dashjs.Debug.LOG_LEVEL_INFO);
    videoEl.play();
    videoEl.controls = true;
    // videoEl.muted = true;
  }

  render() {
    return (
      <VideoContainer hide={this.props.hide}>
        <VideoEl />
      </VideoContainer>
    );
  }
}

export default VideoPlane;
