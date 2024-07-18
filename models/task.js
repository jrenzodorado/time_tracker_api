import mongoose from 'mongoose';

const taskSchema = mongoose.Schema({
    // task or check-in data
    task: {
        type: String,
        required: true
    },
    // reference to User schema, a foreign key
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
export const Task = mongoose.model('Task', taskSchema);

