// The hero architecture diagram: resume rendered as a Rust service graph.
// Single source of truth for cards and connectors. Positions are percentages
// (x = center, y = top) inside the diagram canvas. Card sizes are measured at
// runtime, so connectors follow the real boxes.

import {
  Globe,
  TreeStructure,
  ShieldCheck,
  ArrowsLeftRight,
  GearSix,
  Database,
  Stack,
  Sparkle,
  PaintBrush,
  Cards,
  Keyboard,
  type Icon,
} from "@phosphor-icons/react";

import type { Lang } from "./codeHighlight";

export type CardKind = "core" | "rust" | "external" | "project";
export type Side = "top" | "bottom" | "left" | "right";

export interface CardData {
  id: string;
  kind: CardKind;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: Icon;
  tags?: string[];
  // Code snippet body (service cards). Project cards omit this and show images.
  lang?: Lang;
  code?: string;
  // Carousel images (project cards). Absolute /public paths. Empty = "coming soon".
  images?: string[];
  x: number; // center, 0-100
  y: number; // top, 0-100
}

export interface Edge {
  from: string;
  fromSide: Side;
  to: string;
  toSide: Side;
}

export const cards: CardData[] = [
  {
    id: "client",
    kind: "external",
    title: "Client",
    subtitle: "Browser / SPA",
    icon: Globe,
    tags: ["TYPESCRIPT", "REACT"],
    lang: "ts",
    x: 15,
    y: 1.4,
    code: `// client.ts
async function loadProfile() {
  const res = await fetch(
    "/api/v1/profile",
    { headers: { auth } }
  );
  return res.json();
}`,
  },
  {
    id: "load_balancer",
    kind: "external",
    title: "Load Balancer",
    subtitle: "Edge routing",
    icon: TreeStructure,
    tags: ["EDGE"],
    lang: "nginx",
    x: 50,
    y: 0.7,
    code: `upstream api_pool {
    server 10.0.4.11:8080;
    server 10.0.4.12:8080;
    least_conn;
}`,
  },
  {
    id: "auth",
    kind: "external",
    title: "Auth Provider",
    subtitle: "Identity / OAuth",
    icon: ShieldCheck,
    tags: ["TYPESCRIPT", "JWT"],
    lang: "ts",
    x: 85,
    y: 1.73,
    code: `export async function verifyToken(
  jwt: string
): Promise<Claims> {
  const claims = await jwks.verify(jwt);
  if (claims.exp < now()) throw err;
  return claims;
}`,
  },
  {
    id: "api_gateway",
    kind: "rust",
    title: "API Gateway",
    subtitle: "axum::Router",
    icon: ArrowsLeftRight,
    tags: ["RUST", "AXUM"],
    lang: "rust",
    x: 15,
    y: 12.83,
    code: `async fn get_profile(
  State(db): State<Pool>,
) -> Result<Json<Profile>> {
  let row = db.query_one(SQL).await?;
  Ok(Json(row.into()))
}`,
  },
  {
    id: "profile",
    kind: "core",
    title: "profile.rs",
    badge: "CORE",
    lang: "rust",
    x: 50,
    y: 12.47,
    code: `struct Profile {
    name: "Caleb Standfield",
    school: "University of Utah",
    degree: "B.S. Computer Science",
    graduated: "Dec 2026",
}`,
  },
  {
    id: "worker",
    kind: "rust",
    title: "Worker Service",
    subtitle: "Async job runner",
    icon: GearSix,
    tags: ["RUST", "TOKIO"],
    lang: "rust",
    x: 85,
    y: 12.83,
    code: `#[tokio::main]
async fn main() -> Result<()> {
  let mut rx = queue.subscribe(
    "jobs").await?;
  while let Some(job) = rx.recv().await {
    process(job).await?;
  }
}`,
  },
  {
    id: "postgres",
    kind: "rust",
    title: "Postgres",
    subtitle: "Primary datastore",
    icon: Database,
    tags: ["POSTGRESQL", "SQL"],
    lang: "sql",
    x: 15,
    y: 24.27,
    code: `CREATE TABLE profile (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  graduated_on DATE
);`,
  },
  {
    id: "events",
    kind: "rust",
    title: "Event Queue",
    subtitle: "Change notifications",
    icon: Stack,
    tags: ["RUST", "KAFKA"],
    lang: "rust",
    x: 85,
    y: 24.27,
    code: `producer.send(
  FutureRecord::to(
    "profile.updated")
  .payload(&event)
)
.await?;`,
  },

  // --- projects (lower band; carousel cards fed by the trunk from profile) ---
  {
    id: "coming-soon",
    kind: "project",
    title: "coming_soon",
    subtitle: "More on the way",
    icon: Sparkle,
    tags: ["WIP"],
    x: 22,
    y: 39.8,
    images: [],
  },
  {
    id: "pixelify",
    kind: "project",
    title: "pixelify",
    subtitle: "Sprite editor",
    icon: PaintBrush,
    tags: ["RUST", "WASM"],
    x: 78,
    y: 53.2,
    images: [
      "/sprite/sprite_draw.png",
      "/sprite/sprite_cs.png",
      "/sprite/sprite_stoplight.png",
      "/sprite/sprite_save.png",
    ],
  },
  {
    id: "blackjack",
    kind: "project",
    title: "blackjack",
    subtitle: "Terminal card game",
    icon: Cards,
    tags: ["C++"],
    x: 22,
    y: 66.5,
    images: [
      "/blackjack/blackjack_main.png",
      "/blackjack/blackjack_bet.png",
      "/blackjack/blackjack_playing.png",
      "/blackjack/blackjack_blackjack.png",
      "/blackjack/blackjack_won.png",
      "/blackjack/blackjack_lost.png",
    ],
  },
  {
    id: "learn-vim",
    kind: "project",
    title: "learn_vim",
    subtitle: "In progress",
    icon: Keyboard,
    tags: ["WIP"],
    x: 78,
    y: 79.8,
    images: [],
  },
];

// Project cards, in trunk order (2 left, 2 right of the center trunk).
export const projectIds = ["coming-soon", "pixelify", "blackjack", "learn-vim"];

export const edges: Edge[] = [
  { from: "client", fromSide: "right", to: "load_balancer", toSide: "left" },
  { from: "load_balancer", fromSide: "right", to: "auth", toSide: "left" },
  { from: "client", fromSide: "bottom", to: "api_gateway", toSide: "top" },
  { from: "load_balancer", fromSide: "bottom", to: "profile", toSide: "top" },
  { from: "auth", fromSide: "bottom", to: "worker", toSide: "top" },
  { from: "api_gateway", fromSide: "right", to: "profile", toSide: "left" },
  { from: "profile", fromSide: "right", to: "worker", toSide: "left" },
  { from: "api_gateway", fromSide: "bottom", to: "postgres", toSide: "top" },
  { from: "worker", fromSide: "bottom", to: "events", toSide: "top" },
];
