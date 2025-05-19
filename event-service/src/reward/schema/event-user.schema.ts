import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventUserDocument = EventUser & Document;

@Schema({ timestamps: true })
export class EventUser {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ default: new Date() })
  rewardedAt: Date;
}

export const EventUserSchema = SchemaFactory.createForClass(EventUser);
