import type { Icon } from "@phosphor-icons/react";

import type { Lang } from "@/components/hero/codeHighlight";

export type PortfolioStage = "hero" | "projects" | "resume" | "contact";
export type ProjectStatus = "complete" | "in_progress";
export type SystemScene = "ingress" | "application" | "operations";
export type SystemNodeKind =
  | "client"
  | "edge"
  | "service"
  | "data"
  | "async"
  | "delivery"
  | "ops"
  | "security";
export type SystemEdgeKind =
  | "request"
  | "data"
  | "async"
  | "delivery"
  | "telemetry"
  | "control";
export type SystemAlignment = "start" | "center" | "end";
export type SystemTrunk = "gateway" | "origin" | "recovery";

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
  code: string;
  language: Lang;
  initiallyExpanded?: boolean;
}

export interface SystemNodePlacement {
  nodeId: string;
  row: number;
  column: number;
  span: number;
}

export interface SystemClusterData {
  id: string;
  scene: SystemScene;
  stage: PortfolioStage;
  order: string;
  title: string;
  subtitle: string;
  offset: number;
  width: number;
  align: SystemAlignment;
  rowGap: number;
  placements: SystemNodePlacement[];
}

export interface SystemStandaloneData {
  nodeId: string;
  scene: SystemScene;
  stage: PortfolioStage;
  offset: number;
  width: number;
  align: SystemAlignment;
  eyebrow: string;
}

export interface SystemEdgeData {
  id: string;
  from: string;
  to: string;
  kind: SystemEdgeKind;
  scene: SystemScene;
  trunk?: SystemTrunk;
  bidirectional?: boolean;
  label?: string;
}

export interface TrafficStep {
  edgeIds: string[];
  reverseEdgeIds?: string[];
  pauseMs?: number;
}

export interface TrafficScenario {
  id: string;
  scene: SystemScene;
  weight: number;
  steps: TrafficStep[];
}

export interface SystemDefinition {
  clusters: SystemClusterData[];
  standalones: SystemStandaloneData[];
  nodes: SystemNodeData[];
  edges: SystemEdgeData[];
  scenarios: TrafficScenario[];
}
