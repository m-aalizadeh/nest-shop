import { NotFoundException } from '@nestjs/common';
import { Model, Document, QueryFilter, UpdateQuery } from 'mongoose';

export abstract class BaseService<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return created.save();
  }

  async findAll(filter: QueryFilter<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findById(id: string): Promise<T> {
    const doc = await this.model.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`${this.model.modelName} with id ${id} not found`);
    }
    return doc;
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T> {
    const doc = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!doc) {
      throw new NotFoundException(`${this.model.modelName} with id ${id} not found`);
    }
    return doc;
  }

  async deleteById(id: string): Promise<void> {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`${this.model.modelName} with id ${id} not found`);
    }
  }
}
