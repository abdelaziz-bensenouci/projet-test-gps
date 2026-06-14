export async function lireJson<T>(url: string): Promise<T> {
  const reponse = await fetch(url);

  if (!reponse.ok) {
    throw new Error(`Requete echouee: ${reponse.status}`);
  }

  return reponse.json() as Promise<T>;
}
