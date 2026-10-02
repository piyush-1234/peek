import { useEffect, useState } from 'react';

export function usePathname() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return path;
}

function scrollToHash(hash) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(hash);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 20;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export function Link({ href, children, className, style, ...rest }) {
  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();

    const [path, hash] = href.split('#');
    const targetPath = path || '/';
    const samePage = window.location.pathname === targetPath;

    if (samePage) {
      scrollToHash(hash);
      return;
    }

    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));

    setTimeout(() => scrollToHash(hash), 120);
  };

  return (
    <a href={href} onClick={handleClick} className={className} style={style} {...rest}>
      {children}
    </a>
  );
}

export function navigate(href) {
  const [path, hash] = href.split('#');
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  setTimeout(() => scrollToHash(hash), 120);
}