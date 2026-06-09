import { missingNexoEnvVars, readNexoEnv } from "@/lib/env";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

/**
 * Login is just a redirect-to-Nexo-AI bounce. We don't host credentials
 * here — Nexo-AI mints an SSO token and the browser lands back on
 * /auth/sso?token=... which sets our session cookie.
 *
 * When env vars are missing this page surfaces the exact var names so
 * operators see what to set in Railway without having to read logs.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const env = readNexoEnv();
  const missing = missingNexoEnvVars();
  const configured = env !== null;

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Entrar a NexoOBS</h1>
          <p className="text-text-tertiary text-sm">
            Autenticate desde Nexo-AI World.
          </p>
        </div>

        {!configured && (
          <div className="mb-5 p-3 rounded-lg bg-warn/10 border border-warn/40 text-xs text-text-secondary">
            <strong className="text-warn block mb-1">
              Servicio no configurado.
            </strong>
            Faltan variables en Railway. NexoOBS no puede iniciar sesión hasta
            que estén definidas:
            <ul className="mt-1 ml-4 list-disc font-mono text-[11px]">
              {missing.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        )}

        {configured && (
          <a
            href={buildNexoAiLoginUrl(env, next)}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-accent text-white hover:opacity-90 transition text-sm font-semibold"
          >
            Continuar con Nexo-AI World →
          </a>
        )}

        {error && (
          <div className="mt-4 text-xs text-bad bg-bad/10 border border-bad/30 rounded-md p-2 break-words">
            <strong>SSO error:</strong>{" "}
            <span className="font-mono">{decodeURIComponent(error)}</span>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-text-tertiary">
          NexoOBS es un agente de Nexo-AI World — tu sesión vive ahí.
        </p>
      </div>
    </div>
  );
}

function buildNexoAiLoginUrl(
  env: NonNullable<ReturnType<typeof readNexoEnv>>,
  next: string | undefined,
): string {
  const returnTo = new URL(next ?? "/dashboard", env.publicUrl).toString();
  const url = new URL(env.nexoAiLoginUrl);
  // Nexo-AI's login accepts a return_to that, after auth, becomes the
  // base used to build the SSO launch URL. Naming mirrors what Nexo-AI's
  // launch URL builder expects.
  url.searchParams.set("engine", "nexoobs");
  url.searchParams.set("return_to", returnTo);
  return url.toString();
}
