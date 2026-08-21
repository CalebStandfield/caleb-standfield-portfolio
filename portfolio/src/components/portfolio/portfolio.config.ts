import {
  Archive,
  ArrowsLeftRight,
  Broadcast,
  Browser,
  Cloud,
  CloudArrowDown,
  CloudArrowUp,
  Cube,
  Database,
  DeviceMobile,
  EnvelopeSimple,
  Fingerprint,
  GearSix,
  GitBranch,
  GitCommit,
  HardDrives,
  Lightning,
  Package,
  Pulse,
  ShieldCheck,
  TreeStructure,
  Warning,
} from "@phosphor-icons/react";

import type {
  PortfolioStage,
  ProjectData,
  SystemClusterData,
  SystemDefinition,
  SystemEdgeData,
  SystemEdgeKind,
  SystemNodeData,
  SystemScene,
  SystemStandaloneData,
  TrafficScenario,
} from "./portfolio.types";

export const projectSlots: ProjectData[] = [
  {
    id: "blackjack",
    status: "complete",
    placeholderTitle: "Featured project",
    title: "blackjack",
    tags: [],
    images: ["/blackjack/blackjack_main.png"],
    // Placeholders. Drop either field to hide that button.
    repositoryUrl: "https://github.com/CalebStandfield/blackjack",
    demoUrl: "https://example.com/blackjack",
  },
  {
    id: "pixelify",
    status: "in_progress",
    placeholderTitle: "Currently working on",
    title: "Pixelify",
    summary:
      "A fast, modular image-processing engine built to turn complex pixel workflows into a clean and responsive experience. Designed around reliable backend systems, clear boundaries, and room to scale.",
    tags: ["Rust", "System Design", "Backend", "Distributed Systems"],
    images: [],
    // Placeholders. Drop either field to hide that button.
    repositoryUrl: "https://github.com/CalebStandfield/pixelify",
    demoUrl: "https://example.com/pixelify",
  },
  {
    id: "learn-vim",
    status: "complete",
    placeholderTitle: "Additional project",
    title: "learn-vim",
    tags: [],
    images: [],
    // Placeholders. Drop either field to hide that button.
    repositoryUrl: "https://github.com/CalebStandfield/learn-vim",
    demoUrl: "https://example.com/learn-vim",
  },
  {
    id: "sprite-editor",
    status: "complete",
    placeholderTitle: "Additional project",
    title: "Sprite Editor",
    tags: [],
    images: ["/sprite/sprite_draw.png"],
    // Placeholders. Drop either field to hide that button.
    repositoryUrl: "https://github.com/CalebStandfield/sprite-editor",
    demoUrl: "https://example.com/sprite-editor",
  },
];

export const resume = {
  education: {
    school: "University of Utah",
    location: "Salt Lake City, UT",
    degree: "Bachelor of Science in Computer Science",
    details: ["Minor in Japanese", "Undergraduate Certificate in Data Science"],
    graduation: "Expected December 2026",
    gpa: "3.746 GPA",
  },
  skills: [
    {
      label: "Languages",
      values: ["Rust", "C++", "C#", "Python", "Java", "TypeScript", "HTML", "CSS"],
    },
    {
      label: "Frameworks + tools",
      values: [
        "React",
        "Next.js",
        "Flutter",
        "Tailwind CSS",
        "PostgreSQL",
        "PyTorch",
        "Docker",
        "Git",
        "Qt Creator",
        "LaTeX",
        "Blazor",
      ],
    },
    {
      label: "Specialties",
      values: [
        "Backend development",
        "Full-stack engineering",
        "Concurrency",
        "High-performance systems",
        "API design",
        "Data structures",
        "Machine learning integration",
      ],
    },
  ],
  work: 
    "Adobe summer internship 2026",
} as const;

export const stageScene: Record<PortfolioStage, SystemScene> = {
  hero: "ingress",
  projects: "application",
  resume: "operations",
  contact: "operations",
};

export const edgeColors: Record<SystemEdgeKind, string> = {
  request: "#FF8F40",
  data: "#59C2FF",
  async: "#E6B450",
  delivery: "#B79CFF",
  telemetry: "#95E6CB",
  control: "#AAD94C",
};

export const systemClusters: SystemClusterData[] = [
  {
    id: "ingress",
    scene: "ingress",
    stage: "hero",
    order: "01",
    title: "Ingress",
    subtitle: "clients / edge / identity",
    offset: 20,
    width: 88,
    align: "center",
    rowGap: 120,
    placements: [
      { nodeId: "web_spa", row: 1, column: 1, span: 3 },
      { nodeId: "mobile_app", row: 1, column: 4, span: 3 },
      { nodeId: "cdn", row: 2, column: 4, span: 3 },
      { nodeId: "waf", row: 2, column: 1, span: 3 },
      { nodeId: "auth_service", row: 3, column: 2, span: 4 },
    ],
  },
  {
    id: "application",
    scene: "application",
    stage: "projects",
    order: "02",
    title: "Application + data",
    subtitle: "services / persistence / events",
    offset: 20,
    width: 92,
    align: "center",
    rowGap: 72,
    placements: [
      { nodeId: "profile_service", row: 1, column: 1, span: 3 },
      { nodeId: "project_service", row: 1, column: 4, span: 3 },
      { nodeId: "media_service", row: 2, column: 2, span: 4 },
      { nodeId: "redis", row: 3, column: 1, span: 2 },
      { nodeId: "postgres", row: 3, column: 3, span: 4 },
      { nodeId: "event_bus", row: 4, column: 1, span: 6 },
      { nodeId: "media_worker", row: 5, column: 3, span: 3 },
    ],
  },
  {
    id: "operations",
    scene: "operations",
    stage: "resume",
    order: "03",
    title: "Delivery + operations",
    subtitle: "supply chain / runtime / reliability",
    offset: 20,
    width: 86,
    align: "center",
    rowGap: 56,
    placements: [
      { nodeId: "git_repository", row: 1, column: 1, span: 3 },
      { nodeId: "ci_builder", row: 1, column: 4, span: 3 },
      { nodeId: "oci_registry", row: 2, column: 2, span: 4 },
      { nodeId: "deploy_controller", row: 3, column: 1, span: 6 },
      { nodeId: "runtime_cluster", row: 4, column: 1, span: 6 },
      { nodeId: "otel_collector", row: 5, column: 1, span: 3 },
      { nodeId: "alert_manager", row: 5, column: 4, span: 3 },
    ],
  },
];

export const systemStandalones: SystemStandaloneData[] = [
  { nodeId: "api_gateway", scene: "ingress", stage: "hero", offset: 890, width: 54, align: "center", eyebrow: "policy boundary" },
  { nodeId: "object_store", scene: "application", stage: "projects", offset: 1175, width: 52, align: "end", eyebrow: "durable media" },
  { nodeId: "email_gateway", scene: "operations", stage: "contact", offset: 200, width: 50, align: "start", eyebrow: "external delivery" },
  { nodeId: "backup_vault", scene: "operations", stage: "contact", offset: 370, width: 54, align: "end", eyebrow: "recovery boundary" },
];

function node(data: Omit<SystemNodeData, "initiallyExpanded">): SystemNodeData {
  return { ...data, initiallyExpanded: true };
}

export const systemNodes: SystemNodeData[] = [
  node({ id: "web_spa", title: "Web SPA", subtitle: "React / Vite", icon: Browser, kind: "client", language: "ts", code: `const { data } = await\n  api.profile.get();\nsetProfile(data);\nrender(<Profile />);` }),
  node({ id: "mobile_app", title: "Mobile App", subtitle: "Typed client", icon: DeviceMobile, kind: "client", language: "ts", code: `const res = await\n  api.media.list();\nsetItems(res.data);\nnavigate("/feed");` }),
  node({ id: "cdn", title: "CDN", subtitle: "Assets + media", icon: CloudArrowDown, kind: "edge", language: "nginx", code: `location /assets/ {\n  expires 1y;\n  access_log off;\n  try_files $uri =404;\n}` }),
  node({ id: "waf", title: "WAF", subtitle: "Threat filtering", icon: ShieldCheck, kind: "security", language: "nginx", code: `limit_req zone=api\n  burst=40 nodelay;\nif ($bad_bot) {\n  return 403;\n}` }),
  node({ id: "api_gateway", title: "API Gateway", subtitle: "Routing + policy", icon: ArrowsLeftRight, kind: "edge", language: "rust", code: `Router::new()\n  .nest("/v1", api())\n  .layer(auth())\n  .layer(trace())` }),
  node({ id: "auth_service", title: "Auth Service", subtitle: "OAuth + JWT", icon: Fingerprint, kind: "security", language: "rust", code: `let token = bearer(&req)?;\nlet claims = jwt\n  .decode(token, &key)?;\nrequire_scope(&claims,\n  Scope::Read)?;\nOk(claims)` }),
  node({ id: "profile_service", title: "Profile Service", subtitle: "Profile domain", icon: Database, kind: "service", language: "rust", code: `pub async fn profile(\n  id: UserId,\n) -> Json<Profile> {\n  cache.get_or(id, ||\n    db.load(id)).await\n}` }),
  node({ id: "project_service", title: "Project Catalog", subtitle: "Project domain", icon: TreeStructure, kind: "service", language: "rust", code: `db.insert(project)\n  .await?;\nbus.publish(\n  ProjectAdded)\n  .await?;` }),
  node({ id: "media_service", title: "Media Service", subtitle: "Upload contracts", icon: CloudArrowUp, kind: "service", language: "rust", code: `pub async fn upload(key: Key)\n  -> Result<PresignedUrl> {\n  let url = store\n    .presign_put(key).await?;\n  Ok(url)\n}` }),
  node({ id: "redis", title: "Redis Cache", subtitle: "Read-through cache", icon: Lightning, kind: "data", language: "rust", code: `cache\n  .get(key)\n  .await?\n  .or_load()` }),
  node({ id: "postgres", title: "PostgreSQL", subtitle: "Source of truth", icon: HardDrives, kind: "data", language: "sql", code: `SELECT id, payload\nFROM profiles\nWHERE user_id = $1\n  AND deleted_at IS NULL\nLIMIT 1;` }),
  node({ id: "object_store", title: "Object Store", subtitle: "Assets + media", icon: Cloud, kind: "data", language: "rust", code: `store.put(key, bytes)\n  .content_type(mime)\n  .send().await?;\nOk(Key::from(key))` }),
  node({ id: "event_bus", title: "Event Bus", subtitle: "Durable topics", icon: Broadcast, kind: "async", language: "rust", code: `bus.publish(Topic::MediaUploaded, Event {\n  key: media.key.clone(),\n  at: Utc::now(),\n}).await?;` }),
  node({ id: "media_worker", title: "Media Worker", subtitle: "Image pipeline", icon: GearSix, kind: "async", language: "rust", code: `let out = image\n  ::load(&src)?\n  .resize(1600)\n  .to_webp()?;\nstore.put(out)?;` }),
  node({ id: "email_gateway", title: "Email Gateway", subtitle: "External delivery", icon: EnvelopeSimple, kind: "service", language: "rust", code: `provider.send(Alert {\n  to: oncall.email,\n  incident: id,\n}).await?;` }),
  node({ id: "git_repository", title: "Git Repository", subtitle: "Source + manifests", icon: GitBranch, kind: "delivery", language: "yaml", code: `branch: main\nprotected: true\nrequire_reviews: 2\nchecks:\n  - build\n  - test` }),
  node({ id: "ci_builder", title: "CI Builder", subtitle: "Test + package", icon: GearSix, kind: "delivery", language: "yaml", code: `jobs:\n  build:\n    run: cargo test\n    then: cargo build\n    cache: ~/.cargo` }),
  node({ id: "oci_registry", title: "OCI Registry", subtitle: "Signed images", icon: Package, kind: "delivery", language: "yaml", code: `image: profile-api\ntag: sha-7f3c9a1\ndigest: sha256:8e2...\nsigned: true\nsigner: cosign` }),
  node({ id: "deploy_controller", title: "Deploy Controller", subtitle: "Desired state", icon: GitCommit, kind: "delivery", language: "yaml", code: `syncPolicy:\n  automated:\n    prune: true\n    selfHeal: true\nsource:\n  repoURL: git@repo:profile-api.git` }),
  node({ id: "runtime_cluster", title: "Runtime Cluster", subtitle: "Services + workers", icon: Cube, kind: "delivery", language: "yaml", code: `replicas: 3\nstrategy:\n  type: RollingUpdate\n  maxSurge: 1\nresources:\n  limits: { cpu: 500m, memory: 512Mi }` }),
  node({ id: "otel_collector", title: "OTel Collector", subtitle: "Telemetry intake", icon: Pulse, kind: "ops", language: "yaml", code: `receivers:\n  otlp:\n    protocols:\n      grpc:\nexporters:\n  - prometheus` }),
  node({ id: "alert_manager", title: "Alert Manager", subtitle: "Incident routing", icon: Warning, kind: "ops", language: "yaml", code: `route:\n  group_wait: 30s\n  repeat: 4h\n  receiver: oncall\nroutes:\n  - match: sev=crit` }),
  node({ id: "backup_vault", title: "Backup Vault", subtitle: "Cross-region copies", icon: Archive, kind: "ops", language: "yaml", code: `snapshots: daily\nretention: 35d\nregions:\n  - us-west\n  - us-east\ncopies: 3` }),
];

export const systemEdges: SystemEdgeData[] = [
  { id: "web-cdn", from: "web_spa", to: "cdn", kind: "request", scene: "ingress", bidirectional: true, label: "assets" },
  { id: "mobile-cdn", from: "mobile_app", to: "cdn", kind: "request", scene: "ingress", bidirectional: true },
  { id: "web-waf", from: "web_spa", to: "waf", kind: "request", scene: "ingress", bidirectional: true },
  { id: "mobile-waf", from: "mobile_app", to: "waf", kind: "request", scene: "ingress", bidirectional: true, label: "HTTPS" },
  { id: "waf-gateway", from: "waf", to: "api_gateway", kind: "request", scene: "ingress", bidirectional: true },
  { id: "gateway-auth", from: "api_gateway", to: "auth_service", kind: "control", scene: "ingress", bidirectional: true, label: "claims" },
  { id: "cdn-object", from: "cdn", to: "object_store", kind: "data", scene: "ingress", trunk: "origin", bidirectional: true, label: "origin" },
  { id: "gateway-profile", from: "api_gateway", to: "profile_service", kind: "request", scene: "application", trunk: "gateway", bidirectional: true, label: "/v1" },
  { id: "gateway-project", from: "api_gateway", to: "project_service", kind: "request", scene: "application", trunk: "gateway", bidirectional: true },
  { id: "gateway-media", from: "api_gateway", to: "media_service", kind: "request", scene: "application", trunk: "gateway", bidirectional: true },
  { id: "profile-cache", from: "profile_service", to: "redis", kind: "data", scene: "application", bidirectional: true, label: "cache" },
  { id: "profile-db", from: "profile_service", to: "postgres", kind: "data", scene: "application", bidirectional: true },
  { id: "project-db", from: "project_service", to: "postgres", kind: "data", scene: "application", bidirectional: true, label: "SQL" },
  { id: "media-object", from: "media_service", to: "object_store", kind: "data", scene: "application", bidirectional: true },
  { id: "project-events", from: "project_service", to: "event_bus", kind: "async", scene: "application" },
  { id: "media-events", from: "media_service", to: "event_bus", kind: "async", scene: "application", label: "events" },
  { id: "events-media-worker", from: "event_bus", to: "media_worker", kind: "async", scene: "application" },
  { id: "worker-object", from: "media_worker", to: "object_store", kind: "async", scene: "application" },
  { id: "git-ci", from: "git_repository", to: "ci_builder", kind: "delivery", scene: "operations" },
  { id: "ci-registry", from: "ci_builder", to: "oci_registry", kind: "delivery", scene: "operations", label: "image" },
  { id: "git-deploy", from: "git_repository", to: "deploy_controller", kind: "delivery", scene: "operations" },
  { id: "registry-runtime", from: "oci_registry", to: "runtime_cluster", kind: "delivery", scene: "operations" },
  { id: "deploy-runtime", from: "deploy_controller", to: "runtime_cluster", kind: "delivery", scene: "operations", label: "sync" },
  { id: "runtime-otel", from: "runtime_cluster", to: "otel_collector", kind: "telemetry", scene: "operations", label: "OTLP" },
  { id: "otel-alert", from: "otel_collector", to: "alert_manager", kind: "control", scene: "operations" },
  { id: "alert-email", from: "alert_manager", to: "email_gateway", kind: "control", scene: "operations" },
  { id: "postgres-backup", from: "postgres", to: "backup_vault", kind: "data", scene: "operations", trunk: "recovery", label: "snapshot" },
  { id: "object-backup", from: "object_store", to: "backup_vault", kind: "data", scene: "operations", trunk: "recovery" },
];

export const trafficScenarios: TrafficScenario[] = [
  { id: "asset-delivery", scene: "ingress", weight: 2, steps: [{ edgeIds: ["web-cdn"] }, { edgeIds: ["cdn-object"] }, { edgeIds: [], reverseEdgeIds: ["cdn-object", "web-cdn"] }] },
  { id: "profile-read", scene: "application", weight: 3, steps: [{ edgeIds: ["web-waf"] }, { edgeIds: ["waf-gateway"] }, { edgeIds: ["gateway-auth"] }, { edgeIds: [], reverseEdgeIds: ["gateway-auth"] }, { edgeIds: ["gateway-profile"] }, { edgeIds: ["profile-cache"] }, { edgeIds: [], reverseEdgeIds: ["profile-cache", "gateway-profile"] }] },
  { id: "async-media", scene: "application", weight: 2, steps: [{ edgeIds: ["gateway-media"] }, { edgeIds: ["media-object"] }, { edgeIds: ["media-events"] }, { edgeIds: ["events-media-worker"] }, { edgeIds: ["worker-object"] }] },
  { id: "build-deploy-observe", scene: "operations", weight: 3, steps: [{ edgeIds: ["git-ci", "git-deploy"] }, { edgeIds: ["ci-registry"] }, { edgeIds: ["registry-runtime", "deploy-runtime"] }, { edgeIds: ["runtime-otel"] }, { edgeIds: ["otel-alert"] }, { edgeIds: ["alert-email"] }] },
  { id: "backup", scene: "operations", weight: 1.25, steps: [{ edgeIds: ["postgres-backup", "object-backup"] }] },
];

export const systemDefinition: SystemDefinition = {
  clusters: systemClusters,
  standalones: systemStandalones,
  nodes: systemNodes,
  edges: systemEdges,
  scenarios: trafficScenarios,
};

function assertUnique(ids: string[], label: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}

export function validateSystemDefinition(definition: SystemDefinition): void {
  assertUnique(definition.clusters.map((cluster) => cluster.id), "cluster");
  assertUnique(definition.clusters.map((cluster) => cluster.scene), "cluster scene");
  assertUnique(definition.standalones.map((entry) => entry.nodeId), "standalone node");
  assertUnique(definition.nodes.map((entry) => entry.id), "node");
  assertUnique(definition.edges.map((entry) => entry.id), "edge");
  assertUnique(definition.scenarios.map((scenario) => scenario.id), "scenario");

  const scenes = new Set(definition.clusters.map((cluster) => cluster.scene));
  const nodeIds = new Set(definition.nodes.map((entry) => entry.id));
  const edgeIds = new Set(definition.edges.map((entry) => entry.id));
  const edgeById = new Map(definition.edges.map((entry) => [entry.id, entry]));
  const assignedNodes = new Set<string>();
  const occupiedSlots = new Set<string>();

  // Each card is a fixed-width column, so the horizontal budget is set by the
  // node's column span (or a standalone's rail width), not a flat number. More
  // lines just grow the card vertically. Derive a per-node char budget so the
  // guard self-adjusts instead of hardcoding one width for every card.
  const budgetForSpan = (span: number): number => Math.round(span * 7 + 2);
  const spanForWidth = (width: number): number => width / 17;
  const maxChars = new Map<string, number>();
  for (const cluster of definition.clusters) {
    for (const placement of cluster.placements) {
      maxChars.set(placement.nodeId, budgetForSpan(placement.span));
    }
  }
  for (const standalone of definition.standalones) {
    maxChars.set(standalone.nodeId, budgetForSpan(spanForWidth(standalone.width)));
  }

  for (const entry of definition.nodes) {
    const lines = entry.code.split("\n");
    if (lines.length > 6) {
      throw new Error(`Node ${entry.id} has ${lines.length} code lines (max 6)`);
    }
    const budget = maxChars.get(entry.id) ?? 22;
    const overflow = lines.find((line) => line.length > budget);
    if (overflow !== undefined) {
      throw new Error(
        `Node ${entry.id} code line exceeds ${budget} chars: "${overflow}"`,
      );
    }
  }

  for (const cluster of definition.clusters) {
    if (
      cluster.width <= 0 ||
      cluster.width > 100 ||
      cluster.offset < 0 ||
      cluster.rowGap < 0
    ) {
      throw new Error(`Cluster ${cluster.id} has invalid layout metadata`);
    }
    for (const placement of cluster.placements) {
      if (!nodeIds.has(placement.nodeId)) {
        throw new Error(`Cluster ${cluster.id} references missing node ${placement.nodeId}`);
      }
      if (placement.row < 1 || placement.column < 1 || placement.span < 1 || placement.column + placement.span > 7) {
        throw new Error(`Cluster ${cluster.id} has an invalid placement for ${placement.nodeId}`);
      }
      if (assignedNodes.has(placement.nodeId)) {
        throw new Error(`Node ${placement.nodeId} has more than one placement`);
      }
      for (let column = placement.column; column < placement.column + placement.span; column += 1) {
        const slot = `${cluster.id}:${placement.row}:${column}`;
        if (occupiedSlots.has(slot)) {
          throw new Error(`More than one node occupies ${slot}`);
        }
        occupiedSlots.add(slot);
      }
      assignedNodes.add(placement.nodeId);
    }
  }

  for (const standalone of definition.standalones) {
    if (!nodeIds.has(standalone.nodeId) || !scenes.has(standalone.scene)) {
      throw new Error(`Standalone ${standalone.nodeId} has an invalid reference`);
    }
    if (standalone.width <= 0 || standalone.width > 100 || standalone.offset < 0) {
      throw new Error(`Standalone ${standalone.nodeId} has invalid layout metadata`);
    }
    if (assignedNodes.has(standalone.nodeId)) {
      throw new Error(`Node ${standalone.nodeId} has more than one placement`);
    }
    assignedNodes.add(standalone.nodeId);
  }

  for (const nodeId of nodeIds) {
    if (!assignedNodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} does not have a layout placement`);
    }
  }

  for (const entry of definition.edges) {
    if (!nodeIds.has(entry.from) || !nodeIds.has(entry.to)) {
      throw new Error(`Edge ${entry.id} references a missing node`);
    }
    if (entry.from === entry.to) {
      throw new Error(`Edge ${entry.id} cannot connect a node to itself`);
    }
    if (!scenes.has(entry.scene)) {
      throw new Error(`Edge ${entry.id} references missing scene ${entry.scene}`);
    }
  }

  for (const scenario of definition.scenarios) {
    if (!scenes.has(scenario.scene) || scenario.weight <= 0 || !scenario.steps.length) {
      throw new Error(`Scenario ${scenario.id} has invalid metadata`);
    }
    for (const step of scenario.steps) {
      for (const edgeId of step.edgeIds) {
        if (!edgeIds.has(edgeId)) {
          throw new Error(`Scenario ${scenario.id} references missing edge ${edgeId}`);
        }
      }
      for (const edgeId of step.reverseEdgeIds ?? []) {
        const entry = edgeById.get(edgeId);
        if (!entry) {
          throw new Error(`Scenario ${scenario.id} references missing edge ${edgeId}`);
        }
        if (!entry.bidirectional) {
          throw new Error(`Scenario ${scenario.id} reverses one-way edge ${edgeId}`);
        }
      }
    }
  }
}

validateSystemDefinition(systemDefinition);
