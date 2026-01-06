import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../book/book.entity';
import { Activity } from '../activity/activity.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'db.sqlite',
            entities: [Book, Activity], 
            synchronize: true,
            logging: false,
        }),
    ],
})
export class DatabaseModule {}