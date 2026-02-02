import dotenv from "dotenv";
import app from "./app.js";
import { testConnection } from "./config/database.js";

// Charger les variables d'environnement
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`The server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur démarrage serveur", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Erreur non gérée:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Exception non capturée:", err);
  process.exit(1);
});

// Démarrer le serveur
startServer();
