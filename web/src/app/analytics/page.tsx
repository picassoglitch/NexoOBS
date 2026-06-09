import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  if (!(await getServerSession())) redirect("/login?next=/analytics");
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Analytics</h1>
      <p className="text-text-tertiary text-sm max-w-md">
        Horas de stream, viewers concurrentes, top clips por plataforma. Llega
        cuando el relay empiece a emitir telemetría.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 text-accent hover:underline text-sm"
      >
        ← Volver al dashboard
      </Link>
    </div>
  );
}
