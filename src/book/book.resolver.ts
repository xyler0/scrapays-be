import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Book)
export class BookResolver {
  constructor(private bookService: BookService) {}

  @Query(() => [Book], { name: 'books' })
  @UseGuards(GqlAuthGuard)
  async findAll(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard)
  async createBook(
    @Args('name') name: string,
    @Args('description') description: string,
  ): Promise<Book> {
    return this.bookService.create(name, description);
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard)
  async updateBook(
    @Args('id', { type: () => Int }) id: number,
    @Args('name') name: string,
    @Args('description') description: string,
  ): Promise<Book> {
    return this.bookService.update(id, name, description);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteBook(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.bookService.delete(id);
  }
}