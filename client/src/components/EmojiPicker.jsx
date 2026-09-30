import { useEffect, useRef, useState } from 'react';

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊',
  '😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜',
  '🤪','😝','🤗','🤔','🤨','😐','😑','😶','🙄','😏','😒','😞',
  '😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭',
  '😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥',
  '😓','🤝','🙏','👍','👎','👌','✌️','🤞','🤟','🤘','👋','🤙',
  '💪','🦾','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕',
  '💖','💗','💘','💝','✨','⭐','🌟','💫','🔥','💯','🎉','🎊',
  '🍕','🍔','🍟','🌮','🍣','🍩','🍪','🎂','☕','🍺','🍷','🥤',
  '🎮','🎲','🎯','🎸','🎧','🎬','📱','💻','🚀','🌈','⚡','🌍',
];

export default function EmojiPicker({ onPick, onClose }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onClose?.();
    };
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div className="emoji-picker" ref={wrapRef}>
      <div className="emoji-grid">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className="emoji-btn"
            onClick={() => onPick(e)}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}