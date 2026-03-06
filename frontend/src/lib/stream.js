import { StreamVideoClient } from "@stream-io/video-react-sdk";

let client = null;

export const initializeStreamClient = async (user, token) => {
  const apiKey = import.meta.env.VITE_STREAM_API_KEY;

  if (!apiKey) throw new Error("Stream API key is missing");

  client = new StreamVideoClient({ apiKey, user, token });

  return client;
};

export const disconnectStreamClient = async () => {
  if (client) {
    await client.disconnectUser();
    client = null;
  }
};
