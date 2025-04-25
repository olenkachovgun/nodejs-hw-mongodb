import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import SessionCollection from '../db/Models/session.js';
import UserCollection from '../db/Models/user.js';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64'); //генеруємо рандомні байти та перетворюємо на str
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY * 30),
  };
};

export const findSession = (query) => SessionCollection.findOne(query);
export const findUser = (query) => UserCollection.findOne(query);

export const registerUser = async (payload) => {
  const { email, password } = payload;

  const user = await findUser({ email });

  if (user) {
    throw createHttpError(409, 'Email already in use');
  }
  const hasPassword = await bcrypt.hash(password, 10);
  
  return await UserCollection.create({
    ...payload,
    password: hasPassword
  });
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid!');
  }
  // if (!user.verify) {
  //   throw createHttpError(401, 'Email not verify!');
  // }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionCollection.findOneAndDelete({ userId: user._id });

  const session = createSession();
  return SessionCollection.create({
    userId: user._id,
    ...session,
  });
};

export const refreshUser = async ({ refreshToken, sessionId }) => {
  const session = await findSession({ refreshToken, _id: sessionId });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  if (session.refreshTokenValidUntil < Date.now()) {
    await SessionCollection.findOneAndDelete({ _id: sessionId });
    throw createHttpError(401, 'Session token expired');
  }
  await SessionCollection.findOneAndDelete({ _id: sessionId });
  const newSession = createSession();

  return SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = (sessionId) =>
  SessionCollection.deleteOne({ _id: sessionId });
