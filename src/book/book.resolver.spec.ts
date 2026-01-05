import { Test, TestingModule } from '@nestjs/testing';
import { BookResolver } from './book.resolver';
import { BookService } from './book.service';

describe('BookResolver', () => {
  let resolver: BookResolver;
  let service: BookService;

  const mockBookService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookResolver,
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    resolver = module.get<BookResolver>(BookResolver);
    service = module.get<BookService>(BookService);
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
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('createBook', () => {
    it('should create a book', async () => {
      const newBook = { id: 1, name: 'New Book', description: 'New Desc' };
      mockBookService.create.mockResolvedValue(newBook);

      const result = await resolver.createBook('New Book', 'New Desc');

      expect(result).toEqual(newBook);
      expect(service.create).toHaveBeenCalledWith('New Book', 'New Desc');
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      const updated = { id: 1, name: 'Updated', description: 'Updated Desc' };
      mockBookService.update.mockResolvedValue(updated);

      const result = await resolver.updateBook(1, 'Updated', 'Updated Desc');

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, 'Updated', 'Updated Desc');
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      mockBookService.delete.mockResolvedValue(true);

      const result = await resolver.deleteBook(1);

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});