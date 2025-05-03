import createHttpError from 'http-errors';
import {
  getAllContact,
  getContactById,
  addContact,
  updateContact,
  deleteContactById,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactFilterParams } from '../utils/filters/parseContactFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const getContactsController = async (req, res) => {
  const paginationParams = parsePaginationParams(req.query);
  const sortParams = parseSortParams(req.query);
  const filters = parseContactFilterParams(req.query);

  filters.userId = req.user._id;

  const data = await getAllContact({
    ...paginationParams,
    ...sortParams,
    filters,
  });

  res.status(200).json({
    status: 200,
    data,
    message: 'All contacts received successfully !',
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactById(contactId, userId);

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
  const userId = req.user._id;
  const photo = req.file;
  let photoUrl;

  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const data = await addContact({ ...req.body, photo: photoUrl }, userId);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const patchContactsController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const photo = req.file;
  let photoUrl;

  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const data = await updateContact(contactId, userId, {
    ...req.body,
    photo: photoUrl,
  });

  if (!data) {
    next(createHttpError(404, `Contact ${contactId} not found`));
    return;
  }
  res.status(200).json({
    status: 200,
    message: `Sucessfully update contact with id = ${contactId} !`,
    data,
  });
};

export const deleteContactsController = async (req, res) => {
  const userId = req.user._id;
  const { contactId } = req.params;
  const contact = await deleteContactById(contactId, userId);
  if (!contact) {
    throw createHttpError(404, `Contact ${contactId} not found`);
  }
  res.status(204).send();
};
