import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../event/schema/event.schema';
import { User } from '../user/schema/user.schema';
import { UserLogin } from '../user/schema/user-login.schema';
import { EventUser, EventUserDocument } from './schema/event-user.schema';
import { Reward, RewardDocument } from './schema/reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import * as dayjs from 'dayjs';

interface LoginDaysResult {
  loginDaysCount: number;
}

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserLogin.name) private userLoginModel: Model<UserLogin>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(EventUser.name)
    private eventUserModel: Model<EventUserDocument>,
  ) {}

  async createReward(createRewardDto: CreateRewardDto): Promise<Reward> {
    try {
      const newReward = new this.rewardModel(createRewardDto);
      return await newReward.save();
    } catch (err) {
      console.error('보상 내용 저장 에러:', err);
      throw err;
    }
  }

  async findRewardAll(): Promise<Reward[]> {
    return this.rewardModel.find().exec();
  }

  async checkAutoReward(userId: string): Promise<
    {
      eligible: boolean;
      rewardId?: string;
      rewardTitle?: string;
      eventId?: string;
      eventTitle?: string;
      message: string;
      failedCondition?: string;
    }[]
  > {
    const rewardedEvents = await this.eventUserModel
      .find({ userId })
      .distinct('eventId')
      .exec();

    const events = await this.eventModel
      .find({
        isActive: true,
        _id: { $nin: rewardedEvents },
      })
      .exec();

    const results: {
      eligible: boolean;
      rewardId?: string;
      rewardTitle?: string;
      eventId?: string;
      eventTitle?: string;
      message: string;
      failedCondition?: string;
    }[] = [];

    for (const event of events) {
      let allConditionsMet = true;
      let failedCondition = '';

      for (const reward of event.rewards) {
        const conditionMet = await this.checkRewardConditions(
          userId,
          reward.rewardCondition,
        );
        if (!conditionMet) {
          allConditionsMet = false;
          failedCondition = reward.rewardCondition;
          break;
        }
      }

      if (!allConditionsMet) {
        results.push({
          eligible: false,
          message: '조건을 만족하지 않아 보상을 받을 수 없습니다.',
          failedCondition,
          eventTitle: event.title,
          eventId: event._id.toString(),
        });
        continue;
      }

      for (const reward of event.rewards) {
        const existingReward = await this.eventUserModel
          .findOne({
            userId,
            eventId: event._id,
          })
          .exec();

        if (existingReward) {
          continue;
        }

        const rewardInfo = await this.rewardModel
          .findById(reward.rewardId)
          .exec();

        results.push({
          eligible: true,
          rewardId: reward.rewardId.toString(),
          rewardTitle: rewardInfo?.name || '제목 없음',
          eventId: event._id.toString(),
          eventTitle: event.title,
          message: '보상 지급 대상입니다.',
        });

        await this.eventUserModel.create({
          userId,
          eventId: event._id,
          rewardedAt: new Date(),
        });
      }
    }

    if (results.length === 0) {
      return [
        {
          eligible: false,
          message: '조건을 만족하지 않아 보상을 받을 수 없습니다.',
        },
      ];
    }

    return results;
  }
  async checkRewardConditions(
    userId: string,
    rewardCondition: string,
  ): Promise<boolean> {
    switch (rewardCondition) {
      case 'CONSECUTIVE_LOGIN_3_DAYS':
        return this.checkConsecutiveLoginDays(userId, 3);

      case 'CUMULATIVE_LOGIN_7_DAYS':
        return this.checkCumulativeLoginDays(userId, 7);

      case 'SPECIFIC_DATE_LOGIN':
        return this.checkSpecificDateLogin(userId);

      case 'RETURNING_USER':
        return this.checkReturningUser(userId);

      case 'NEW_USER':
        return this.checkNewUser(userId);

      default:
        throw new BadRequestException('Unknown reward condition');
    }
  }

  private async checkConsecutiveLoginDays(
    userId: string,
    days: number,
  ): Promise<boolean> {
    const today = dayjs().startOf('day');
    const datesToCheck: Date[] = [];
    for (let i = 0; i < days; i++) {
      datesToCheck.push(today.subtract(i, 'day').toDate());
    }

    for (const date of datesToCheck) {
      const start = dayjs(date).startOf('day').toDate();
      const end = dayjs(date).endOf('day').toDate();

      const loginCount = await this.userLoginModel.countDocuments({
        userId,
        loginAt: { $gte: start, $lte: end },
      });

      if (loginCount === 0) return false;
    }
    return true;
  }

  private async checkCumulativeLoginDays(
    userId: string,
    days: number,
  ): Promise<boolean> {
    const distinctLoginDays = await this.userLoginModel
      .aggregate<LoginDaysResult>([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: '$loginAt' },
              month: { $month: '$loginAt' },
              day: { $dayOfMonth: '$loginAt' },
            },
          },
        },
        { $count: 'loginDaysCount' },
      ])
      .exec();

    const count =
      distinctLoginDays.length > 0 ? distinctLoginDays[0].loginDaysCount : 0;

    return count >= days;
  }

  private async checkSpecificDateLogin(userId: string): Promise<boolean> {
    const today = dayjs().startOf('day').toDate();
    const endOfToday = dayjs().endOf('day').toDate();

    const eventDate = today;

    if (!dayjs().isSame(eventDate, 'day')) {
      return false;
    }

    const loginCount = await this.userLoginModel.countDocuments({
      userId,
      loginAt: { $gte: today, $lte: endOfToday },
    });

    return loginCount > 0;
  }

  private async checkReturningUser(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.lastLoginAt) return false;

    const oneYearAgo = dayjs().subtract(1, 'year').toDate();
    return user.lastLoginAt < oneYearAgo;
  }

  private async checkNewUser(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.createdAt) return false;

    const daysSinceSignup = dayjs().diff(dayjs(user.createdAt), 'day');
    return daysSinceSignup <= 30;
  }

  async findActiveEvents(): Promise<EventDocument[]> {
    return this.eventModel.find({ isActive: true }).exec();
  }

  async findAllByUser(userId: string): Promise<EventUserDocument[]> {
    return this.eventUserModel.find({ userId }).populate('eventId').exec();
  }

  async findHistory() {
    const eventUsers = await this.eventUserModel
      .find()
      .populate<{ eventId: EventDocument }>('eventId')
      .lean()
      .exec();

    const rewardHistories: {
      userId: string;
      loginId?: string;
      eventId: string;
      eventTitle: string;
      rewardTitle: string;
      rewardedAt: Date;
    }[] = [];

    for (const item of eventUsers) {
      const event = item.eventId;
      if (!event) continue;

      let rewardTitle = '보상 정보 없음';
      if (event.rewards && event.rewards.length > 0) {
        const rewardId = event.rewards[0].rewardId;
        const reward = await this.rewardModel.findById(rewardId).lean().exec();
        rewardTitle = reward?.name || rewardTitle;
      }

      const userIdStr = item.userId.toString();

      const user = await this.userModel.findById(userIdStr).lean().exec();
      const loginId = user?.loginId || 'Unknown';

      rewardHistories.push({
        userId: userIdStr,
        loginId,
        eventId: event._id.toString(),
        eventTitle: event.title,
        rewardTitle,
        rewardedAt: item.rewardedAt,
      });
    }

    return rewardHistories;
  }

  async findEventById(eventId: string): Promise<Event | null> {
    return this.eventModel.findById(eventId).exec();
  }

  async remove(id: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(id).exec();
  }
}
