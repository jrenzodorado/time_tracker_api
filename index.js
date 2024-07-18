import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import usersRoute from './routes/usersRoute.js'

dotenv.config();

const app = express();
app.use(express.json());


app.use('/users', usersRoute)


mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('App is connected to the database');
    app.listen((process.env.PORT || 4000), () => {
        console.log(`App is listening to port`);
    })
}).catch((error) => {
    console.log(error)
});