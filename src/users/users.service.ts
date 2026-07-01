import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { BaseService } from '../common/base.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  async register(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.model.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
    } as Partial<UserDocument>);
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).select('+passwordHash').exec();
  }

  async validateCredentials(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.findByEmailWithPassword(email);
    if (!user) {
      return null;
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    return matches ? user : null;
  }
}
