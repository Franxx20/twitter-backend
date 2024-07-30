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
    jest.restoreAllMocks()
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
        profilePicture: 'profilePicture.png',
        visibility: Visibility.PUBLIC,
        passwordIsUpdated: true,
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = { profilePicture: 'newProfilePicture.png' };
      const result = await userService.updateUser('1', userData);
      expect(result?.profilePicture).toEqual('newProfilePicture.png');
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
        visibility: Visibility.PUBLIC,
        passwordIsUpdated: true,
      };

      userRepositoryMock.getById.mockResolvedValue(userMockData);
      userRepositoryMock.updateUser.mockResolvedValue(updatedUserMockData);

      const userData: UserUpdateInputDTO = { visibility:Visibility.PRIVATE};
      const result = await userService.updateUser('1', userData);
      expect(result?.visibility).toEqual(Visibility.PRIVATE);
    });
  });
  describe('getUserContainsUsername', () => {});
});
