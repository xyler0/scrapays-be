import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async log(
    action: string,
    entityType: string,
    entityId: number | null,
    details: any,
    userId: string,
    userEmail: string,
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      action,
      entityType,
      entityId: entityId ?? undefined,
      details: JSON.stringify(details),
      userId,
      userEmail,
    });
    return this.activityRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async findByUser(userId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }
}