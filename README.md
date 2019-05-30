![Trivia by devs for devs about dev stuff](https://banner.mux.dev/Trivia%2Edev.svg)

# Trivia.dev

A (relatively) simple live streaming trivia app! Uses [Next.js](https://nextjs.org) and [Firebase](https://firebase.com) for storage.

## It all started with a talk abstract...

A lot of app developers right now are taking cues from HQ Trivia and adding the ability for viewers to interact with livestreamers in relative real time through chat, answering questions, betting, bidding, and more. They are all currently running into the same challenge of bringing the latency of live-streaming video down while syncing up interactions between the livestreamer and thousands of viewers.

There's currently a race between WebRTC-based approaches, which are very low in latency but hard to scale, and HTTP-based approaches, which are easy to scale but higher in latency. Neither are great. Steve Heffernan details available approaches as well as the standards-based approaches that will soon help solve the issue using technologies that are already available to us.

## Getting the app running

You're probably going to have a bad time right now, to be honest, but if you want to give it a go you'll need a Firebase account.

- Set up a Firebase app (needs Github authentication enabled)
- Clone the repo
- Replace the app details in [`lib/firebase.js`](lib/firebase.js) with your own.
- Get it up and running locally: `yarn dev`
