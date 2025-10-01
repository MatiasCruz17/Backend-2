import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String },
    code: { type: String, unique: true },
    status: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
