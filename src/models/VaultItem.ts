import mongoose from 'mongoose';

const VaultItemSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  username: { 
    type: String, 
    required: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  }, // encrypted
  url: { 
    type: String, 
    trim: true 
  },
  notes: { 
    type: String, 
    trim: true 
  },
}, { 
  timestamps: true 
});

// Index for better query performance
VaultItemSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema);