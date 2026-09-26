import { useState } from 'react';
import { useVideoChat, VideoState } from './hooks/useVideoChat.js';
import Landing from './components/Landing.jsx';
import VideoRoom from './components/VideoRoom.jsx';

export default function App() {
  const [region, setRegion] = useState('en:in');
  const chat = useVideoChat();
  const { state } = chat;

  const inRoom = state !== VideoState.IDLE;

  return inRoom ? (
    <VideoRoom chat={chat} region={region} />
  ) : (
    <Landing onStart={(r) => { setRegion(r); chat.start(r); }} />
  );
}