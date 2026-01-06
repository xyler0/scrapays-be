import { Test, TestingModule } from '@nestjs/testing';
import { BookResolver } from './book.resolver';
import { BookService } from './book.service';
import { ActivityService } from '../activity/activity.service';

describe('BookResolver', () => {
  let resolver: BookResolver;
  let bookService: BookService;
  let activityService: ActivityService;

  const mockBookService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockActivityService = {
    log: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
  };

  const mockUser = {
    sub: 'auth0|123456789',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookResolver,
        {
          provide: BookService,
          useValue: mockBookService,
        },
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
      ],
    }).compile();

    resolver = module.get<BookResolver>(BookResolver);
    bookService = module.get<BookService>(BookService);
    activityService = module.get<ActivityService>(ActivityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all books', async () => {
      const books = [{ id: 1, name: 'Book 1', description: 'Desc 1' }];
      mockBookService.findAll.mockResolvedValue(books);

      const result = await resolver.findAll();

      expect(result).toEqual(books);
      expect(bookService.findAll).toHaveBeenCalled();
    });
  });

  describe('createBook', () => {
    it('should create a book and log activity', async () => {
      const newBook = { id: 1, name: 'New Book', description: 'New Desc' };
      mockBookService.create.mockResolvedValue(newBook);
      mockActivityService.log.mockResolvedValue({
        id: 1,
        action: 'BOOK_CREATED',
        entityType: 'BOOK',
        entityId: 1,
        details: JSON.stringify(newBook),
        userId: mockUser.sub,
        userEmail: mockUser.email,
        timestamp: new Date(),
      });

      const result = await resolver.createBook('New Book', 'New Desc', mockUser);

      expect(result).toEqual(newBook);
      expect(bookService.create).toHaveBeenCalledWith('New Book', 'New Desc');
      expect(activityService.log).toHaveBeenCalledWith(
        'BOOK_CREATED',
        'BOOK',
        newBook.id,
        { name: newBook.name, description: newBook.description },
        mockUser.sub,
        mockUser.email,
      );
    });
  });

  describe('updateBook', () => {
    it('should update a book and log activity', async () => {
      const oldBooks = [{ id: 1, name: 'Old Book', description: 'Old Desc' }];
      const updated = { id: 1, name: 'Updated', description: 'Updated Desc' };
      
      mockBookService.findAll.mockResolvedValue(oldBooks);
      mockBookService.update.mockResolvedValue(updated);
      mockActivityService.log.mockResolvedValue({
        id: 2,
        action: 'BOOK_UPDATED',
        entityType: 'BOOK',
        entityId: 1,
        details: JSON.stringify({ before: oldBooks[0], after: updated }),
        userId: mockUser.sub,
        userEmail: mockUser.email,
        timestamp: new Date(),
      });

      const result = await resolver.updateBook(1, 'Updated', 'Updated Desc', mockUser);

      expect(result).toEqual(updated);
      expect(bookService.findAll).toHaveBeenCalled();
      expect(bookService.update).toHaveBeenCalledWith(1, 'Updated', 'Updated Desc');
      expect(activityService.log).toHaveBeenCalledWith(
        'BOOK_UPDATED',
        'BOOK',
        1,
        {
          before: oldBooks[0],
          after: { name: updated.name, description: updated.description },
        },
        mockUser.sub,
        mockUser.email,
      );
    });
  });

  describe('deleteBook', () => {
    it('should delete a book and log activity', async () => {
      const books = [{ id: 1, name: 'Book to Delete', description: 'Will be deleted' }];
      
      mockBookService.findAll.mockResolvedValue(books);
      mockBookService.delete.mockResolvedValue(true);
      mockActivityService.log.mockResolvedValue({
        id: 3,
        action: 'BOOK_DELETED',
        entityType: 'BOOK',
        entityId: 1,
        details: JSON.stringify(books[0]),
        userId: mockUser.sub,
        userEmail: mockUser.email,
        timestamp: new Date(),
      });

      const result = await resolver.deleteBook(1, mockUser);

      expect(result).toBe(true);
      expect(bookService.findAll).toHaveBeenCalled();
      expect(bookService.delete).toHaveBeenCalledWith(1);
      expect(activityService.log).toHaveBeenCalledWith(
        'BOOK_DELETED',
        'BOOK',
        1,
        { name: books[0].name, description: books[0].description },
        mockUser.sub,
        mockUser.email,
      );
    });

    it('should not log activity if delete fails', async () => {
      mockBookService.findAll.mockResolvedValue([]);
      mockBookService.delete.mockResolvedValue(false);

      const result = await resolver.deleteBook(999, mockUser);

      expect(result).toBe(false);
      expect(activityService.log).not.toHaveBeenCalled();
    });
  });
});