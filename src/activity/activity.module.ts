import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import { ActivityResolver } from './activity.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  providers: [ActivityService, ActivityResolver],
  exports: [ActivityService],
})
export class ActivityModule {}