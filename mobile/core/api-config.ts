const url = process.env.EXPO_PUBLIC_API_URL;

if (!url) {
  throw new Error(
    "EXPO_PUBLIC_API_URL n'est pas défini. Copier mobile/.env.example en mobile/.env " +
      "et y renseigner l'adresse du backend, puis relancer `npx expo start --clear`.",
  );
}

export const API_BASE_URL = url;