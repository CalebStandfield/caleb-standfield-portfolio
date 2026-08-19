import { useState } from "react";

import { CardShell } from "./CardShell";
import { Carousel } from "./Carousel";
import type { CardData } from "./system.config";

interface ProjectCardProps {
  card: CardData;
  index: number;
  animate: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  /** Called when the card finishes opening, so the diagram can pulse light. */
  onOpen?: () => void;
  /** flow = static full-width (mobile); default = absolute positioned. */
  flow?: boolean;
}

// A project card: same shell as ServiceCard, but the body is an image carousel
// instead of typed code.
export function ProjectCard({
  card,
  index,
  animate,
  registerRef,
  onOpen,
  flow = false,
}: ProjectCardProps) {
  // open drives the caret/aria; expanded drives the body height. No typing
  // reveal here, so the two track together through the grid collapse.
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setExpanded(true);
      // Body height transition is 300ms; fire the pulse once it has opened.
      window.setTimeout(() => onOpen?.(), 320);
    } else {
      setExpanded(false);
    }
  };

  return (
    <CardShell
      card={card}
      index={index}
      animate={animate}
      registerRef={registerRef}
      flow={flow}
      open={open}
      expanded={expanded}
      onToggle={toggle}
    >
      <Carousel images={card.images ?? []} title={card.title} />
    </CardShell>
  );
}
