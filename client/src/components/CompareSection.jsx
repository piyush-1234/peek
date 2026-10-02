export default function CompareSection() {
  return (
    <section className="compare-section" id="compare">
      <div className="section-head">
        <p className="section-eyebrow">Why Peek Moment</p>
        <h2 className="section-title">How Peek Moment compares to Omegle & others</h2>
        <p className="section-sub">
          Omegle shut down in 2023 after 14 years — largely because it couldn't protect users.
          Peek Moment is built as a safe, modern alternative.
        </p>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th className="col-us">Peek Moment</th>
              <th>Omegle (dead)</th>
              <th>OmeTV</th>
              <th>Chatroulette</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>No signup required</td>
              <td className="col-us">✅</td>
              <td>✅</td>
              <td>❌ (account)</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>18+ enforcement</td>
              <td className="col-us">✅</td>
              <td>❌</td>
              <td>⚠️ weak</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>One-tap Report on every chat</td>
              <td className="col-us">✅</td>
              <td>⚠️ limited</td>
              <td>⚠️ limited</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>Interest / topic matching</td>
              <td className="col-us">✅</td>
              <td>❌</td>
              <td>❌</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>Audio-only mode</td>
              <td className="col-us">✅</td>
              <td>❌</td>
              <td>❌</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>Text-only mode</td>
              <td className="col-us">✅</td>
              <td>✅</td>
              <td>⚠️</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>Group video chat</td>
              <td className="col-us">✅ (4)</td>
              <td>❌</td>
              <td>❌</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>In-chat games</td>
              <td className="col-us">✅</td>
              <td>❌</td>
              <td>❌</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>Video never touches server</td>
              <td className="col-us">✅</td>
              <td>❌</td>
              <td>❌</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>No profiles / no history</td>
              <td className="col-us">✅</td>
              <td>✅</td>
              <td>❌</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>Free to use</td>
              <td className="col-us">✅</td>
              <td>✅</td>
              <td>✅</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>Still online</td>
              <td className="col-us">✅</td>
              <td>❌ (shut 2023)</td>
              <td>✅</td>
              <td>✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="compare-note">
        <p>
          <strong>Our view:</strong> The old "wild west" of random chat is gone — and that's a good
          thing. Peek Moment is what comes after: safer, smarter, warmer, and built for adults who
          actually want to meet new people. Not for predation. Not for shock. Just for conversation.
        </p>
      </div>
    </section>
  );
}