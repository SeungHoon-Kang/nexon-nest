// user.schema.ts (event-service/src/user/schema/user.schema.ts)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users' }) // auth-service users 컬렉션과 동일
export class User extends Document {
  @Prop()
  loginId: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  birth: string;

  @Prop()
  email: string;

  @Prop()
  roles: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
