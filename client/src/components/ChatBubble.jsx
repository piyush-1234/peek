export default function ChatBubble({ message, variant = 'default' }) {
  const { text, mine, status, ts } = message;

  const isEmojiOnly = /^[\p{Emoji}\s]+$/u.test(text) && text.trim().length > 0;

  const baseClass =
    variant === 'sidebar' ? 'chat-bubble' : 'text-bubble';

  return (
    <div className={`${baseClass} ${mine ? 'mine' : 'theirs'} ${isEmojiOnly ? 'emoji-only' : ''}`}>
      {variant === 'sidebar' ? (
        <>
          {text}
          {mine && <StatusIcon status={status} />}
        </>
      ) : (
        <div className="text-bubble-content">
          {text}
          {mine && <StatusIcon status={status} />}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === 'sent') {
    return <span className="msg-status" title="Sent">✓</span>;
  }
  if (status === 'delivered') {
    return <span className="msg-status" title="Delivered">✓✓</span>;
  }
  if (status === 'read') {
    return <span className="msg-status read" title="Read">Read</span>;
  }
  return null;
}