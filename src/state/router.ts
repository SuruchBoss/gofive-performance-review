import { useEffect, useState } from 'react';

/** Hash routes, so GitHub Pages needs no server rewrites. */
export function useHashPath(): string {
  const get = () => window.location.hash.replace(/^#/, '') || '/';
  const [path, setPath] = useState(get);
  useEffect(() => {
    const on = () => {
      setPath(get());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}

export function go(path: string) {
  window.location.hash = path;
}
