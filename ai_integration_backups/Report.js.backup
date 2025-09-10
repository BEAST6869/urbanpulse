const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['infrastructure', 'environment', 'safety', 'transportation', 'public_services', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format. Expected [longitude, latitude]'
      }
    }
  },
  address: {
    type: String,
    required: true,
    maxlength: 500
  },
  images: [{
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reporter: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null values
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  resolvedAt: {
    type: Date
  },
  notes: [{
    content: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create geospatial index on location
reportSchema.index({ location: '2dsphere' });

// Create compound indexes for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ priority: 1, status: 1 });

// Virtual for getting coordinates as [lat, lng] format
reportSchema.virtual('coordinates').get(function() {
  return [this.location.coordinates[1], this.location.coordinates[0]]; // [lat, lng]
});

// Static method to find reports within a radius
reportSchema.statics.findNearby = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

// Instance method to update status
reportSchema.methods.updateStatus = function(newStatus, assignedTo = null) {
  this.status = newStatus;
  if (assignedTo) {
    this.assignedTo = assignedTo;
  }
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    category: {
      type: String,
      enum: ["pothole", "garbage", "streetlight", "other"],
      default: "other",
    },
    confidence: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Reported", "Assigned", "Resolved"],
      default: "Reported",
    },
  },
  { timestamps: true }
);

// Add geospatial index for location queries
reportSchema.index({ location: "2dsphere" });

const Report = mongoose.model("Report", reportSchema);

export default Report;

