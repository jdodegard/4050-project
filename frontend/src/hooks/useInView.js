import { useCallback, useEffect, useState } from 'react';

// flips to true the first time the element scrolls into view, then stops watching.
// used to fire the entrance animations instead of running everything on load.
//
// two things worth knowing:
// the ref is a callback ref because pages that show a spinner first mount the real
// element on a later render, and a plain useRef never tells us it turned up.
// and there's a timeout backstop, because .reveal starts at opacity 0 - if the
// observer never reports for any reason the content would just stay invisible,
// which is not a trade worth making for an entrance animation.
export function useInView(margin = '0px 0px -10% 0px') {
  const [node, setNode] = useState(null);
  const [seen, setSeen] = useState(false);
  const ref = useCallback(el => setNode(el), []);

  useEffect(() => {
    if (!node || seen) return;

    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.05 }
    );
    io.observe(node);

    const backstop = setTimeout(() => setSeen(true), 2000);

    return () => {
      clearTimeout(backstop);
      io.disconnect();
    };
  }, [node, seen, margin]);

  return [ref, seen];
}
