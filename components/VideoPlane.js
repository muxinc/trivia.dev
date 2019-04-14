import React from 'react';
import styled from 'styled-components';

const VideoEl = styled('video')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: -1;
`;

class VideoPlane extends React.Component {
  componentDidMount() {
    let videoEl = document.querySelector('video');
    // let player = dashjs.MediaPlayer().create();
    // player.initialize(
    //   videoEl,
    //   'https://akamaibroadcasteruseast.akamaized.net/cmaf/live/657078/akasource/out.mpd',
    //   true
    // );
    // player.setLowLatencyEnabled(true);
    // player.setLiveDelay(3);
    // player.getDebug().setLogToBrowserConsole(true);
    // player.getDebug().setLogLevel(dashjs.Debug.LOG_LEVEL_INFO);
    // video.play();
  }

  render() {
    // <script src="http://reference.dashif.org/dash.js/nightly/dist/dash.all.min.js" />
    return (
      <>
        <VideoEl />
      </>
    );
  }
}

export default VideoPlane;
