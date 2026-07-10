import mongoose, { Schema, Document } from 'mongoose';

/**
 * 🧑‍💻 TypeScript Interface for User Model
 * Defines the type structures for documents returned by query operations.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  refreshTokens: string[]; // 🔄 Holds valid rotation tokens for multi-device login sessions
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isVerified: boolean;
  verificationToken?: string;
  createdAt: Date;
}

/**
 * 📝 Mongoose Schema Definition
 * Sets rigorous validation rules and indexes at the database level.
 */
const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required 🧑'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required 📧'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true // ⚡ Index for lightning-fast logins and organization lookup
    },
    passwordHash: {
      type: String,
      required: true
    },
    refreshTokens: {
      type: [String],
      default: []
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String
    }
  },
  {
    timestamps: true, // ⏱️ Generates createdAt and updatedAt automatisch
    versionKey: false // 🚫 Removes the default '__v' field
  }
);

// ⚡ Explicit compound/single indexes can be set here if required in the future
// UserSchema.index({ email: 1 });

/**
 * 🚀 Export compiler Mongoose Model
 */
export default mongoose.model<IUser>('User', UserSchema);