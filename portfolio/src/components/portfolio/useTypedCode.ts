import { useEffect, useState } from "react";

interface TypedCodeState {
  expanded: boolean;
  bodyMounted: boolean;
  visibleCode: string;
  typing: boolean;
  toggle: () => boolean;
}

export function useTypedCode(
  code: string,
  initiallyExpanded: boolean,
  reduceMotion: boolean,
): TypedCodeState {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [bodyMounted, setBodyMounted] = useState(initiallyExpanded);
  const [visibleCharacters, setVisibleCharacters] = useState(
    initiallyExpanded ? code.length : 0,
  );

  useEffect(() => {
    if (reduceMotion) return;

    const distance = expanded
      ? code.length - visibleCharacters
      : visibleCharacters;
    if (distance <= 0) {
      if (expanded || !bodyMounted) return;
      const unmountTimer = window.setTimeout(() => setBodyMounted(false), 0);
      return () => window.clearTimeout(unmountTimer);
    }

    const charactersPerTick = Math.max(
      1,
      Math.ceil(code.length / (expanded ? 32 : 20)),
    );
    const timer = window.setTimeout(
      () => {
        setVisibleCharacters((current) => {
          return expanded
            ? Math.min(code.length, current + charactersPerTick)
            : Math.max(0, current - charactersPerTick);
        });
      },
      expanded ? 18 : 12,
    );

    return () => window.clearTimeout(timer);
  }, [bodyMounted, code, expanded, reduceMotion, visibleCharacters]);

  const toggle = () => {
    const next = !expanded;
    if (reduceMotion) {
      setVisibleCharacters(next ? code.length : 0);
      setBodyMounted(next);
    } else if (next) {
      setBodyMounted(true);
    }
    setExpanded(next);
    return next;
  };

  return {
    expanded,
    bodyMounted: reduceMotion ? expanded : bodyMounted,
    visibleCode: reduceMotion
      ? expanded
        ? code
        : ""
      : code.slice(0, visibleCharacters),
    typing: !reduceMotion && expanded && visibleCharacters < code.length,
    toggle,
  };
}
