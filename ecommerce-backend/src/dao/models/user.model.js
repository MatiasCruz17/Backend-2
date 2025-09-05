import mongoose from 'mongoose';

const userCollection = 'users';

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'carts', default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
    timestamps: true
});

export default mongoose.model(userCollection, userSchema);
