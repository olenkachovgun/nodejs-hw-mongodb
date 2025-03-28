import ContactCollection from '../db/Models/contacts.js';

export const getContact = () => ContactCollection.find();

export const getContactById = (contactId) =>
  ContactCollection.findOne({ _id: contactId });
