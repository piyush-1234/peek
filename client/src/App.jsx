import { useState, lazy, Suspense } from 'react';
import { useVideoChat, VideoState } from './hooks/useVideoChat.js';
import { useTextChat, TextState } from './hooks/useTextChat.js';
import { useGroupChat, GroupState } from './hooks/useGroupChat.js';
import Landing from './components/Landing.jsx';

const SelfPreview = lazy(() => import('./components/SelfPreview.jsx'));
const VideoRoom = lazy(() => import('./components/VideoRoom.jsx'));
const TextRoom = lazy(() => import('./components/TextRoom.jsx'));
const GroupRoom = lazy(() => import('./components/GroupRoom.jsx'));

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
  const [interests, setInterests] = useState([]);

  const videoChat = useVideoChat();
  const textChat = useTextChat();
  const groupChat = useGroupChat();

  if (mode === null) {
    return (
      <Landing
        online={videoChat.online}
        onStart={(r, m, ints = []) => {
          setRegion(r);
          setMode(m);
          setInterests(ints);
          if (m === 'video') videoChat.begin('video');
          else if (m === 'audio') videoChat.begin('audio');
          else if (m === 'text') textChat.start(r, ints);
          else if (m === 'group') groupChat.begin(r, ints);
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
        <TextRoom chat={textChat} region={region} onLeave={() => setMode(null)} interests={interests} />
      </Suspense>
    );
  }

  if (mode === 'group') {
    if (groupChat.state === GroupState.IDLE) {
      setMode(null);
      return null;
    }
    if (groupChat.state === GroupState.REQUESTING_MEDIA) {
      return <Loading />;
    }
    return (
      <Suspense fallback={<Loading />}>
        <GroupRoom chat={groupChat} region={region} />
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
            onReady={() => videoChat.confirmReady(region, interests)}
            onLeave={() => { videoChat.leave(); setMode(null); }}
            online={videoChat.online}
            mode={mode}
          />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <VideoRoom chat={videoChat} region={region} interests={interests} />
      </Suspense>
    );
  }

  return null;
}