import express from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/task.js';


const tasksRouter = express.Router();
const regexPattern = /^(\d+(?:\.\d+)?)\s*(?:hr|hrs)\s*#(\w+)\s*(.*)$/;

/**
 * route handler to create new task with current user
 * @param  {Object} req contains check in task and user data
 * @return {JSON} res output of request
 */
tasksRouter.post('/new', async (req, res) => {
    try {
        const { task, createdBy } = req.body
        if (!task) {
            return res.status(400).json({ message: 'Missing required field task' })
        }
        if (!regexPattern.test(task)) {
            return res.status(400).json({ message: 'Task does not match required format' });
        }
        const newTask = {
            task: task,
            createdBy: createdBy
        }
        const taskItem = await Task.create(newTask)
        return res.status(200).json({ message: 'Task entry successfully created' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
});


/**
 * retrieve tasks based on user by date range e.g. Dec 1 - Dec 15
 * @param  {String} userId foreign key owned by the creator of entry
 * @param  {Date} date1 initial search date
 * @param  {Date} date2 end search date
 * @return {Array<Tasks>} Filtered Tasks by date range
 */
const getTasksByDateRange = async (userId, date1, date2) => {
    try {
        const endDate = new Date(date2);
        endDate.setHours(23, 59, 59, 999);
        const tasks = await Task.aggregate([
            {
                $match: {
                    createdBy: new mongoose.Types.ObjectId(userId),
                    createdAt: {
                        $gte: new Date(date1), // Date should be in ISO format or a valid Date object
                        $lte: new Date(endDate)
                    }
                }
            }
        ]);
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

/**
 * retrieve tasks based on user by tag e.g. #<tag>
 * @param  {String} userId foreign key owned by the creator of entry
 * @param  {String} searchTag search string excluding hashtag
 * @return {Array<Tasks>} Filtered Tasks by Tag
 */
const getTasksByTag = async (userId, searchTag) => {
    searchTag = '#' + searchTag
    try {
        const tasks = await Task.aggregate([
            {
                $match: {
                    createdBy: new mongoose.Types.ObjectId(userId),
                    task: { $regex: new RegExp(searchTag, 'i') }
                }
            }
        ]);
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

/**
 * retrieve tasks based on user by date range and tag 
 * @param  {String} userId foreign key owned by the creator of entry
 * @param  {Date} date1 initial search date
 * @param  {Date} date2 end search date
 * @param  {String} searchTag search string excluding hashtag
 * @return {Array<Tasks>} Filtered Tasks by date range and tag
 */
const getTasksByTagAndDate = async (userId, date1, date2, searchTag) => {
    searchTag = '#' + searchTag
    try {
        const endDate = new Date(date2);
        endDate.setHours(23, 59, 59, 999);
        const tasks = await Task.aggregate([
            {
                $match: {
                    createdBy: new mongoose.Types.ObjectId(userId),
                    task: { $regex: new RegExp(searchTag, 'i') },
                    createdAt: {
                        $gte: new Date(date1), // Date should be in ISO format or a valid Date object
                        $lte: new Date(endDate)
                    }
                }
            }
        ]);
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

/**
 * route handler that handles filtering of tasks
 * @param  {Object} req contains query data
 * @return {JSON} filtered tasks
 */
tasksRouter.get('/', async (req, res) => {
    const { userId, date1, date2, searchTag } = req.query

    try {
        let tasks;
        if (userId && date1 && date2 && searchTag) {
            tasks = await getTasksByTagAndDate(userId, date1, date2, searchTag)
        } else if (userId && date1 && date2) {
            tasks = await getTasksByDateRange(userId, date1, date2);
        } else if (userId && searchTag) {
            tasks = await getTasksByTag(userId, searchTag);
        } else {
            return res.status(400).json({ error: 'Invalid query parameters' });
        }
        return res.status(200).json(tasks)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

/**
 * route handler to delete task
 * @param  {String} id task id
 * @return {JSON} status output of request
 */
tasksRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Task.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.status(200).send({ message: 'Task deleted successfully' })
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({ message: error.message })
    }
});

export default tasksRouter;