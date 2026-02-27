import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { RegisterDto, LoginDto } from './auth.schema';

function signAccessToken(userId: string) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, env.JWT_SECRET, options);
}

function signRefreshToken(userId: string) {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, options);
}

function sanitizeUser(user: { id: string; name: string; email: string; avatar: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(data: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email đã được sử dụng', 409, 'EMAIL_TAKEN');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return { user: sanitizeUser(user), accessToken, refreshToken };
  },

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return { user: sanitizeUser(user), accessToken, refreshToken };
  },

  async refresh(token: string) {
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
    }

    const accessToken = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  },
};
