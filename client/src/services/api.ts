export async function fetchHighlyRated<T>(): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/highly-rated`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch highly rated games");
  }

  return res.json();
}

export async function fetchGame<T>(gameSlug: string): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/${gameSlug}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch game info");
  }
  return res.json();
}

export async function fetchGames<T>(page?: number): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/games?page=${page}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch game list");
  }

  return res.json();
}

export async function fetchAllUpcoming<T>(
  page?: number,
  sort?: string,
  order?: string
): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/upcoming/all?page=${page}&sort1=${sort}&order1=${order}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch game list");
  }

  return res.json();
}

export async function fetchAllNewlyReleased<T>(
  page?: number,
  sort?: string,
  order?: string
): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/newly-released/all?page=${page}&sort1=${sort}&order1=${order}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch game list");
  }

  return res.json();
}

export async function fetchUpcomingGames<T>(): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}games/upcoming`);

  if (!res.ok) {
    throw new Error("Failed to fetch game list");
  }

  return res.json();
}

export async function fetchNewlyReleasedGames<T>(): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/newly-released`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch game list");
  }

  return res.json();
}
export async function fetchCriticallyAcclaimedGames<T>(): Promise<T> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}games/critically-acclaimed`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch game list");
  }

  return res.json();
}
