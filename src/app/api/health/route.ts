export const dynamic = "force-dynamic";

// Liveness probe for container orchestration (see Dockerfile HEALTHCHECK).
export function GET() {
  return new Response(JSON.stringify({ status: "ok" }), { headers: { "content-type": "application/json" } });
}
