import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Activity)
export class ActivityResolver {
  constructor(private activityService: ActivityService) {}

  @Query(() => [Activity], { name: 'activities' })
  @UseGuards(GqlAuthGuard)
  async findAll(): Promise<Activity[]> {
    return this.activityService.findAll();
  }
}