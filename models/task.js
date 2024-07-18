import mongoose from 'mongoose';

const taskSchema = mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    // Reference to User schema
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
export const Task = mongoose.model('Task', taskSchema);

