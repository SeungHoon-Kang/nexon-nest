import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { UserLogin, UserLoginDocument } from './schema/user-login.schema';
import { RefreshToken } from './schema/refresh-token.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
@Injectable()
export class AuthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name) private refreshToken: Model<RefreshToken>,
    @InjectModel(UserLogin.name)
    private userLoginModel: Model<UserLoginDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({
      $or: [
        { id: dto.loginId },
        { name: dto.name },
        { phone: dto.phone },
        { birth: dto.birth },
        { email: dto.email },
      ],
    });
    if (exists)
      throw new ConflictException(
        'User already exists with the given loginId, name, phone, birth, or email',
      );
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      ...dto,
      password: hashed,
      roles: dto.roles || ['user'],
    });
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();

    return userWithoutPassword;
  }

  async validateUser(loginId: string, password: string) {
    const user = await this.userModel.findOne({ loginId });

    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.loginId, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      loginId: user.loginId,
      sub: user._id,
      roles: user.roles,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(
      { id: user.loginId, sub: user._id },
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET_KEY },
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshToken.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, token: refreshToken, expiresAt },
      { upsert: true },
    );

    console.log('userLoginModel:', this.userLoginModel.modelName);

    try {
      await this.userLoginModel.create({
        userId: user._id,
        loginAt: new Date(),
        accessToken,
        refreshToken,
      });
      console.log('Mongoose connection state:', this.connection.readyState); // 1: 연결됨
      console.log('Connected to DB:', this.connection.db.databaseName);
      console.log('Login record saved.');
    } catch (err) {
      console.error('Login record save failed:', err);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { loginId: user.loginId, roles: user.roles },
    };
  }

  async findAll() {
    return this.userModel.find({}, { password: 0, __v: 0, _id: 0 });
  }

  async findById(userId: string) {
    return this.userModel.findById(userId, { password: 0, __v: 0 });
  }
}
