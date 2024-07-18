import express from "express";
import mongoose from "mongoose";
import { User } from "./models/user.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());


//Route to create a new user, modify to check if existing first
app.post('/user/new', async (req, res) => {
    try {
        if (!req.body.username) {
            return res.status(400).send({ message: 'Missing required field username' })
        }
        const newUser = {
            username: req.body.username,
            role: 2
        }
        const user = await User.create(newUser)
        res.status(200).send({ message: `Successfully created user ${req.body.username}` });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message })
    }
})
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});

        return res.status(200).json({
            count: users.length,
            users: users
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message })
    }
})

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('App is connected to the database');
    app.listen((process.env.PORT || 4000), () => {
        console.log(`App is listening to port`);
    })
}).catch((error) => {
    console.log(error)
});