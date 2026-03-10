import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorBackupCodes: {
      type: [String],
      default: [],
    },
    dataGovernance: {
      storeFullPayload: {
        type: Boolean,
        default: true,
      },
      analyticsConsent: {
        type: Boolean,
        default: true,
      },
    },
    currentWebAuthnChallenge: {
      type: String,
      default: null,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;
