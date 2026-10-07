import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../categories/entities/category.entity";
import { UserRole } from "../database/entities/user-role.enum";
import { Favorite } from "../favorites/entities/favorite.entity";
import { Game } from "../games/entities/game.entity";
import { Review } from "../reviews/entities/review.entity";
import { AuthenticatedUser } from "../auth/current-user.decorator";
import { Project } from "./entities/project.entity";
import { ProjectVersion } from "./entities/project-version.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectQueryDto, ProjectSort } from "./dto/project-query.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
    @InjectRepository(Game)
    private readonly games: Repository<Game>,
    @InjectRepository(Favorite)
    private readonly favorites: Repository<Favorite>,
  ) {}

  async list(query: ProjectQueryDto) {
    const { q, gameId, categoryId, authorId, authorName, sort, page, limit } =
      query;
    const projects = this.projects
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.game", "game")
      .leftJoinAndSelect("project.category", "category")
      .leftJoin("project.author", "author")
      .addSelect(["author.id", "author.name"])
      .where("project.status = :status", { status: "published" });

    if (q?.trim()) {
      projects.andWhere(
        "(project.name ILIKE :search OR project.description ILIKE :search OR game.name ILIKE :search OR category.name ILIKE :search OR author.name ILIKE :search)",
        { search: `%${q.trim()}%` },
      );
    }
    if (gameId) projects.andWhere("project.gameId = :gameId", { gameId });
    if (categoryId) {
      projects.andWhere("project.categoryId = :categoryId", { categoryId });
    }
    if (authorId)
      projects.andWhere("project.authorId = :authorId", { authorId });
    if (authorName?.trim()) {
      projects.andWhere("author.name ILIKE :authorName", {
        authorName: `%${authorName.trim()}%`,
      });
    }

    if (sort === ProjectSort.POPULAR) {
      projects
        .addSelect(
          (subQuery) =>
            subQuery
              .select("COUNT(*)")
              .from(Favorite, "favorite")
              .where("favorite.project_id = project.id"),
          "favorite_count",
        )
        .orderBy("favorite_count", "DESC")
        .addOrderBy("project.createdAt", "DESC");
    } else {
      projects.orderBy("project.createdAt", "DESC");
    }

    const [items, total] = await projects
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const project = await this.projects
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.game", "game")
      .leftJoinAndSelect("project.category", "category")
      .leftJoin("project.author", "author")
      .addSelect(["author.id", "author.name"])
      .leftJoinAndSelect("project.versions", "version")
      .where("project.id = :id", { id })
      .andWhere("project.status = :status", { status: "published" })
      .orderBy("version.createdAt", "DESC")
      .getOne();

    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async create(dto: CreateProjectDto, user: AuthenticatedUser) {
    this.assertAuthor(user);
    await this.ensureReferences(dto.gameId, dto.categoryId);

    return this.projects.save(
      this.projects.create({ ...dto, authorId: user.id }),
    );
  }

  async update(id: number, dto: UpdateProjectDto, user: AuthenticatedUser) {
    const project = await this.findForManagement(id, user);
    if (dto.status !== undefined && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Only administrators can change project status",
      );
    }
    if (dto.gameId !== undefined || dto.categoryId !== undefined) {
      await this.ensureReferences(
        dto.gameId ?? project.gameId,
        dto.categoryId ?? project.categoryId,
      );
    }

    this.projects.merge(project, dto);
    return this.projects.save(project);
  }

  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    await this.findForManagement(id, user);
    await this.projects.manager.transaction(async (manager) => {
      await manager.delete(Favorite, { projectId: id });
      await manager.delete(Review, { projectId: id });
      await manager.delete(ProjectVersion, { projectId: id });
      await manager.delete(Project, { id });
    });
  }

  private async findForManagement(id: number, user: AuthenticatedUser) {
    const project = await this.projects.findOneBy({ id });
    if (!project) throw new NotFoundException("Project not found");

    if (user.role !== UserRole.ADMIN && project.authorId !== user.id) {
      throw new ForbiddenException("You can manage only your own projects");
    }
    this.assertAuthor(user);
    return project;
  }

  private assertAuthor(user: AuthenticatedUser): void {
    if (user.role === UserRole.USER) {
      throw new ForbiddenException("Author role is required");
    }
  }

  private async ensureReferences(gameId: number, categoryId: number) {
    const game = await this.games.findOneBy({ id: gameId });
    if (!game) throw new NotFoundException("Game not found");

    const category = await this.projects.manager
      .getRepository(Category)
      .findOneBy({ id: categoryId });
    if (!category) throw new NotFoundException("Category not found");
  }
}
