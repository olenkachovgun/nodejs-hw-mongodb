import { Router } from 'express';
import {
  getContactByIdController,
  getContactsController,
  addContactsController,
  patchContactsController,
  deleteContactsController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/', ctrlWrapper(getContactsController));
router.get('/:contactId', ctrlWrapper(getContactByIdController));
router.post('/', ctrlWrapper(addContactsController));
router.patch('/:contactId', ctrlWrapper(patchContactsController));
router.delete('/:contactId', ctrlWrapper(deleteContactsController));
export default router;
