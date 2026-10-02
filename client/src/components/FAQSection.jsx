import { useState } from 'react';

const FAQS = [
  {
    q: 'What is Peek Moment and how does it work?',
    a: 'Peek Moment is a free random video chat platform that instantly connects you with strangers from around the world. Click Start, choose a mode (Video, Audio, Text or Group), and you\'ll be matched with a real person within seconds. No signup, no profile, no history.',
  },
  {
    q: 'Do I need to create an account to use Peek Moment?',
    a: 'No. Peek Moment is fully anonymous. No email, no phone number, no social login. You only need to confirm you\'re 18+ before starting a chat. Your session disappears when you close the tab.',
  },
  {
    q: 'Is Peek Moment free?',
    a: 'Yes — the core experience (video, audio, text, and group chat) is completely free. Optional paid features like rewards and food ordering are clearly marked.',
  },
  {
    q: 'Is it safe to video chat with strangers on Peek Moment?',
    a: 'We take safety seriously. Every chat has one-tap Leave and Report buttons. Reports are logged and reviewed. We use automated moderation to flag inappropriate content, and 18+ enforcement is mandatory. That said, use common sense — never share personal details with strangers.',
  },
  {
    q: 'Can the other person record my video?',
    a: 'Peek Moment does not record your sessions — all video streams are peer-to-peer and never pass through our servers. However, we cannot prevent users from screen-recording with external tools. Behave as though you might be recorded: never do anything on camera you wouldn\'t want public.',
  },
  {
    q: 'What is the difference between Video, Audio, Text and Group chat?',
    a: 'Video: 1-on-1 camera chat. Audio: voice-only (your camera stays off). Text: chat-only, no camera or mic required. Group: video chat with up to 4 strangers at once in a shared room. All four modes are separate — you only match with people in the same mode as you.',
  },
  {
    q: 'How does interest matching work?',
    a: 'Before starting, you can pick up to 3 topics you want to talk about (Music, Gaming, Travel, etc.). We try to match you with someone who shares at least one interest. If no match is found within 10 seconds, we connect you with anyone in your region so you never wait too long.',
  },
  {
    q: 'Can I play games while video chatting?',
    a: 'Yes! In video, audio, and group chats, you can tap the 🎮 Play Game button to start a round of Would You Rather. Both (or all four) users vote anonymously, then see the results. More games are coming soon.',
  },
  {
    q: 'How does group video chat work?',
    a: 'Group mode supports up to 4 people in a shared video room. Rooms fill as people arrive — the first person waits a moment, then others join instantly. Once the room is full, new users go into a fresh room. Group mode also supports group chat and group games.',
  },
  {
    q: 'Can I choose who I get matched with by gender or country?',
    a: 'Currently, you can filter by region (Anywhere, India, US, UK, Mexico) and by interest topic. Gender filtering is not available — it\'s often misused and creates a worse experience for everyone. Interest-based matching is a better signal of conversation quality.',
  },
  {
    q: 'What should I do if someone shows inappropriate content?',
    a: 'Tap the Report button immediately. Choose a reason (Nudity, Harassment, Underage, Spam, Other) and submit. The chat will end automatically, and the session is logged for review. Repeat offenders are banned permanently.',
  },
  {
    q: 'Why does my camera show a black screen?',
    a: 'Common causes: (1) Your browser doesn\'t have camera permission — check the address bar for a blocked icon. (2) Another app is using the camera — close Zoom, Teams, etc. (3) Your device camera is broken or disabled. (4) You\'re on an unsupported browser — try Chrome or Firefox.',
  },
  {
    q: 'Can I use Peek Moment on my phone?',
    a: 'Yes. Peek Moment is a browser-based app — no download required. Open peekmoment.com in Chrome, Safari, or Firefox on any smartphone, tablet, laptop, or desktop. It works everywhere modern browsers work.',
  },
  {
    q: 'Is Peek Moment a dating app?',
    a: 'No. Peek Moment is a social conversation platform, not a dating service. We discourage romantic solicitations, and we don\'t have profiles, photos, or swipe mechanics. It\'s about meeting people and having real conversations — nothing more.',
  },
  {
    q: 'Does Peek Moment save my chats or messages?',
    a: 'No. Chats are ephemeral. When you close the tab, they\'re gone. We don\'t store chat history, messages, video, or audio. The only things we log are reports (for safety review) and aggregate counts (for stats).',
  },
  {
    q: 'What internet speed do I need?',
    a: 'Peek Moment works on 3G and above. For video chat, we recommend 1 Mbps upload and download. On slower networks, switch to Audio or Text mode for a smoother experience.',
  },
  {
    q: 'How do I leave a chat?',
    a: 'Tap the Leave button at any time. The chat ends instantly for both users, and you return to the home screen. You can also just close the tab — we\'ll clean up automatically.',
  },
  {
    q: 'Are there ads on Peek Moment?',
    a: 'Not in the core experience. We may introduce optional non-intrusive ads or premium features in the future, but we will never sell your data or interrupt chats with ads.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="faq-section" id="faq">
      <div className="section-head">
        <p className="section-eyebrow">Got questions?</p>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-sub">
          Everything you need to know before your first chat.
        </p>
      </div>

      <div className="faq-list">
        {FAQS.map((item, i) => (
          <div
            key={i}
            className={`faq-item ${openIdx === i ? 'open' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              aria-expanded={openIdx === i}
            >
              <span className="faq-q-text">{item.q}</span>
              <span className="faq-toggle">{openIdx === i ? '−' : '+'}</span>
            </button>
            {openIdx === i && (
              <div className="faq-answer">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}