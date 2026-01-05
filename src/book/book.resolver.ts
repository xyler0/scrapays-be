import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Book } from './book.entity';
import { BookService } from './book.service';

@Resolver(() => Book)
export class BookResolver {
  constructor(private bookService: BookService) {}

  @Query(() => [Book], { name: 'books' })
  async findAll(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Mutation(() => Book)
  async createBook(
    @Args('name') name: string,
    @Args('description') description: string,
  ): Promise<Book> {
    return this.bookService.create(name, description);
  }

  @Mutation(() => Book)
  async updateBook(
    @Args('id', { type: () => Int }) id: number,
    @Args('name') name: string,
    @Args('description') description: string,
  ): Promise<Book> {
    return this.bookService.update(id, name, description);
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.bookService.delete(id);
  }
}