import Joi from 'joi';
import { contactTypeList } from '../constants/contacts.js';

export const addContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Name should be a string',
    'any.required': 'Name is required',
  }),

  phoneNumber: Joi.string().required().messages({
    'string.base': 'PhoneNumber should be a string',
    'any.required': 'PhoneNumber is required',
  }),
  email: Joi.string().email().messages({
    'string.base': 'Email should be a string',
    'string.email': 'Email must be in the correct format (example@domain.com)',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .required()
    .valid(...contactTypeList)
    .messages({
      'string.base': 'ContactType should be a string',
      'any.required': 'ContactType is required',
    }),
});

export const patchContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Name should be a string',
  }),
  phoneNumber: Joi.string().messages({
    'string.base': 'PhoneNumber should be a string',
  }),
  email: Joi.string().email().messages({
    'string.base': 'Email should be a string',
    'string.email': 'Email must be in the correct format (example@domain.com)',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(...contactTypeList),
});
