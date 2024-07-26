import { NextFunction, Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors';

import { BodyValidation, db } from '@utils';
import { UserRepositoryImpl } from '@domains/user/repository';

import { AuthService, AuthServiceImpl } from '../service';
import { LoginInputDTO, SignupInputDTO } from '../dto';

export const authRouter = Router();

// Use dependency injection
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db));

authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;

  try {
    const token = await service.signup(data);

    return res.status(HttpStatus.CREATED).json(token);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;

  try {
    const token = await service.login(data);

    return res.status(HttpStatus.OK).json(token);
  } catch (e) {
    next(e);
  }
});
