import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async create(data: Pick<User, "name" | "email" | "passwordHash">) {
    const normalizedData = {
      ...data,
      email: data.email.trim().toLowerCase(),
    };
    const existingUser = await this.findByEmail(normalizedData.email);
    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const user = this.usersRepository.create(normalizedData);
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === "23505"
      ) {
        throw new ConflictException("Email is already registered");
      }
      throw error;
    }
  }
}
