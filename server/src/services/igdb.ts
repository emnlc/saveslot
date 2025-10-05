let accessToken: string;
let tokenExpiresAt: number = 0;

export const getIGDBToken = async (): Promise<string> => {
  const now = Date.now();

  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  const res = await fetch(`https://id.twitch.tv/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return accessToken;
};

export const fetchIGDB = async (endpoint: string, body: string) => {
  const token = await getIGDBToken();

  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body,
  });

  if (!res.ok) {
    const error = await res.text();

    const errorMessage = `Failed to fetch from IGDB (${res.status}): ${error}`;
    throw new Error(errorMessage);
  }

  return res.json();
};
