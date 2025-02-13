const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./users");
const Message = require("./messages");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

mongoose
  .connect(`mongodb+srv://diabyhamala0:AZERhd%40001diab@cluster0.tgnse.mongodb.net/talkifydb?retryWrites=true&w=majority&appName=Cluster0`)
  .then(console.log("connection à la base de donées réussie..."));

const app = express();



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Utilisateur connecté :", socket.id);

  socket.on("message", (message) => {
      io.emit("message", message); // 🔥 Envoie à tous les utilisateurs
  });

  socket.on("update-message", (updatedMessage) => {
      io.emit("update-message", updatedMessage);
  });

  socket.on("reply-message", (reply) => {
      io.emit("reply-message", reply);
  });

  socket.on("delete-message",(deletedMessage)=>{
    io.emit("delete-message", deletedMessage)
  })

  socket.on("disconnect", () => {
      console.log("Utilisateur déconnecté");
  });
});

const authentificate = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(400).json("Veuillez vous connecter!!!");
    } else {
      try {
        const decoded = jwt.verify(token, "token");
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
          res.status(400).json("Vous n'etes pas autorisé!");
        } else {
          req.user = user;
          next();
        }
      } catch (error) {
        res.status(400).json("Vous n'etes pas autorisé!2");
      }
    }
  } else {
    res.status(400).json("Veuillez vous connecter!!!");
  }
};
const authentificateAdmin = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res.status(400).json("Veuillez vous connecter!!!");
  } else {
    try {
      const decoded = jwt.verify(token, "token");
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        res.status(400).json("Votre session a expiré");
      } else {
        if (user.role === "admin") {
          req.user = user;
          next();
        } else {
          res.status(400).json("Vous n'etes pas autorisé!!!");
        }
      }
    } catch (error) {
      res.status(400).json("Vous n'etes pas autorisé!");
    }
  }
};

app.get("/", (req, res) => {
  res.status(200).json("Bonjour et bienvenu à vous!!!");
});

app.get("/users", authentificate, async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

app.get("/user", authentificate, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  res.status(200).json(user);
});

app.post("/register", async (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    res.status(500).json("Cet utilisateur existe déjà");
  } else {
    try {
      bcrypt.hash(mot_de_passe, 8).then((value) => {
        const user = User.create({ nom, prenom, email, mot_de_passe: value });
        res.status(200).json("Utilisateur créer avec succès!");
      });
    } catch (error) {
      res.status(500).json("Erreur d'enregistrement: ", error);
    }
  }
});

app.post("/login", async (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    try {
      const mdp = user.mot_de_passe;
      bcrypt.compare(mot_de_passe, mdp).then((stat) => {
        if (stat) {
          const authToken = jwt.sign(
            {
              email: user.email,
              nom: user.nom,
              role: user.role,
            },
            "token",
            { expiresIn: "1h" }
          );
          user.authTokens.push({ authToken });
          user.save();
          res.status(200).json({
            user: user,
            token: authToken,
            message: "Bienvenue " + user.prenom,
          });
        } else {
          res.status(400).json({ message: "Mot de passe incorrect!!!" });
        }
      });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Mot de passe ou identifiant incorrect!!!" }, error);
    }
  } else {
    res.status(404).json({ message: "Utilisateur introuvable!!!" });
  }
});

app.post("/deleteuser", authentificate, async (req, res) => {
  const user = req.user;
  try {
    const findUser = await User.findOne({ _id: user._id });
    if (findUser) {
      await User.deleteOne({ _id: user._id });
      res.status(200).json("Utilisateur supprimé avec succès");
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(400).json("Une erreur est survenue...");
  }
});

app.post("/updateuser", authentificate, async (req, res) => {
  const user = req.user;
  const { nom, prenom, email, mot_de_passe } = req.body;
  console.log(mot_de_passe);
  try {
    const findUser = await User.findOne({ _id: user._id });
    if (findUser) {
      bcrypt.hash(mot_de_passe, 8).then((value) => {
        user.nom = nom;
        user.prenom = prenom;
        user.email = email;
        user.mot_de_passe = value;
        user.save();
      });
      res.status(200).json("Utilisateur modifié avec succès");
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(400).json("Une erreur est survenue...");
  }
});

app.get("/messages", authentificate, async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json(error + "khkkk");
  }
});

app.post("/sendmessage", authentificate, async (req, res) => {
  const message = req.body.message;
  const user_id = req.user._id;
  const name = `${req.user.nom} ${req.user.prenom}`;
  const posted_at = req.body.time;
  try {
    const liste = await Message.find();
    console.log(liste);
    if (liste.length > 0) {
      const lastMessage = await Message.find().sort({ _id: -1 }).limit(1);
      const msg = await Message.create({
        user_id: user_id,
        user_name: name,
        message: message,
        posted_at: posted_at,
        last_message_post: lastMessage[0].posted_at,
      });
      console.log("first");
    } else {
      const msg = await Message.create({
        user_id: user_id,
        user_name: name,
        message: message,
        posted_at: posted_at,
      });
    }
    res.status(200).json("Message envoyer!!!");
  } catch (error) {
    res.status(400).json("Une erreur est survenue...");
  }
});

app.post("/updatemessage", authentificate, async (req, res) => {
  const message_id = req.body.message_id;
  const message = req.body.message;
  const reaction = req.body.reaction;
  const user = req.user;
  try {
    const msg = await Message.findOne({ _id: message_id });
    if (msg) {
      try {
        if (!reaction) {
          const result = await Message.updateOne(
            { _id: message_id },
            { $set: { message: message } }
          );
          res.status(200).json("Message modifié avec succès!");
        } else {
          const react = msg.reactions.filter(
            (r) => r.user_id === user._id.toString()
          );
          if (react.length > 0) {
            const index = msg.reactions.findIndex(
              (r) => r.user_id === user._id.toString()
            );
            if (req.body.del === true) {
              msg.reactions.splice(index, 1);
              msg.save();
              res.status(200).json("Réaction supprimé avec succès!");
            } else {
              msg.reactions.splice(index, 1);
              msg.reactions.push({
                reaction: reaction,
                user_id: user._id,
                msg_id: message_id,
                name: user.nom,
              });
              msg.save();
              res.status(200).json("Réaction modifié avec succès!");
            }
          } else {
            if(!req.body.del){
              msg.reactions.push({
                reaction: reaction,
                user_id: user._id,
                msg_id: message_id,
                name: user.nom,
              });
              msg.save();
              res.status(200).json("Message modifié avec succès!");
            }else{
              res.status(200).json("");
            } 
          }  
        }
      } catch (error) {
        console.log(error);
        res.status(400).json("Une erreur est survenue..");
      }
    } else {
      res.status(400).json("Une erreur est survenue..");
    }
  } catch (error) {
    res.status(400).json("Une erreur est survenue...");
  }
});

app.post("/deletemessage", authentificate, async (req, res) => {
  const { message_id, message } = req.body;
  const user_id = req.user._id;
  const name = `${req.user.nom} ${req.user.prenom}`;
  try {
    const msg = await Message.findOne({ _id: message_id });
    if (msg) {
      await Message.deleteOne({ _id: message_id });
      res.status(200).json("Message supprimé avec succès!");
    } else {
      res.status(400).json("Une erreur est survenue...");
    }
  } catch (error) {
    res.status(400).json("Une erreur est survenue...");
  }
});

app.post("/reply/:id", authentificate, async (req, res) => {
  const id = req.params.id;
  const { message, time } = req.body;
  const user_id = req.user._id;
  const name = `${req.user.nom} ${req.user.prenom}`;
  const findMessage = await Message.findOne({ _id: id });
  if (findMessage) {
    try {
      const lastMessage = await Message.find().sort({ _id: -1 }).limit(1);
      await Message.create({
        user_id: user_id,
        user_name: name,
        message: message,
        posted_at: time,
        reply: true,
        reply_user_name: findMessage.user_name,
        reply_message: findMessage.message,
        reply_id: id,
        last_message_post: lastMessage[0].posted_at,
      });
      res.status(200).json("Message envoyé avec succès!!!");
    } catch (error) {
      res.status(500).json("Une erreur est survenue!!!");
    }
  }
});

server.listen(4000, () => {
  console.log("Serveur en écoute sur le port 4000...");
});
