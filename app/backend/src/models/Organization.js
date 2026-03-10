import mongoose from "mongoose";

const orgMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "admin", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const orgInviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [orgMemberSchema],
    invites: [orgInviteSchema],
    retentionDays: {
      type: Number,
      default: null, // null = forever
    },
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
