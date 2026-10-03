import { useEffect, useState } from 'react';
import { VideoState } from '../hooks/useVideoChat.js';
import { useGame } from '../hooks/useGame.js';
import { useTwoTruths } from '../hooks/useTwoTruths.js';
import { socket } from '../lib/socket.js';
import Icebreaker from './Icebreaker.jsx';
import Nav from './Nav.jsx';
import ChatSidebar from './ChatSidebar.jsx';
import GamePanel from './GamePanel.jsx';

export default function VideoRoom({ chat, region, interests = [] }) {
  const {
    state, error, online, peerId,
    videoEnabled, peerVideoEnabled,
    sharedInterests,
    localVideoRef, remoteVideoRef, localStreamRef,
    next, retry, leave, report, toggleVideo,
  } = chat;
  const [reportOpen, setReportOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

  // Games live here so both peers can see when one starts
  const wyr = useGame(peerId, socket.id);
  const tt = useTwoTruths(peerId);

  const anyGameActive = wyr.active || tt.active;

  // Auto-open the panel when the peer starts a game
  useEffect(() => {
    if (anyGameActive) setGameOpen(true);
  }, [anyGameActive]);

  // Reset panel when peer changes
  useEffect(() => {
    setGameOpen(false);
  }, [peerId]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [state, localStreamRef, localVideoRef]);

  const overlayText = (() => {
    switch (state) {
      case VideoState.WAITING: return 'Finding someone for you…';
      case VideoState.NEGOTIATING: return 'Almost there…';
      case VideoState.FAILED: return error?.message || 'Something went wrong';
      default: return '';
    }
  })();

  const showOverlay =
    state === VideoState.WAITING ||
    state === VideoState.NEGOTIATING ||
    state === VideoState.FAILED;

  const isLive = state === VideoState.CONNECTED;
  const showGamePanel = isLive && (gameOpen || anyGameActive);

  return (
    <div className="room-page">
      <Nav online={online} onLogoClick={leave} showStats />

      <div className="room-inner">
        <div className={`room-main ${showGamePanel ? 'has-game' : ''}`}>
          <div className="room-videos">
            <video ref={remoteVideoRef} autoPlay playsInline className="room-remote" />

            {isLive && !peerVideoEnabled && (
              <div className="room-audio-only">
                <div className="room-audio-avatar">🎙</div>
                <div className="room-audio-label">Audio-only chat</div>
              </div>
            )}

            <div className={`room-local-wrap ${!videoEnabled ? 'audio-only' : ''}`}>
              {videoEnabled ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="room-local" />
              ) : (
                <div className="room-local-audio">
                  <div className="room-local-mic">🎙</div>
                </div>
              )}
              <span className="room-local-label">You</span>
            </div>

            {isLive && (
              <div className="room-live-badge">
                <span className="room-live-dot" />
                {videoEnabled ? 'LIVE' : 'AUDIO'}
              </div>
            )}

            {isLive && sharedInterests?.length > 0 && (
              <div className="shared-interests">
                🎯 You both like: {sharedInterests.join(' · ')}
              </div>
            )}

            {isLive && !showGamePanel && <Icebreaker visible />}

            {showOverlay && (
              <div className="room-overlay">
                {state === VideoState.WAITING && <div className="room-spinner" aria-hidden="true" />}
                <div className="room-overlay-text">{overlayText}</div>
                {state === VideoState.WAITING && online?.waiting > 0 && (
                  <div className="room-overlay-sub">
                    {online.waiting} {online.waiting === 1 ? 'person is' : 'people are'} waiting with you
                  </div>
                )}
                {state === VideoState.FAILED && (
                  <button className="room-btn room-btn-primary" onClick={() => retry(region, interests)}>
                    Try again
                  </button>
                )}
              </div>
            )}

            {state === VideoState.DISCONNECTED && (
              <div className="room-overlay">
                <div className="room-overlay-emoji">👋</div>
                <div className="room-overlay-text">They left the chat</div>
                <div className="room-overlay-buttons">
                  <button className="room-btn room-btn-primary" onClick={() => next(region, interests)}>
                    Meet someone new
                  </button>
                  <button className="room-btn room-btn-danger" onClick={leave}>
                    Leave
                  </button>
                </div>
              </div>
            )}
          </div>

          <ChatSidebar peerId={peerId} visible={isLive} />

          {showGamePanel && (
            <GamePanel
              wyr={wyr}
              tt={tt}
              onClose={() => setGameOpen(false)}
            />
          )}
        </div>

        <div className="room-controls">
          <button
            className="room-ctrl room-ctrl-game"
            onClick={() => {
              if (showGamePanel) {
                if (wyr.active) wyr.leave();
                if (tt.active) tt.leave();
                setGameOpen(false);
              } else {
                setGameOpen(true);
              }
            }}
            disabled={!isLive}
          >
            <span className="room-ctrl-icon">🎮</span>
            <span className="room-ctrl-label">{showGamePanel ? 'Hide games' : 'Play game'}</span>
          </button>

          <button
            className={`room-ctrl ${videoEnabled ? 'room-ctrl-audio' : 'room-ctrl-video-on'}`}
            onClick={toggleVideo}
          >
            <span className="room-ctrl-icon">{videoEnabled ? '🎙' : '📹'}</span>
            <span className="room-ctrl-label">{videoEnabled ? 'Audio only' : 'Video on'}</span>
          </button>

          <button
            className="room-ctrl room-ctrl-next"
            onClick={() => next(region, interests)}
            disabled={state === VideoState.WAITING}
          >
            <span className="room-ctrl-icon">⏭</span>
            <span className="room-ctrl-label">Next</span>
          </button>

          <button
            className="room-ctrl room-ctrl-report"
            onClick={() => setReportOpen(true)}
            disabled={state !== VideoState.CONNECTED}
          >
            <span className="room-ctrl-icon">⚠</span>
            <span className="room-ctrl-label">Report</span>
          </button>

          <button className="room-ctrl room-ctrl-leave" onClick={leave}>
            <span className="room-ctrl-icon">✕</span>
            <span className="room-ctrl-label">Leave</span>
          </button>
        </div>
      </div>

      {reportOpen && (
        <ReportDialog
          onCancel={() => setReportOpen(false)}
          onSubmit={(reason) => {
            report(reason);
            setReportOpen(false);
            leave();
          }}
        />
      )}
    </div>
  );
}

function ReportDialog({ onCancel, onSubmit }) {
  const [reason, setReason] = useState('nudity');
  return (
    <div className="room-modal-bg">
      <div className="room-modal">
        <h3 className="room-modal-title">Report this chat</h3>
        <p className="room-modal-sub">Your report is anonymous and helps keep Peek safe.</p>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="room-modal-select">
          <option value="nudity">Nudity / sexual content</option>
          <option value="harassment">Harassment / abuse</option>
          <option value="minor">Underage user</option>
          <option value="spam">Spam / bot</option>
          <option value="other">Other</option>
        </select>
        <div className="room-modal-actions">
          <button className="room-btn room-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="room-btn room-btn-danger" onClick={() => onSubmit(reason)}>
            Report & Leave
          </button>
        </div>
      </div>
    </div>
  );
}