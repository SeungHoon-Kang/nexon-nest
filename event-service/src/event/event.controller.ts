import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('/api/v1/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('/register')
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get('/list')
  async getAllEvents() {
    return this.eventService.findAll();
  }

  @Get('/:id')
  async getEventById(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Put('/update/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: CreateEventDto,
  ) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete('/delete/:id')
  async deleteEvent(@Param('id') id: string) {
    await this.eventService.remove(id);
    return { message: 'Event deleted successfully' };
  }
}
