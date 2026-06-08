import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-text-tertiary text-sm max-w-md">
        Próximamente: perfil, cuentas conectadas, parámetros del relay y
        preferencias de notificación.
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
