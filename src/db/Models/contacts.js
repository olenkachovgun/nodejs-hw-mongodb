import { Schema, model } from 'mongoose';
import { contactTypeList } from '../../constants/contacts.js';
import { handleSaveError, setUpdateSetting } from './hooks.js';
const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      required: true,
      enum: contactTypeList,
      default: contactTypeList[2],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
contactSchema.post('save', handleSaveError); //спрацьовує після невдалого збереження. працює лише на додавання
contactSchema.pre('findOneAndUpdate', setUpdateSetting); //спрацьовую перед оновленням
contactSchema.post('findOneAndUpdate', handleSaveError);

const ContactCollection = model('contacts', contactSchema);
export default ContactCollection;
