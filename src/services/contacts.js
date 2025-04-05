import ContactCollection from '../db/Models/contacts.js';

export const getAllContact = () => ContactCollection.find();

export const getContactById = (contactId) =>
  ContactCollection.findOne({ _id: contactId });

export const addContact = (payload) => ContactCollection.create(payload);

export const updateContact = async (_id, payload) => {
  const data = await ContactCollection.findOneAndUpdate({ _id }, payload, {
    new: true,
  });
  return data;
};

export const deleteContactById = async (contactId) =>
  await ContactCollection.findOneAndDelete({ _id: contactId });
