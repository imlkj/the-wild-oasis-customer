"use server";

import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";

export async function updateGuest(formData) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be logged in");
  }
  // Ensure we have a guest id and it's a valid number before sending to Postgres
  const guestIdRaw = session.user && session.user.guestId;
  if (guestIdRaw === undefined || guestIdRaw === null) {
    console.error("updateGuest: missing guestId on session.user", { session });
    throw new Error("No guest id associated with the current session");
  }

  const guestId = Number(guestIdRaw);
  if (!Number.isFinite(guestId) || isNaN(guestId)) {
    console.error("updateGuest: invalid guestId", { guestIdRaw });
    throw new Error("Invalid guest id");
  }

  const nationalID = formData.get("nationalID");
  const nationalityRaw = formData.get("nationality") || "";
  const [nationality, countryFlag] = nationalityRaw.split("%");

  if (!nationalID || !/^[A-Za-z0-9]{6,12}$/.test(nationalID)) {
    throw new Error("Invalid national ID");
  }

  // Use null for optional fields if not provided so Supabase/Postgres gets proper types
  const updateData = {
    nationality: nationality || null,
    countryFlag: countryFlag || null,
    nationalID,
  };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", guestId);

  if (error) {
    console.error("Supabase update error", { error, updateData, guestId });
    throw new Error("Guest could not be updated");
  }
}

export async function signInAction() {
  await signIn("google", {
    redirectTo: "/account",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
