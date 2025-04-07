import createHttpError from 'http-errors';
import {
  getAllContact,
  getContactById,
  addContact,
  updateContact,
  deleteContactById,
} from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  const contacts = await getAllContact();
  res.status(200).json({
    status: 200,
    data: contacts,
    message: 'All contacts received successfully !',
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) {
    throw createHttpError(404, `Contact ${contactId} not found`);
  }
  res.status(200).json({
    status: 200,
    data: contact,
    message: `Successfully found contact with id ${contactId}!`,
  });
};

export const addContactsController = async (req, res) => {
  const data = await addContact(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const patchContactsController = async (req, res) => {
  const { contactId } = req.params;
  const result = await updateContact(contactId, req.body);
  if (!result) {
    throw createHttpError(404, `Contact ${contactId} not found`);
  }
  res.status(200).json({
    status: 200,
    message: `Sucessfully update contact with id = ${contactId} !`,
    data: result,
  });
};

export const deleteContactsController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContactById(contactId);
  if (!contact) {
    throw createHttpError(404, `Contact ${contactId} not found`);
  }
  res.status(204).send();
};
