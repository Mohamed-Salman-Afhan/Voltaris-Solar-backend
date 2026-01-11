import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  firstName?: string;
  lastName?: string;
  role?: "admin" | "staff";
  email: string;
  clerkUserId: string;
  imageUrl?: string;
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "staff"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
  },
});

export const User = mongoose.model<IUser>("User", userSchema);