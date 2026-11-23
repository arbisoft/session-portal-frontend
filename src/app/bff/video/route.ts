// `/bff/video` and `/bff/video/` (empty slug) have no `[slug]` segment to match, so they would fall through to the
// generic BFF proxy and answer 403. An empty slug is just another invalid slug, so it gets the same 400 as the rest.
const invalidVideo = () =>
  new Response(JSON.stringify({ message: "Invalid video" }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });

export { invalidVideo as GET, invalidVideo as HEAD };

export const dynamic = "force-dynamic";
