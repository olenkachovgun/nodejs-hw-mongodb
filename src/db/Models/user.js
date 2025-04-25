import { Schema, model } from 'mongoose';
import { handleSaveError, setUpdateSetting } from './hooks.js';
import { emailRegexp } from '../../constants/auth.js';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: emailRegexp,
      required: true,
      unique: true, //унікальність на рівні колекції
    },
    password: {
      type: String,
      required: true,
    },
    // verify: {
    //   type: Boolean,
    //   default: false,
    //   required:true
    // },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
userSchema.post('save', handleSaveError); //спрацьовує після невдалого збереження. працює лише на додавання
userSchema.pre('findOneAndUpdate', setUpdateSetting); //спрацьовую перед оновленням
userSchema.post('findOneAndUpdate', handleSaveError);

const UserCollection = model('users', userSchema);
export default UserCollection;
