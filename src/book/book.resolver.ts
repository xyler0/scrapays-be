import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ActivityService } from '../activity/activity.service';

@Resolver(() => Book)
export class BookResolver {
  constructor(
    private bookService: BookService,
    private activityService: ActivityService,
  ) {}

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
    @CurrentUser() user: any,
  ): Promise<Book> {
    const book = await this.bookService.create(name, description);
    
    // Log activity
    await this.activityService.log(
      'BOOK_CREATED',
      'BOOK',
      book.id,
      { name: book.name, description: book.description },
      user.sub,
      user.email || user.sub,
    );

    return book;
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard)
  async updateBook(
    @Args('id', { type: () => Int }) id: number,
    @Args('name') name: string,
    @Args('description') description: string,
    @CurrentUser() user: any,
  ): Promise<Book> {
    // Get the old book state
    const oldBook = await this.bookService.findAll();
    const bookBefore = oldBook.find(b => b.id === id);

    const book = await this.bookService.update(id, name, description);
    
    // Log activity
    await this.activityService.log(
      'BOOK_UPDATED',
      'BOOK',
      book.id,
      { 
        before: bookBefore,
        after: { name: book.name, description: book.description }
      },
      user.sub,
      user.email || user.sub,
    );

    return book;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteBook(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // Get book details before deletion
    const books = await this.bookService.findAll();
    const book = books.find(b => b.id === id);

    const result = await this.bookService.delete(id);
    
    if (result && book) {
      // Log activity
      await this.activityService.log(
        'BOOK_DELETED',
        'BOOK',
        id,
        { name: book.name, description: book.description },
        user.sub,
        user.email || user.sub,
      );
    }

    return result;
  }
}