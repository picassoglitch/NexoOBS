/**
 * Spanish translations — Phase 0 default locale. English added later by
 * creating an en.ts mirror and wiring it through src/i18n/index.ts.
 */
export const es = {
  common: {
    back: "Atrás",
    signOut: "Cerrar sesión",
    save: "Guardar",
    cancel: "Cancelar",
    next: "Siguiente",
    settings: "Ajustes",
  },
  topBar: {
    title: "NEXO·AI WORLD",
    subtitle: "OS DE TRANSMISIÓN MÓVIL",
  },
  login: {
    title: "INICIAR SESIÓN",
    subtitle:
      "Inicia sesión con tu cuenta de Nexo-AI World. Es la misma cuenta que usas en nexo-ai.world y en NexoClip.",
    email: "CORREO",
    password: "CONTRASEÑA",
    cta: "INICIAR SESIÓN",
    noAccount: "¿No tienes cuenta? Créala en nexo-ai.world",
    footer:
      "NexoOBS es un engine de Nexo-AI World. Tus credenciales y perfil viven en Nexo — aquí solo se reflejan.",
    error: "Error al iniciar sesión",
  },
  lobby: {
    title: "¿QUIÉN ERES HOY?",
    subtitleNamed: "Hola {name}. Elige el rol que jugarás en esta sesión.",
    subtitle: "Elige el rol que jugarás en esta sesión.",
    tierLine: "Plan {tier} · engine seleccionado: {engine}",
    tierLineNoEngine: "Plan {tier}",
    streamer: {
      title: "STREAMER",
      sub: "Vista remota · chat · control de permisos",
      bulletA: "Disponible en iPhone + Android",
      bulletB: "Aprueba las respuestas del operador en el chat",
      bulletC: "Cambia destinos + overlays en vivo",
    },
    operator: {
      title: "OPERADOR DE CÁMARA",
      sub: "Vista UVC · chat en vivo · salud del stream",
      bulletUsbAndroid: "Solo Android — iOS no permite cámaras USB",
      bulletUsbConnect: "Conecta el Osmo Pocket 3 vía USB-C UVC",
      bulletStreams: "Transmite a las plataformas que autorizaste",
      bulletChatPerm: "Responde al chat solo cuando el streamer lo permita",
      iosWarning:
        "El modo Operador requiere Android — Apple no permite USB UVC.",
    },
  },
  streamer: {
    title: "MODO STREAMER",
    signedInAs: "Sesión iniciada como {name}.",
    phase0Hint:
      "Inicio de Fase 0 — el commit 4 añade el panel en vivo, el chat y los controles de permisos.",
    upNext: "PRÓXIMO EN FASE 0",
    bulletDashboard: "Panel del streamer (commit 4)",
    bulletChat: "Chat real de Kick (commit 5)",
    bulletPerms: "Toggles de permisos (commit 6)",
    switchRole: "CAMBIAR ROL",
  },
  operator: {
    title: "MODO OPERADOR",
    signedInAs: "Sesión iniciada como {name}.",
    phase0Hint:
      "Inicio de Fase 0 — vista UVC, overlay de chat y barra de salud en commit 4. La captura real del Osmo solo funciona en el dev build (Fase 2).",
    upNext: "PRÓXIMO EN FASE 0",
    bulletLive: "Vista en vivo del operador (commit 4)",
    bulletChat: "Chat real de Kick (commit 5)",
    bulletPerms: "Gates de permisos (commit 6)",
  },
} as const;
