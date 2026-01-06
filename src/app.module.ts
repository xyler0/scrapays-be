import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BookModule } from './book/book.module';
import { AuthModule } from './auth/auth.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
     driver: ApolloDriver,
     autoSchemaFile: true,
     playground: true,
     context: ({ req }) => ({ req }),
     includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
    }),
    DatabaseModule,
    AuthModule,
    BookModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 