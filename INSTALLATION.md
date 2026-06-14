# Installation

## Variables d'environnement

Copier le fichier d'exemple vers un fichier local non versionne :

```bash
cp .env.example .env
```

Renseigner ensuite :

```bash
EXPO_PUBLIC_MAPTILER_KEY=votre_cle_maptiler
```

Les URLs OSRM et Nominatim ont des valeurs de secours, mais peuvent etre surchargees :

```bash
EXPO_PUBLIC_OSRM_URL=https://router.project-osrm.org
EXPO_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org
```

## Vercel

Dans Vercel, ajouter les memes variables dans :

`Project Settings > Environment Variables`

Apres toute modification d'une variable d'environnement, relancer le build Vercel.

Toutes les variables utilisees par l'application sont publiques et prefixees
`EXPO_PUBLIC_`, car le code tourne cote client.
