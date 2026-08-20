import type { Icon } from "@phosphor-icons/react";

import type { Lang } from "@/components/hero/codeHighlight";
import type { Side } from "@/components/hero/connectors";

export type PortfolioStage = "hero" | "projects" | "resume" | "contact";
export type ProjectStatus = "complete" | "in_progress";
export type SystemBand = "request" | "data" | "ops";
export type SystemNodeKind = "client" | "service" | "data" | "ops" | "core";
export type SystemEdgeKind = "request" | "response" | "data" | "async" | "ops";

export interface ProjectData {
  id: string;
  status: ProjectStatus;
  placeholderTitle: string;
  title?: string;
  summary?: string;
  tags: string[];
  images: string[];
  repositoryUrl?: string;
  demoUrl?: string;
}

export interface SystemNodeData {
  id: string;
  title: string;
  subtitle: string;
  icon: Icon;
  kind: SystemNodeKind;
  band: SystemBand;
  stage: PortfolioStage;
  x: number;
  y: number;
  code: string;
  language: Lang;
  initiallyExpanded?: boolean;
}

export interface SystemEdgeData {
  id: string;
  from: string;
  fromSide: Side;
  to: string;
  toSide: Side;
  kind: SystemEdgeKind;
  band: SystemBand;
  label?: string;
}

export interface TrafficStep {
  edgeIds: string[];
  reverseEdgeIds?: string[];
  pauseMs?: number;
}

export interface TrafficScenario {
  id: string;
  band: SystemBand;
  weight: number;
  steps: TrafficStep[];
}
