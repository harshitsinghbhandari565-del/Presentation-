export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ 
    ok: true,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
}
