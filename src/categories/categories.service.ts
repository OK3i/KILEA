import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll() {
    return this.categories.find({ order: { name: "ASC" } });
  }

  async findOne(id: number) {
    const category = await this.categories.findOneBy({ id });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }
}
