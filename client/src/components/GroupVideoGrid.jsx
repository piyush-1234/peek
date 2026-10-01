export default function GroupVideoGrid({ localVideoRef, peers, videoEnabled, localSocketId }) {
  const total = peers.length + 1; // include self
  const gridCols = total <= 2 ? 2 : 2; // 2x1, 2x2
  const gridRows = total <= 2 ? 1 : 2;

  return (
    <div
      className="group-grid"
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, 1fr)`,
      }}
    >
      {/* Self tile */}
      <div className="group-tile group-tile-self">
        {videoEnabled ? (
          <video ref={localVideoRef} autoPlay playsInline muted className="group-video" />
        ) : (
          <div className="group-tile-audio">
            <div className="group-mic-icon">🎙</div>
          </div>
        )}
        <div className="group-tile-label">
          <span className="group-tile-dot self" />
          You
        </div>
      </div>

      {/* Peer tiles */}
      {peers.map((peer) => (
        <GroupTile key={peer.socketId} peer={peer} />
      ))}

      {/* Empty placeholder tiles when waiting for more users */}
      {Array.from({ length: Math.max(0, 3 - peers.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="group-tile group-tile-empty">
          <div className="group-empty-content">
            <div className="group-empty-spinner" />
            <div className="group-empty-text">Waiting for someone…</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupTile({ peer }) {
  return (
    <div className="group-tile">
      {peer.stream ? (
        <video
          autoPlay
          playsInline
          className="group-video"
          ref={(el) => { if (el && el.srcObject !== peer.stream) el.srcObject = peer.stream; }}
        />
      ) : (
        <div className="group-tile-audio">
          <div className="group-mic-icon">🎙</div>
        </div>
      )}
      <div className="group-tile-label">
        <span className="group-tile-dot" />
        Stranger
      </div>
    </div>
  );
}