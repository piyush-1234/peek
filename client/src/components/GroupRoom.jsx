import GroupChat from './GroupChat.jsx';
import { useEffect } from 'react';
import { GroupState } from '../hooks/useGroupChat.js';
import Nav from './Nav.jsx';
import GroupVideoGrid from './GroupVideoGrid.jsx';

export default function GroupRoom({ chat, region }) {
  const {
    state, roomId, peers, error, online, videoEnabled,
    localVideoRef,
    toggleVideo, leave, report,
  } = chat;

  return (
    <div className="room-page">
      <Nav online={online} onLogoClick={leave} showStats />

      <div className="room-inner">
        <div className="room-main">
          <div className="room-videos group-videos-container">
            <GroupVideoGrid
              localVideoRef={localVideoRef}
              peers={peers}
              videoEnabled={videoEnabled}
            />

            <div className="group-status-bar">
              <span className="group-status-dot" />
              {state === GroupState.WAITING && 'Waiting for others to join…'}
              {state === GroupState.CONNECTING && 'Connecting to room…'}
              {state === GroupState.CONNECTED && `Room active · ${peers.length + 1}/4`}
              {state === GroupState.DISCONNECTED && 'Disconnected'}
            </div>

            {error && (
              <div className="room-overlay">
                <div className="room-overlay-text">{error.message}</div>
                <div className="room-overlay-buttons">
                  <button className="room-btn room-btn-danger" onClick={leave}>Leave</button>
                </div>
              </div>
            )}
          </div>

          {state === GroupState.CONNECTED && <GroupChat roomId={roomId} visible />}
        </div>

        <div className="room-controls">
          <button
            className="room-ctrl room-ctrl-group-invite"
            disabled
            title="Invite — coming soon"
          >
            <span className="room-ctrl-icon">👥</span>
            <span className="room-ctrl-label">{peers.length + 1}/4</span>
          </button>

          <button
            className={`room-ctrl ${videoEnabled ? 'room-ctrl-audio' : 'room-ctrl-video-on'}`}
            onClick={toggleVideo}
          >
            <span className="room-ctrl-icon">{videoEnabled ? '🎙' : '📹'}</span>
            <span className="room-ctrl-label">{videoEnabled ? 'Hide cam' : 'Show cam'}</span>
          </button>

          <button className="room-ctrl room-ctrl-leave" onClick={leave}>
            <span className="room-ctrl-icon">✕</span>
            <span className="room-ctrl-label">Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
}