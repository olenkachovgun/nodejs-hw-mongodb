import { contactTypeList } from '../../constants/contacts.js';

export const parseContactFilterParams = ({ isFavourite, contactType }) => {
  const parsedContactType = contactTypeList.includes(contactType)
    ? contactType
    : undefined;

  const parsedIsFavourite = isFavourite === 'true' ? true : false;

  return {
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
};
