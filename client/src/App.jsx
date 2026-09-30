import { useState } from 'react';
import { useVideoChat, VideoState } from './hooks/useVideoChat.js';
import { useTextChat, TextState } from './hooks/useTextChat.js';
import Landing from './components/Landing.jsx';
import SelfPreview from './components/SelfPreview.jsx';
import VideoRoom from './components/VideoRoom.jsx';
import TextRoom from './components/TextRoom.jsx';

export default function App() {
  const [region, setRegion] = useState('anywhere');
  const [mode, setMode] = useState(null); // 'video' | 'text' | null

  const videoChat = useVideoChat();
  const textChat = useTextChat();

  // ---- Landing ----
  if (mode === null) {
    return (
      <Landing
        online={videoChat.online}
        onStart={(r, m) => {
          setRegion(r);
          setMode(m);
          if (m === 'video') videoChat.begin();
          else if (m === 'text') textChat.start(r);
        }}
      />
    );
  }

  // ---- Text-only flow ----
  if (mode === 'text') {
    if (textChat.state === TextState.IDLE) {
      // user left — back to landing
      setMode(null);
      return null;
    }
    return (
      <TextRoom
        chat={textChat}
        region={region}
        onLeave={() => setMode(null)}
      />
    );
  }

  // ---- Video flow ----
  if (mode === 'video') {
    if (videoChat.state === VideoState.IDLE) {
      setMode(null);
      return null;
    }

    if (videoChat.state === VideoState.REQUESTING_MEDIA) {
      return (
        <div style={{ minHeight: '100vh', background: '#fdfaff', color: '#2d1b4e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', system-ui", fontSize: 16 }}>
          Requesting camera…
        </div>
      );
    }

    if (videoChat.state === VideoState.PREVIEW) {
      return (
        <SelfPreview
          localVideoRef={videoChat.localVideoRef}
          onReady={() => videoChat.confirmReady(region)}
          onLeave={() => { videoChat.leave(); setMode(null); }}
          online={videoChat.online}
        />
      );
    }

    return (
      <VideoRoom
        chat={videoChat}
        region={region}
      />
    );
  }

  return null;
}