const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  mot_de_passe: { type: String, required: true },
  role: {
    type: String,
    default: "user",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  authTokens: [
    {
      authToken: {
        type: String,
      },
    },
  ],
});



const User = mongoose.model("User", UserSchema)
module.exports = User;
