import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";

/**
 * Root — NexoOBS has no public surface. Authenticated users (signed in
 * through Nexo-AI) go to the dashboard; everyone else is sent to /login,
 * which only offers the "Continuar con Nexo-AI World" SSO flow.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession();
  if (session) redirect("/dashboard");
  redirect("/login");
}
