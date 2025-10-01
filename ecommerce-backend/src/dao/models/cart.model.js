import mongoose from 'mongoose';

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
        quantity: { type: Number, default: 1 }
    }]
}, {
    timestamps: true
});

export default mongoose.model(cartCollection, cartSchema);
