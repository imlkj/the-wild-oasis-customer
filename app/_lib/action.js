"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

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

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", guestId);

  if (error) {
    console.error("Supabase update error", { error, updateData, guestId });
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) {
    throw new Error("you must be logged in");
  }

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => {
    return booking.id;
  });

  if (!guestBookingsIds.includes(bookingId)) {
    throw new Error("You are not alowed to delete this booking");
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const session = await auth();
  if (!session) {
    throw new Error("you must be logged in");
  }
  const bookingId = Number(formData.get("bookingId"));

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => {
    return booking.id;
  });

  if (!guestBookingsIds.includes(bookingId)) {
    throw new Error("You are not alowed to update this booking");
  }

  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  //Revalidation should happen before redirecing
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", {
    redirectTo: "/account",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
