import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If there's a hash, let the browser handle anchor scrolling; otherwise scroll to top
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
