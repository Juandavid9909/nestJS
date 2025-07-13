import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';

export interface UserData {
  email: string;
  password?: string;
  fullName: string;
  isActive?: boolean;
  roles?: string[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user: UserData = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        ...user,
        token: this.getJwt({ email: user.email }),
      };
    } catch (error) {
      this.handleDBErrors(error as { [key: string]: any });
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        email: true,
        password: true,
      },
    });

    if (!user)
      throw new UnauthorizedException('Credentials are no valid (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are no valid (password)');

    return {
      ...user,
      token: this.getJwt({ email: user.email }),
    };
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBErrors(error: { [key: string]: any }): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
