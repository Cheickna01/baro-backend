Baaro est une application web permettant aux utilisateurs inscrits de laisser des messages sur la plateforme. Ce backend est construit avec Node.js et Express.js, et utilise MongoDB comme base de données.

🚀 Fonctionnalités

Authentification des utilisateurs (JWT)

Gestion des utilisateurs (inscription, connexion, profil)

Gestion des messages (création, lecture, suppression)

Validation des données avec Joi

Sécurisation des routes avec JWT et bcrypt

🛠️ Technologies utilisées

Node.js (Environnement d'exécution)

Express.js (Framework backend)

MongoDB & Mongoose (Base de données et ODM)

JSON Web Token (JWT) (Authentification)

Bcrypt (Hashage des mots de passe)

Cors (Gestion des requêtes cross-origin)

📦 Installation

Cloner le dépôt

git clone https://github.com/Cheickna01/baro-backend.git
cd backend

Installer les dépendances

npm install

Configurer les variables d'environnement
Crée un fichier .env à la racine et ajoute :

PORT=4000
MONGO_URI=mongodb://localhost:27017/talkify
JWT_SECRET="secret"

Lancer le serveur

node index.js

📡 Endpoints API

Authentification

POST /api/auth/register – Inscription

POST /api/auth/login – Connexion

Utilisateurs

GET /api/user – Récupérer un utilisateur

PUT /api/users/:id – Mettre à jour un utilisateur

DELETE /api/deleteuser – Supprimer un utilisateur

Messages

POST /api/sendmessages – Publier un message

GET /api/messages – Récupérer tous les messages

DELETE /api/deletemessages/:id – Supprimer un message

🤝 Contribuer

Les contributions sont les bienvenues !

Fork le projet

Crée une branche feature (git checkout -b feature-ma-fonctionnalite)

Commit tes modifications (git commit -m 'Ajout de ma fonctionnalité')

Push vers GitHub (git push origin feature-ma-fonctionnalite)

Ouvre une Pull Request

Vous pouvez voir l'application ici: https://baaro.netlify.app/