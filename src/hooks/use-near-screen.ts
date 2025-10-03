
'use client'

import { useEffect, useState, useRef } from 'react'

interface useNearScreenProps {
  distance?: string;
  externalRef?: React.RefObject<HTMLElement> | null;
  once?: boolean;
}

export function useNearScreen({ distance = '100px', externalRef, once = true }: useNearScreenProps) {
  const [isNearScreen, setShow] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    const element = externalRef ? externalRef.current : fromRef.current;

    const onChange = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const el = entries[0];
      if (el.isIntersecting) {
        setShow(true);
        if (once) {
          observer.disconnect();
        }
      } else {
        if (!once) {
            setShow(false);
        }
      }
    }

    // Lazy load the polyfill if needed
    Promise.resolve(
      typeof IntersectionObserver !== 'undefined'
        ? IntersectionObserver
        : import('intersection-observer')
    ).then(() => {
      if(element) {
        observer = new IntersectionObserver(onChange, {
          rootMargin: distance,
        });
        observer.observe(element);
      }
    });

    return () => observer && observer.disconnect();
  }, [distance, externalRef, once]);


  return { isNearScreen, fromRef };
}
