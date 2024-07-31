import { UserService, UserServiceImpl } from '@domains/user/service';
import { UserRepositoryImpl } from '@domains/user/repository';
import { db } from '@utils';
import { httpServer } from '@server';
import { UserDTO, UserUpdateInputDTO, UserUpdateOutputDTO, UserViewDTO } from '@domains/user/dto';
import { Visibility } from '@prisma/client';

jest.mock('src/domains/user/repository/user.repository.impl');

describe('UserServiceImpl', () => {
  let userService: UserService;
  let userRepositoryMock: jest.Mocked<UserRepositoryImpl>;

  beforeEach(() => {
    userRepositoryMock = new UserRepositoryImpl(db) as jest.Mocked<UserRepositoryImpl>;
    userService = new UserServiceImpl(userRepositoryMock);
    jest.restoreAllMocks();
  });

  afterAll((done) => {
    httpServer.close();
    done();
  });

  describe('getUser', () => {
    it('should return a valid user', async () => {
      const userMockData: UserViewDTO = {
        id: '1',
        name: 'user',
        username: 'username',
        profilePicture: 'profilePicture.png',
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);

      const result = await userService.getUser('1');
      expect(result).toEqual(userMockData);
    });
  });
  describe('getUserRecomendations', () => {});
  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userMockData: UserDTO = {
        id: '1',
        name: 'user',
        profilePicture: 'profilePicture.png',
        visibility: Visibility.PUBLIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepositoryMock.delete.mockResolvedValue(userMockData);
      const result = await userService.deleteUser('1');

      expect(result).toEqual(userMockData);
    });

    it('should throw a RecordNotFound Exception due to incorrect userId', async () => {
      userRepositoryMock.delete.mockRejectedValue(Error());

      // should throw Prisma.ClientknownRequestError P201
      await expect(userService.deleteUser('2')).rejects.toThrow(Error());
      await expect(userService.deleteUser('2')).rejects.toBeInstanceOf(Error);
    });
  });
  describe('updateUser', () => {
    it('should update user name', async () => {
      const userMockData: UserViewDTO = {
        id: '1',
        name: '',
        username: 'username',
        profilePicture: 'profilePicture.png',
      };
      const updatedUserMockData: UserUpdateOutputDTO = {
        id: '1',
        name: 'newName',
        profilePicture: 'profilePicture.png',
        visibility: Visibility.PUBLIC,
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = { name: 'newName' };
      const result = await userService.updateUser('1', userData);
      expect(result?.name).toEqual('newName');
    });

    it('should update user password', async () => {
      const userMockData: UserViewDTO = {
        id: '1',
        name: '',
        username: 'username',
        profilePicture: 'profilePicture.png',
      };

      const updatedUserMockData: UserUpdateOutputDTO = {
        id: '1',
        name: 'newName',
        profilePicture: 'profilePicture.png',
        visibility: Visibility.PUBLIC,
        passwordIsUpdated: true,
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = { password: 'newPassword' };
      const result = await userService.updateUser('1', userData);
      expect(result?.passwordIsUpdated).toEqual(true);
    });

    it('should update user profilePicture', async () => {
      const userMockData: UserViewDTO = {
        id: '1',
        name: '',
        username: 'username',
        profilePicture: 'profilePicture.png',
      };

      const updatedUserMockData: UserUpdateOutputDTO = {
        id: '1',
        name: 'newName',
        profilePicture: 'NewProfilePicture.png',
        visibility: Visibility.PUBLIC,
        passwordIsUpdated: true,
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = { profilePicture: 'NewProfilePicture.png' };
      const result = await userService.updateUser('1', userData);
      expect(result?.profilePicture).toEqual('NewProfilePicture.png');
    });

    it('should update user visibility', async () => {
      const userMockData: UserViewDTO = {
        id: '1',
        name: '',
        username: 'username',
        profilePicture: 'profilePicture.png',
      };

      const updatedUserMockData: UserUpdateOutputDTO = {
        id: '1',
        name: '',
        profilePicture: 'profilePicture.png',
        visibility: Visibility.PRIVATE,
        passwordIsUpdated: true,
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = { visibility: Visibility.PRIVATE };
      const result = await userService.updateUser('1', userData);
      expect(result?.visibility).toEqual(Visibility.PRIVATE);
    });

    it('should update user profilePicture, password, visibility, name', async () => {
      const userMockData: UserViewDTO = {
        id: '1',
        name: '',
        username: 'username',
        profilePicture: 'profilePicture.png',
      };

      const updatedUserMockData: UserUpdateOutputDTO = {
        id: '1',
        name: 'newName',
        passwordIsUpdated: true,
        visibility: Visibility.PRIVATE,
        profilePicture: 'NewProfilePicture.png',
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = {
        name: 'newName',
        password: 'NewPassword',
        visibility: Visibility.PRIVATE,
        profilePicture: 'NewProfilePicture.png',
      };
      const result = await userService.updateUser('1', userData);
      expect(result).toEqual(updatedUserMockData);
    });

    it('should not update any kind of data', async () => {
      const userMockData: UserViewDTO = {
        id: '1',
        name: '',
        username: 'username',
        profilePicture: 'profilePicture.png',
      };

      const updatedUserMockData: UserUpdateOutputDTO = {
        id: '1',
        name: '',
        passwordIsUpdated: false,
        visibility: Visibility.PUBLIC,
        profilePicture: 'profilePicture.png',
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = {};
      const result = await userService.updateUser('1', userData);
      expect(result).toEqual(updatedUserMockData);
    });
  });
  describe('getUserContainsUsername', () => {});
});
