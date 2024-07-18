import mongoose from 'mongoose';

const userSchema =  mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    required: true,
    enum: [1, 2]
  }
});

export const User = mongoose.model('User', userSchema);

