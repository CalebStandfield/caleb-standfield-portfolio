import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  type AnimationPlaybackControls,
  type PanInfo,
} from "motion/react";

const SPRING = { type: "spring", stiffness: 240, damping: 30 } as const;
const WHEEL_IDLE_MS = 140; // snap once horizontal scrolling goes quiet
const FLICK_PX_S = 350; // release speed that counts as a flick

function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}

// Signed distance from the front, wrapped into [-n/2, n/2) so the wheel has
// no ends: with 4 items the card behind sits at -2 and the rest at -1, 0, 1.
export function wrapOffset(distance: number, n: number): number {
  return n ? mod(distance + n / 2, n) - n / 2 : 0;
}

// State and input for a circular wheel of `count` items. `position` is a
// float index that is never wrapped (wrapOffset handles display), so spinning
// past the last item just keeps counting. One step of input movement equals
// `stepFraction` of the stage width.
export function useWheel({
  count,
  stepFraction,
}: {
  count: number;
  stepFraction: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const position = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const target = useRef(0);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const panStart = useRef<number | null>(null);
  const dragged = useRef(false);

  useMotionValueEvent(position, "change", (value) =>
    setIndex(mod(Math.round(value), count)),
  );

  const settle = useCallback(
    (to: number) => {
      target.current = to;
      anim.current?.stop();
      anim.current = animate(position, to, SPRING);
    },
    [position],
  );

  // free movement from a drag or trackpad: follow the input directly
  const follow = useCallback(
    (to: number) => {
      anim.current?.stop();
      target.current = to;
      position.set(to);
    },
    [position],
  );

  const step = useCallback(
    (delta: number) => settle(Math.round(target.current) + delta),
    [settle],
  );

  const go = useCallback(
    (i: number) => {
      const from = Math.round(target.current);
      settle(from + wrapOffset(i - mod(from, count), count));
    },
    [settle, count],
  );

  const stepPx = useCallback(
    () => Math.max(1, (stageRef.current?.clientWidth ?? 1) * stepFraction),
    [stepFraction],
  );

  // horizontal trackpad scroll (or shift + wheel) spins; vertical scroll is
  // left alone so the page still scrolls over the wheel. Native listener
  // because React's onWheel is passive and cannot preventDefault.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let idle = 0;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      follow(position.get() + event.deltaX / stepPx());
      window.clearTimeout(idle);
      idle = window.setTimeout(() => step(0), WHEEL_IDLE_MS);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      window.clearTimeout(idle);
    };
  }, [follow, position, step, stepPx]);

  // touch and pen swipe. Mouse is skipped so text on the card stays
  // selectable; mouse users have arrows, keys, and the neighbor click.
  const onPanStart = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    panStart.current = position.get();
    dragged.current = true;
    anim.current?.stop();
  };

  const onPan = (_event: PointerEvent, info: PanInfo) => {
    if (panStart.current === null) return;
    follow(panStart.current - info.offset.x / stepPx());
  };

  // a flick moves one step in its direction, a slow drag snaps to nearest
  const onPanEnd = (_event: PointerEvent, info: PanInfo) => {
    if (panStart.current === null) return;
    const from = Math.round(panStart.current);
    panStart.current = null;
    // touch usually sends no click after a swipe; clear the flag once any
    // click from this release has had its chance to run
    window.setTimeout(() => (dragged.current = false), 0);
    if (Math.abs(info.velocity.x) > FLICK_PX_S) {
      settle(from - Math.sign(info.velocity.x));
    } else {
      step(0);
    }
  };

  // the click that ends a swipe should not open a link or pick a neighbor
  const onClickCapture = (event: MouseEvent) => {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLVideoElement) return;
    if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
    else return;
    event.preventDefault();
  };

  return {
    position,
    index,
    go,
    step,
    bind: {
      ref: stageRef,
      onPanStart,
      onPan,
      onPanEnd,
      onClickCapture,
      onKeyDown,
    },
  };
}
