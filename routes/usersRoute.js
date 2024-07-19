import express from 'express';
import { User } from '../models/user.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
dotenv.config();
const usersRouter = express.Router();

/**
 * route handler to create a new user, also checks if user is existing
 * @param  {Object} req contains user data username, role, password
 * @return {JSON} res output of request, token
 */
usersRouter.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username) {
            return res.status(400).json({ message: 'Missing required field username' })
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const newUser = {
            username: username,
            role: 2,
            password: password
        }
        const user = await User.create(newUser)

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        // , username: user.username, role: user.role
        const token = jwt.sign(
            { userId: user._id },
            process.env.jwtSecret,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({ message: `Successfully created user ${username}`, token: token, userId: user._id });
            }
        );

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
});

/**
 * route handler to login  user
 * @param  {Object} req contains user data username, role, password
 * @return {JSON} res output of request, token
 */
usersRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        // Generate JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({ message: 'Logged in', token: token, userId: user._id });
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

/**
 * route handler to retrieve all users
 * @return {JSON} res array of users
 */
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find({});

        return res.status(200).json({
            count: users.length,
            users: users
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
});

/**
 * route handler to retrieve user 
 * @param  {String} username unique identifier of user
 * @return {JSON} res object containing user information
 */
usersRouter.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
});

/**
 * route handler to update user
 * @param  {String} id unique identifier of user
 * @return {JSON} status output of request
 */
usersRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await User.findByIdAndUpdate(id, req.body);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).send({ message: 'User updated successfully' })
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({ message: error.message })
    }
});

/**
 * route handler to delete user
 * @param  {String} id unique identifier of user
 * @return {JSON} status output of request
 */
usersRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await User.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).send({ message: 'User deleted successfully' })
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({ message: error.message })
    }
});

export default usersRouter;