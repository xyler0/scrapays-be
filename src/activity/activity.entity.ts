import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Activity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  action: string; // 'BOOK_CREATED', 'BOOK_UPDATED', 'BOOK_DELETED'

  @Field()
  @Column()
  entityType: string; // 'BOOK'

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  entityId: number; // The ID of the book

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  details: string; // JSON string with before/after state

  @Field()
  @Column()
  userId: string; // From JWT token (Auth0 sub)

  @Field()
  @Column()
  userEmail: string; // From JWT token

  @Field()
  @CreateDateColumn()
  timestamp: Date;
}