import express from 'express';
import { User } from '../models/user.js';
const router = express.Router();

//Route to create a new user, modify to check if existing first
router.post('/new', async (req, res) => {
    try {
        const { username } = req.body
        if (!username) {
            return res.status(404).json({ message: 'Missing required field username' })
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const newUser = {
            username: username,
            role: 2
        }
        const user = await User.create(newUser)
        res.status(200).json({ message: `Successfully created user ${username}` });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message })
    }
})
// retrieve users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});

        return res.status(200).json({
            count: users.length,
            users: users
        }); 
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message })
    }
})
// retrieve user
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // { id: user._id }
        return res.status(200).json({user});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
})
// update sample
router.put('/:id', async(req,res)=>{
    try{
        const {id} = req.params;
        
        const result = await User.findByIdAndUpdate(id, req.body);
        if(!result){
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(200).send({message:'User updated successfully'})
    }catch(error){
        console.log(error.message)
        return res.status(500).send({message: error.message})
    }
})
// delete sample
router.delete('/:id', async (req,res)=>{
    try{
        const {id} = req.params;
        const result = await User.findByIdAndDelete(id);
        if(!result){
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(200).send({message:'User deleted successfully'})
    }catch(error){
        console.log(error.message)
        return res.status(500).send({message: error.message})
    }
})

export default router;