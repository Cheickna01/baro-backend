const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const now = new Date()

const Schema = mongoose.Schema
const messageSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    reply: {
        type: Boolean,
        default: false,
    },
    reply_user_name: {
        type: String
    },
    reply_message: {
        type: String
    },
    reply_id: {
        type: String
    },
    posted_at: {
        type: Date,
        default: new Date()
    },
    last_message_post: {
        type: Date,
        default: new Date() 
    },
    reactions: [
        {
            reaction: {
                type: String
            },
            user_id: {
                type: String
            },
            msg_id: {
                type: String
            },
            name: {
                type: String
            }
        }
    ],
})

const Message = mongoose.model("message", messageSchema)
module.exports = Message