# Meet Deck — Gestion de compétitions de natation

Application pour Academy Sportive des Jeunes Talents : inscriptions, séries, résultats et classements, avec plusieurs compétitions gérées séparément.

## 1. Créer le projet Firebase

1. Allez sur https://console.firebase.google.com et cliquez sur **Ajouter un projet**.
2. Donnez-lui un nom (ex. `meet-deck-natation`), continuez jusqu'à la création.
3. Dans le menu de gauche : **Build > Firestore Database > Créer une base de données**.
   - Choisissez le mode **production**.
   - Choisissez une région proche (ex. `eur3` pour l'Europe).
4. Toujours dans **Firestore > Règles**, collez le contenu du fichier `firestore.rules` fourni ici, puis **Publier**.
   (Ces règles sont ouvertes pour démarrer vite — voir la section "Sécuriser" plus bas avant un vrai lancement public.)
5. Dans **Paramètres du projet** (icône ⚙️ en haut à gauche) > **Vos applications** > cliquez sur l'icône **Web `</>`**.
6. Donnez un surnom à l'app, ne cochez pas Hosting, cliquez sur **Enregistrer l'application**.
7. Firebase affiche un bloc `firebaseConfig` avec des valeurs comme `apiKey`, `authDomain`, etc. Gardez cette page ouverte, vous en aurez besoin à l'étape 3.

## 2. Récupérer le projet en local

Téléchargez le dossier fourni, puis dans un terminal :

```bash
cd meet-manager-app
npm install
```

## 3. Configurer les variables d'environnement

Copiez `.env.example` en `.env` :

```bash
cp .env.example .env
```

Ouvrez `.env` et remplissez chaque valeur avec celles du bloc `firebaseConfig` de Firebase (étape 1.7) :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 4. Tester en local

```bash
npm run dev
```

Ouvrez l'adresse affichée (ex. `http://localhost:5173`). Créez une compétition pour vérifier que tout s'enregistre bien dans Firestore (visible dans la Console Firebase > Firestore Database > Données).

## 5. Déployer le site (Vercel, gratuit)

1. Créez un compte sur https://vercel.com (connexion possible avec GitHub).
2. Mettez ce dossier dans un dépôt GitHub (ou glissez-déposez le dossier directement sur Vercel si vous n'utilisez pas GitHub).
3. Sur Vercel : **Add New > Project**, importez le dépôt.
4. Dans les réglages du projet Vercel, section **Environment Variables**, ajoutez les 6 mêmes variables que dans votre `.env`.
5. Cliquez sur **Deploy**. Vercel vous donne une adresse du type `meet-deck-natation.vercel.app`.
6. (Optionnel) Dans **Settings > Domains**, vous pouvez ensuite relier un nom de domaine que vous auriez acheté.

## Sécurité : compte administrateur

Le site est maintenant sécurisé : **tout le monde peut consulter** (inscriptions, séries, résultats, classements), mais **seul un compte administrateur connecté peut modifier** les données (créer une compétition, inscrire un nageur, générer des séries, saisir des temps).

### Activer l'authentification Firebase

1. Dans la Console Firebase de votre projet : **Build > Authentication > Get started**.
2. Onglet **Sign-in method** > activez **E-mail/Mot de passe**.
3. Onglet **Users** > **Add user** > entrez l'e-mail et le mot de passe qui serviront de compte administrateur (ex. votre e-mail du club). Notez-les précieusement, c'est ce que vous utiliserez pour vous connecter sur le site via le bouton **Connexion admin**.
4. Vous pouvez créer plusieurs comptes de cette façon si plusieurs personnes doivent administrer (entraîneurs, bureau).

### Règles Firestore

Le fichier `firestore.rules` fourni applique déjà cette logique (lecture publique, écriture réservée aux comptes connectés). Copiez-le dans **Firestore Database > Règles** puis **Publier**, comme indiqué à l'étape 1.

## Structure du projet

```
meet-manager-app/
├── src/
│   ├── App.jsx        → toute l'interface (onglets, formulaires, tableaux)
│   ├── data.js         → fonctions de lecture/écriture Firestore
│   ├── firebase.js      → connexion à votre projet Firebase
│   └── main.jsx        → point d'entrée React
├── index.html
├── package.json
├── firestore.rules      → règles de sécurité à coller dans Firebase
└── .env.example         → modèle des variables à remplir
```
