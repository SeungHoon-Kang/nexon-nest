import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  points: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
