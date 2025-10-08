import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

export async function GET(request, { params }) {
  const { cabinId } = await params;

  try {
    const [cabins, bookedDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);

    return Response.json({ cabins, bookedDates });
  } catch {
    return Response.json({ message: "Cabins not found!" });
  }
}
