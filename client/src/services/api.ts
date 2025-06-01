export async function fetchHighlyRated<T>(): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/highly-rated`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch highly rated games");
  }

  return res.json();
}
