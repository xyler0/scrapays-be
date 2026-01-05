import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookService } from './book.service';
import { Book } from './book.entity';

describe('BookService', () => {
  let service: BookService;
  let repository: Repository<Book>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const bookData = { name: 'Test Book', description: 'Test Description' };
      const savedBook = { id: 1, ...bookData };

      mockRepository.create.mockReturnValue(savedBook);
      mockRepository.save.mockResolvedValue(savedBook);

      const result = await service.create(bookData.name, bookData.description);

      expect(result).toEqual(savedBook);
      expect(mockRepository.create).toHaveBeenCalledWith(bookData);
      expect(mockRepository.save).toHaveBeenCalledWith(savedBook);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books = [
        { id: 1, name: 'Book 1', description: 'Desc 1' },
        { id: 2, name: 'Book 2', description: 'Desc 2' },
      ];

      mockRepository.find.mockResolvedValue(books);

      const result = await service.findAll();

      expect(result).toEqual(books);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const bookId = 1;
      const updateData = { name: 'Updated', description: 'Updated Desc' };
      const updatedBook = { id: bookId, ...updateData };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedBook);

      const result = await service.update(bookId, updateData.name, updateData.description);

      expect(result).toEqual(updatedBook);
      expect(mockRepository.update).toHaveBeenCalledWith(bookId, updateData);
    });
  });

  describe('delete', () => {
    it('should delete a book and return true', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if book not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete(999);

      expect(result).toBe(false);
    });
  });
});