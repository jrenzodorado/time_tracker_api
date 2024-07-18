import mongoose from 'mongoose';

const userSchema =  mongoose.Schema({
  username: {
    // username is unique but is being handled by server side validation,
    // check existingUser in usersRouter post
    type: String,
    required: true
  },
  role: {
    // role: 1-admin, 2-user
    type: Number,
    required: true,
    enum: [1, 2]
  }
});

export const User = mongoose.model('User', userSchema);

