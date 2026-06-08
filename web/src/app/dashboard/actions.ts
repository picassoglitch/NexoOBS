"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/server-session";
import { PlatformId } from "@/lib/destinations";
import {
  addDestination,
  regenerateStreamKey,
  removeDestination,
  toggleDestination,
  updateAllTitles,
  updateDestination,
  updateSession,
} from "@/lib/data";

/** Every action re-reads the tenant from the verified session cookie —
 *  the client can never spoof a tenant_id. */
async function requireTenant(): Promise<string> {
  const session = await getServerSession();
  if (!session) throw new Error("unauthorized");
  return session.tenant_id;
}

export async function setTitleAction(title: string): Promise<void> {
  const tenant = await requireTenant();
  await updateSession(tenant, { title: title.trim() || "Mi transmisión en vivo" });
  revalidatePath("/dashboard");
}

export async function toggleRecordAction(value: boolean): Promise<void> {
  const tenant = await requireTenant();
  await updateSession(tenant, { recordEnabled: value });
  revalidatePath("/dashboard");
}

export async function toggleLiveAction(value: boolean): Promise<void> {
  const tenant = await requireTenant();
  await updateSession(tenant, { isLive: value });
  revalidatePath("/dashboard");
}

export async function setClipsEnabledAction(value: boolean): Promise<void> {
  // Turning the NexoClip connection ON is a full-access-only action —
  // enforce server-side, not just by hiding the switch.
  const session = await getServerSession();
  if (!session) throw new Error("unauthorized");
  if (value && (session.tier ?? "").toLowerCase() !== "all_access") {
    throw new Error("forbidden: full access required");
  }
  await updateSession(session.tenant_id, { clipsEnabled: value });
  revalidatePath("/dashboard");
}

export async function regenerateKeyAction(): Promise<string> {
  const tenant = await requireTenant();
  const key = await regenerateStreamKey(tenant);
  revalidatePath("/dashboard");
  return key;
}

export async function addDestinationAction(platformId: PlatformId): Promise<void> {
  const tenant = await requireTenant();
  await addDestination(tenant, platformId);
  revalidatePath("/dashboard");
}

export async function toggleDestinationAction(id: string): Promise<void> {
  const tenant = await requireTenant();
  await toggleDestination(tenant, id);
  revalidatePath("/dashboard");
}

export async function updateDestinationAction(
  id: string,
  patch: {
    channelHandle?: string;
    streamTitle?: string;
    ingestUrl?: string;
    streamKey?: string;
  },
): Promise<void> {
  const tenant = await requireTenant();
  await updateDestination(tenant, id, patch);
  revalidatePath("/dashboard");
}

export async function removeDestinationAction(id: string): Promise<void> {
  const tenant = await requireTenant();
  await removeDestination(tenant, id);
  revalidatePath("/dashboard");
}

export async function updateTitlesAction(title: string): Promise<void> {
  const tenant = await requireTenant();
  await updateAllTitles(tenant, title);
  revalidatePath("/dashboard");
}
