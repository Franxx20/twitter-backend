import { UserRepositoryImpl } from '@domains/user/repository';
import { generatePreSignedUrls, NotFoundException, ValidationException } from '@utils';
import { socketIoServer } from '@server';
import { PostService, PostServiceImpl } from '@domains/post/service';
import { PostRepositoryImpl } from '@domains/post/repository';
import { ExtendedPostDTO, PostDTO, PreSignedUrl } from '@domains/post/dto';
import { validate } from 'class-validator';
import { mock } from 'jest-mock-extended';
import { _MockProxy } from 'jest-mock-extended/lib/Mock';
import { ExtendedUserDTO } from '@domains/user/dto';
import { Visibility } from '@prisma/client';

jest.mock('src/domains/post/repository/post.repository.impl');
jest.mock('class-validator');
jest.mock('src/utils/myaws');

// const mockGeneratePreSignedUrl = generatePreSignedUrl as jest.MockedFunction<typeof generatePreSignedUrl>;
const mockValidate = validate as jest.MockedFunction<typeof validate>;

describe('PostServiceImpl', () => {
  let postService: PostService;

  let postRepositoryMock: _MockProxy<PostRepositoryImpl>;
  let userValidationRepositoryMock: _MockProxy<UserRepositoryImpl>;

  beforeEach(() => {
    postRepositoryMock = mock<PostRepositoryImpl>();
    userValidationRepositoryMock = mock<UserRepositoryImpl>();
    postService = new PostServiceImpl(postRepositoryMock, userValidationRepositoryMock);
    jest.resetAllMocks(); // Reset mocks before each test
  });

  afterAll((done) => {
    socketIoServer.closeServerConnection();
    done();
  });

  describe('createPost', () => {
    it('should create a post with images', async () => {
      const preSignedUrls: PreSignedUrl[] = [
        { signedUrl: 'preSignedUrl 1', key: 'key 1' },
        { signedUrl: 'preSignedUrl 2', key: 'key 2' },
        { signedUrl: 'preSignedUrl 3', key: 'key 3' },
      ];

      (generatePreSignedUrls as jest.Mock).mockResolvedValue(preSignedUrls);

      const userIdMock = 'author 1';
      const contentMock = 'hola';
      const imagesMock = ['image 1', 'image 2', 'image 3'];

      const postMock: PostDTO = {
        id: 'post 1',
        authorId: userIdMock,
        content: contentMock,
        images: ['key 1', 'key 2', 'key 3'],
        createdAt: new Date(),
      };

      postRepositoryMock.create.mockResolvedValue(postMock);
      const results = await postService.createPost(userIdMock, contentMock, imagesMock);
      expect(results).toEqual(postMock);
      expect(generatePreSignedUrls).toHaveBeenCalled();
    });

    it('should create a post with no images', async () => {
      (validate as jest.Mock).mockResolvedValue([]);

      const userIdMock = 'author 1';
      const contentMock = 'hola';

      const postMock: PostDTO = {
        id: 'post 1',
        authorId: userIdMock,
        content: contentMock,
        images: [],
        createdAt: new Date(),
      };

      postRepositoryMock.create.mockResolvedValue(postMock);
      const results = await postService.createPost(userIdMock, contentMock, undefined);

      expect(results).toEqual(postMock);
      expect(generatePreSignedUrls).not.toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      (validate as jest.Mock).mockResolvedValue([]);
      const deletePostSpy = jest.spyOn(postService, 'deletePost');
      const userIdMock: string = 'user 1';
      const postIdMock: string = 'post 1';
      const contentMock: string = 'content post 1';
      const postMock: PostDTO = {
        id: postIdMock,
        authorId: userIdMock,
        content: contentMock,
        images: [],
        createdAt: new Date(),
      };
      postRepositoryMock.getById.mockResolvedValue(postMock);

      postRepositoryMock.delete.mockResolvedValue();

      await postService.deletePost(userIdMock, postIdMock);
      expect(deletePostSpy).toHaveBeenCalledWith(userIdMock, postIdMock);
    });

    it('should throw ValidationException', async () => {
      (validate as jest.Mock).mockResolvedValue([]);
      const userIdMock: string = '';
      const postIdMock: string = 'post 1';
      const validationErrors = [{ property: 'authorId', constraints: { isNotEmpty: 'authorId should not be empty' } }];

      (validate as jest.Mock).mockResolvedValue(validationErrors);
      const getByIdSpy = jest.spyOn(postRepositoryMock, 'getById');
      const deletePostSpy = jest.spyOn(postService, 'deletePost');

      await expect(postService.deletePost(userIdMock, postIdMock)).rejects.toThrow(ValidationException);
      expect(getByIdSpy).not.toHaveBeenCalled();
      expect(deletePostSpy).toHaveBeenCalledWith(userIdMock, postIdMock);
    });

    it('should throw NotFoundException', async () => {
      (validate as jest.Mock).mockResolvedValue([]);
      const userIdMock: string = '';
      const postIdMock: string = 'post 1';

      (validate as jest.Mock).mockResolvedValue([]);
      const getByIdSpy = jest.spyOn(postRepositoryMock, 'getById');
      const deletePostSpy = jest.spyOn(postService, 'deletePost');

      postRepositoryMock.getById.mockResolvedValue(null);

      await expect(postService.deletePost(userIdMock, postIdMock)).rejects.toThrow(NotFoundException);
      expect(getByIdSpy).toHaveBeenCalled();
      expect(deletePostSpy).toHaveBeenCalledWith(userIdMock, postIdMock);
    });
  });

  describe('getPost', () => {
    it('should return a post', async () => {
      const userIdMock: string = 'user 1';
      const postIdMock: string = 'post 1';
      const contentMock: string = 'content post 1';
      const postMock: PostDTO | null = {
        id: postIdMock,
        authorId: userIdMock,
        content: contentMock,
        images: [],
        createdAt: new Date(),
      };

      postRepositoryMock.getById.mockResolvedValue(postMock);
      userValidationRepositoryMock.isUserPublicOrFollowed.mockResolvedValue(true);

      mockValidate.mockResolvedValue([]);

      const results = await postService.getPost(userIdMock, postIdMock);
      expect(results).toEqual(postMock);
    });

    it('should throw ValidationException', async () => {
      const userIdMock: string = '';
      const postIdMock: string = 'post 1';
      const validationErrors = [{ property: 'authorId', constraints: { isNotEmpty: 'authorId should not be empty' } }];

      mockValidate.mockResolvedValue(validationErrors);
      await expect(postService.getPost(userIdMock, postIdMock)).rejects.toThrow(ValidationException);
    });

    it('should throw NotFoundException', async () => {
      const userIdMock: string = 'userId 1';
      const postIdMock: string = 'post 1';

      mockValidate.mockResolvedValue([]);
      postRepositoryMock.getById.mockResolvedValue(null);
      await expect(postService.getPost(userIdMock, postIdMock)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLatestPosts', () => {
    it('should ', () => {
      const authorData: ExtendedUserDTO = {
        id: 'user123',
        name: 'John Doe',
        username: 'johndoe',
        profilePicture: 'profile.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'example@email.com',
        password: 'exampleHashedPassword',
        visibility: Visibility.PUBLIC,
      };
      const extendedPost: ExtendedPostDTO = {
        id: 'post456',
        authorId: 'user123',
        content: 'This is a great post!',
        images: ['image1.jpg', 'image2.png'],
        createdAt: new Date(),
        author: authorData,
        qtyComments: 5,
        qtyLikes: 10,
        qtyRetweets: 2,
      };




    });
  });

  describe('getPostsByAuthor', () => {});
});
