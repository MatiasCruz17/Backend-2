import UserModel from '../dao/models/user.model.js';
import { createHash } from '../utils/crypto.js';

class UserRepository {
    async getAll() {
        return UserModel.find().select('-password').lean();
    }

    async getById(id) {
        return UserModel.findById(id).select('-password').lean();
    }

    async getByEmail(email) {
        return UserModel.findOne({ email }).lean();
    }

    async create(data) {
        data.password = createHash(data.password);
        return UserModel.create(data);
    }

    async update(id, data) {
        if (data.password) data.password = createHash(data.password);
        return UserModel.findByIdAndUpdate(id, data, { new: true })
            .select('-password')
            .lean();
    }

    async delete(id) {
        return UserModel.findByIdAndDelete(id);
    }
}

export default new UserRepository();
