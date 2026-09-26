import { useMatch, MatchState } from './hooks/useMatch.js';
import Landing from './components/Landing.jsx';
import StatusPanel from './components/StatusPanel.jsx';

export default function App() {
  const { state, peerId, initiator, error, findMatch, cancel, leave } = useMatch();

  const showLanding = state === MatchState.IDLE && !peerId;

  return (
    <div>
      {showLanding ? (
        <Landing onStart={findMatch} />
      ) : (
        <StatusPanel
          state={state}
          peerId={peerId}
          initiator={initiator}
          error={error}
          onCancel={cancel}
          onLeave={leave}
        />
      )}
    </div>
  );
}