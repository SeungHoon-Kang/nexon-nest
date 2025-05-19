import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { Event, EventSchema } from '../event/schema/event.schema';

import { User, UserSchema } from '../user/schema/user.schema';
import { UserLogin, UserLoginSchema } from '../user/schema/user-login.schema';
import { Reward, RewardSchema } from './schema/reward.schema';
import { EventUser, EventUserSchema } from './schema/event-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: User.name, schema: UserSchema },
      { name: UserLogin.name, schema: UserLoginSchema },
      { name: EventUser.name, schema: EventUserSchema },
    ]),
  ],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
