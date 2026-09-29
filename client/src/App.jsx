import { useState } from 'react';
import { useVideoChat, VideoState } from './hooks/useVideoChat.js';
import Landing from './components/Landing.jsx';
import SelfPreview from './components/SelfPreview.jsx';
import VideoRoom from './components/VideoRoom.jsx';

export default function App() {
  const [region, setRegion] = useState('anywhere');
  const chat = useVideoChat();
  const { state, localVideoRef, online } = chat;

  if (state === VideoState.IDLE) {
    return <Landing onStart={(r) => { setRegion(r); chat.begin(); }} online={online} />;
  }

  if (state === VideoState.REQUESTING_MEDIA) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdfaff', color: '#2d1b4e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', system-ui", fontSize: 16 }}>
        Requesting camera…
      </div>
    );
  }

  if (state === VideoState.PREVIEW) {
    return (
      <SelfPreview
        localVideoRef={localVideoRef}
        onReady={() => chat.confirmReady(region)}
        onLeave={chat.leave}
        online={online}
      />
    );
  }

  return <VideoRoom chat={chat} region={region} />;
}