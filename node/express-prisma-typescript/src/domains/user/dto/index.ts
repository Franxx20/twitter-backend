import { IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import { Visibility } from '@prisma/client';
import { Transform } from 'class-transformer';


export class UserDTO {
  constructor(user: UserDTO) {
    this.id = user.id;
    this.name = user.name;
    this.visibility = user.visibility;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  id: string;
  name: string | null;
  visibility: Visibility | null;
  createdAt: Date;
  updatedAt: Date;
}

export class VisibilityInputDTO {
  @IsEnum(Visibility)
  @IsNotEmpty()
  @Transform(({ value }) => Visibility[value as keyof typeof Visibility])
  visibility: Visibility = 'PUBLIC';
}

export class UpdateInputDTO {
  constructor(name?: string, password?: string, visibility?: Visibility) {
    this.name = name;
    this.password = password;
    this.visibility = visibility;
  }

  @IsOptional()
  @IsEnum(Visibility)
  @Transform(({ value }) => Visibility[value as keyof typeof Visibility])
  readonly visibility?: Visibility = 'PUBLIC';

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  readonly password?: string;
}

export class ExtendedUserDTO extends UserDTO {
  constructor(user: ExtendedUserDTO) {
    super(user);
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
  }

  email!: string;
  username!: string;
  password!: string;
}

export class UserViewDTO {
  constructor(user: UserViewDTO) {
    this.id = user.id;
    this.name = user.name;
    this.username = user.username;
    this.profilePicture = user.profilePicture;
  }

  id: string;
  name: string;
  username: string;
  profilePicture: string | null;
}
