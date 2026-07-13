import { useEffect, useRef, useState } from 'react';

// flips to true the first time the element scrolls into view, then stops watching.
// used to fire the entrance animations instead of running everything on load.
export function useInView(margin = '0px 0px -10% 0px') {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);

  return [ref, seen];
}
