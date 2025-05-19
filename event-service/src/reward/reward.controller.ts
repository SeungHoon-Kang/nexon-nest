import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Request } from 'express';

@Controller('api/v1/reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  // 보상 등록 (create)
  @Post('/create')
  async createReward(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardService.createReward(createRewardDto);
  }

  // 보상 목록 조회 (list)
  @Get('/list')
  async getAllRewards() {
    return this.rewardService.findRewardAll();
  }

  // 보상 목록 조회 (list)
  @Get('/hist')
  async getRewardHist() {
    return this.rewardService.findHistory();
  }

  // 보상 요청
  @Post('/request')
  async requestReward(@Req() req: Request) {
    const userId = req.headers['x-user-id'];
    if (!userId || Array.isArray(userId)) {
      throw new BadRequestException('User ID not provided');
    }

    const result = await this.rewardService.checkAutoReward(userId);
    return result;
  }

  // 이벤트 삭제 (delete)
  @Post('/delete/:id')
  async deleteEvent(@Param('id') id: string) {
    await this.rewardService.remove(id);
    return { message: 'reward deleted successfully' };
  }
}
