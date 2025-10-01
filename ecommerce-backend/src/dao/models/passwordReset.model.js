import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
});

export default mongoose.model('passwordResets', passwordResetSchema);
