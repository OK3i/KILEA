import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { AuthenticatedUser } from "../auth/current-user.decorator";
import { Project } from "../projects/entities/project.entity";
import { Favorite } from "./entities/favorite.entity";

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favorites: Repository<Favorite>,
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
  ) {}

  list(user: AuthenticatedUser) {
    return this.favorites.find({
      where: { userId: user.id },
      relations: { project: true },
      order: { createdAt: "DESC" },
    });
  }

  async add(projectId: number, user: AuthenticatedUser) {
    const project = await this.projects.findOneBy({
      id: projectId,
      status: "published",
    });
    if (!project) throw new NotFoundException("Project not found");

    if (await this.favorites.findOneBy({ projectId, userId: user.id })) {
      throw new ConflictException("Project is already in favorites");
    }
    try {
      return await this.favorites.save(
        this.favorites.create({ projectId, userId: user.id }),
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === "23505"
      ) {
        throw new ConflictException("Project is already in favorites");
      }
      throw error;
    }
  }

  async remove(projectId: number, user: AuthenticatedUser): Promise<void> {
    const result = await this.favorites.delete({
      projectId,
      userId: user.id,
    });
    if (!result.affected) {
      throw new NotFoundException("Favorite project not found");
    }
  }
}
