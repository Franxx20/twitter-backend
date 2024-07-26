import { UserRepository } from '@domains/user/repository';
import {
  checkPassword,
  ConflictException,
  encryptPassword,
  generateAccessToken,
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from '@utils';

import { LoginInputDTO, SignupInputDTO, TokenDTO } from '../dto';
import { AuthService } from './auth.service';
import { validate } from 'class-validator';

export class AuthServiceImpl implements AuthService {
  constructor(private readonly repository: UserRepository) {}

  async signup(data: SignupInputDTO): Promise<TokenDTO> {
    const existingUser = await this.repository.getByEmailOrUsername(data.email, data.username);
    if (existingUser) throw new ConflictException('USER_ALREADY_EXISTS');

    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }

    data.password = await encryptPassword(data.password);
    const user = await this.repository.create(data);
    const token = generateAccessToken({ userId: user.id });

    return { token };
  }

  async login(data: LoginInputDTO): Promise<TokenDTO> {
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }

    const user = await this.repository.getByEmailOrUsername(data.email, data.username);
    if (!user) throw new NotFoundException('user');

    const isCorrectPassword = await checkPassword(data.password, user.password);

    if (!isCorrectPassword) throw new UnauthorizedException('INCORRECT_PASSWORD');

    const token = generateAccessToken({ userId: user.id });

    return { token };
  }
}
