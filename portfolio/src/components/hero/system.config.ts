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
  Lightning,
  Stack,
  type Icon,
} from "@phosphor-icons/react";

import type { Lang } from "./codeHighlight";

export type CardKind = "core" | "rust" | "external";
export type Side = "top" | "bottom" | "left" | "right";

export interface CardData {
  id: string;
  kind: CardKind;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: Icon;
  tags?: string[];
  lang: Lang;
  code: string;
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
    y: 4,
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
    y: 2,
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
    y: 5,
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
    y: 37,
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
    y: 36,
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
    y: 37,
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
    y: 70,
    code: `CREATE TABLE profile (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  graduated_on DATE
);`,
  },
  {
    id: "redis",
    kind: "rust",
    title: "Redis Cache",
    subtitle: "Profile read-through",
    icon: Lightning,
    tags: ["RUST", "REDIS"],
    lang: "rust",
    x: 50,
    y: 71,
    code: `let mut conn = client
  .get_async_connection().await?;
conn.set_ex(
  "profile:cache", payload, 300)
  .await?;`,
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
    y: 70,
    code: `producer.send(
  FutureRecord::to(
    "profile.updated")
  .payload(&event)
)
.await?;`,
  },
];

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
  { from: "profile", fromSide: "bottom", to: "redis", toSide: "top" },
  { from: "postgres", fromSide: "right", to: "redis", toSide: "left" },
  { from: "redis", fromSide: "right", to: "events", toSide: "left" },
];
