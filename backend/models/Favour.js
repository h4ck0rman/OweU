const mongoose = require('mongoose');
const { Schema } = mongoose;

const FavourSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now, // Defaults to the current date/time
    },
    endTime: {
      type: Date,
      validate: {
        validator: function (value) {
          // Ensure endTime is after startTime
          return !value || value > this.startTime;
        },
        message: 'endTime must be after startTime',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'], // Status of the favour
      default: 'pending',
    },
    title: {
      type: String,
      required: true,
      maxlength: 50, // Optional description with a limit
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Favour', FavourSchema);
