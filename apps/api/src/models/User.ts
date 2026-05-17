import mongoose, { Schema, Document } from 'mongoose';

// 1. The TypeScript Interface (Strict Types the code)
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string; // <-- NEW
  createdAt: Date;
}

// 2. The Mongoose Schema (Strict Rules for the database)
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // <-- NEW
  createdAt: { type: Date, default: Date.now }
});

// 3. Export the Model
export default mongoose.model<IUser>('User', UserSchema);