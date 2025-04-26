import ContactCollection from '../db/Models/contacts.js';
import { calcPaginationData } from '../utils/calcPaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContact = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = SORT_ORDER.ASC,
  filters = {},
}) => {
  const contactQuery = ContactCollection.find();

  if (filters.userId) {
    contactQuery.where('userId').equals(filters.userId);
  }
  if (filters.contactType) {
    contactQuery.where('contactType').equals(filters.contactType);
  }
  if (typeof filters.isFavourite === 'boolean') {
    contactQuery.where('isFavourite').equals(filters.isFavourite);
  }
  const totalItems = await ContactCollection.find()
    .merge(contactQuery)
    .countDocuments();
  const skip = (page - 1) * perPage;
  const data = await contactQuery
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const paginationData = calcPaginationData({ page, perPage, totalItems });

  return {
    data,
    page,
    perPage,
    totalItems,
    ...paginationData,
  };
};

export const getContactById = (contactId, userId) =>
  ContactCollection.findOne({ _id: contactId, userId });

export const addContact = (payload, userId) => {
  const contact = ContactCollection.create({ ...payload, userId });

  return contact;
};

export const updateContact = async (contactId, userId, payload) => {
  const data = await ContactCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
    },
  );
  return data;
};

export const deleteContactById = async (contactId, userId) =>
  await ContactCollection.findOneAndDelete({ _id: contactId, userId });
