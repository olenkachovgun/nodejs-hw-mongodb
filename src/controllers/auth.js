import {
  loginUser,
  registerUser,
  logoutUser,
  refreshUser,
} from '../services/auth.js';
import { ONE_DAY } from '../constants/index.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    // expires: session.refreshTokenValidUnitl,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    // expires: session.refreshTokenValidUnitl,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const registerController = async (req, res) => {
  const newUser = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Succesfully register user',
    data: newUser,
  });
};

//виконує процес обробки запиту на вхід користувача
// і взаємодію з клієнтом через HTTP:
export const loginController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const refreshController = async (req, res) => {
  const session = await refreshUser(req.cookies);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Session successfullt refresh',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};
