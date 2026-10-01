import { useState, lazy, Suspense } from 'react';
import { useVideoChat, VideoState } from './hooks/useVideoChat.js';
import { useTextChat, TextState } from './hooks/useTextChat.js';
import Landing from './components/Landing.jsx';

// Lazy-load heavy components — only fetched when needed
const SelfPreview = lazy(() => import('./components/SelfPreview.jsx'));
const VideoRoom = lazy(() => import('./components/VideoRoom.jsx'));
const TextRoom = lazy(() => import('./components/TextRoom.jsx'));

function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fdfaff',
      color: '#2d1b4e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins', system-ui",
      fontSize: 16,
    }}>
      Loading…
    </div>
  );
}

export default function App() {
  const [region, setRegion] = useState('anywhere');
  const [mode, setMode] = useState(null);

  const videoChat = useVideoChat();
  const textChat = useTextChat();

  if (mode === null) {
    return (
      <Landing
        online={videoChat.online}
        onStart={(r, m) => {
          setRegion(r);
          setMode(m);
          if (m === 'video') videoChat.begin('video');
          else if (m === 'audio') videoChat.begin('audio');
          else if (m === 'text') textChat.start(r);
        }}
      />
    );
  }

  if (mode === 'text') {
    if (textChat.state === TextState.IDLE) {
      setMode(null);
      return null;
    }
    return (
      <Suspense fallback={<Loading />}>
        <TextRoom chat={textChat} region={region} onLeave={() => setMode(null)} />
      </Suspense>
    );
  }

  if (mode === 'video' || mode === 'audio') {
    if (videoChat.state === VideoState.IDLE) {
      setMode(null);
      return null;
    }

    if (videoChat.state === VideoState.REQUESTING_MEDIA) {
      return <Loading />;
    }

    if (videoChat.state === VideoState.PREVIEW) {
      return (
        <Suspense fallback={<Loading />}>
          <SelfPreview
            localVideoRef={videoChat.localVideoRef}
            onReady={() => videoChat.confirmReady(region)}
            onLeave={() => { videoChat.leave(); setMode(null); }}
            online={videoChat.online}
            mode={mode}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<Loading />}>
        <VideoRoom chat={videoChat} region={region} />
      </Suspense>
    );
  }

  return null;
}