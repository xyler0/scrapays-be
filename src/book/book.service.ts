import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async create(name: string, description: string): Promise<Book> {
    const book = this.bookRepository.create({ name, description });
    return this.bookRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async update(id: number, name: string, description: string): Promise<Book> {
    await this.bookRepository.update(id, { name, description });
    const updatedBook = await this.bookRepository.findOne({ where: { id } });
    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    return updatedBook;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.bookRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}