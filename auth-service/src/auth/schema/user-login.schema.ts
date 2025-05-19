import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserLoginDocument = UserLogin & Document;

@Schema({ collection: 'user_logins', timestamps: true })
export class UserLogin {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: Date.now })
  loginAt: Date;

  @Prop({ required: true })
  accessToken: string;

  @Prop()
  refreshToken?: string;
}

export const UserLoginSchema = SchemaFactory.createForClass(UserLogin);
