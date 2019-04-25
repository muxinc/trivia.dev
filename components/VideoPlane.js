import React from 'react';
import styled from 'styled-components';
import dashjs from 'dashjs';

const VideoContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const VideoEl = styled.video`
  position: relative;
  margin: 20px auto;
  width: 320px;
  height: 230px;
  background-color: #000;
  border: 7px solid #ffef82;
`;

class VideoPlane extends React.Component {
  componentDidMount() {
    let videoEl = document.querySelector('video');
    let player = dashjs.MediaPlayer().create();
    // player.initialize(videoEl, 'https://f33c730c.ngrok.io/out.mpd', true);
    player.initialize(
      videoEl,
      'https://akamaibroadcasteruseast.akamaized.net/cmaf/live/657078/akasource/out.mpd',
      true
    );

    // player.setLowLatencyEnabled(true);
    player.setLiveDelay(4);
    player.getDebug().setLogToBrowserConsole(true);
    player.getDebug().setLogLevel(dashjs.Debug.LOG_LEVEL_INFO);
    videoEl.play();
    videoEl.controls = true;
    videoEl.muted = true;
  }

  render() {
    return (
      <VideoContainer>
        <VideoEl />
      </VideoContainer>
    );
  }
}

export default VideoPlane;
