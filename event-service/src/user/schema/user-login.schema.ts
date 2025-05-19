import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user_logins' })
export class UserLogin extends Document {
  @Prop()
  userId: string;

  @Prop()
  loginAt: Date;
}

export const UserLoginSchema = SchemaFactory.createForClass(UserLogin);
