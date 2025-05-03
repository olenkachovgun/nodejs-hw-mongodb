import createHttpError from 'http-errors';
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import SessionCollection from '../db/Models/session.js';
import UserCollection from '../db/Models/user.js';
import handlebars from 'handlebars';
import { sendEmail } from '../utils/sendMail.js';
import { TEMPLATES_DIR } from '../constants/index.js';
import { SMTP } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';

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

//const verifyEmailPath = path.join(TEMPLATES_DIR, 'verify-email.html');

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });

  if (user) {
    throw createHttpError(409, 'Email already in use');
  }
  const hasPassword = await bcrypt.hash(password, 10);

  const newUser = await UserCollection.create({
    ...payload,
    password: hasPassword,
  });

  // Видаляємо поле password з об'єкта
  const userObject = newUser.toObject();
  delete userObject.password;

  // const templateSource = await fs.readFile(verifyEmailPath, 'utf-8');
  // const template = Handlebars.compile(templateSource);
  // const html = template({
  //   verifyLink: 'http://localhost:3000/auth/verify?token=',
  // });

  // const verifyEmail = {
  //   to: email,
  //   subject: 'Verify email',
  //   html,
  // };
  // await sendEmail(verifyEmail);

  return userObject;
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid!');
  }
  // if (!user.verify) {
  //   throw createHttpError(401, 'Email not verified!');
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

export const requestResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UserCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UserCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
