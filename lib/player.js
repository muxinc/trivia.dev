export default function initPlayer(src) {
  let video = document.querySelector('video');
  console.log('video', video);
  let player = dashjs.MediaPlayer().create();
  player.initialize(video, src, true);
  player.setLowLatencyEnabled(true);
  player.setLiveDelay(3);
  player.getDebug().setLogToBrowserConsole(true);
  player.getDebug().setLogLevel(dashjs.Debug.LOG_LEVEL_INFO);
  // video.play();
}
