import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthenticatedUser } from "../auth/current-user.decorator";
import { UserRole } from "../database/entities/user-role.enum";
import { Project } from "../projects/entities/project.entity";
import { ProjectVersion } from "../projects/entities/project-version.entity";
import { CreateVersionDto } from "./dto/create-version.dto";
import { UpdateVersionDto } from "./dto/update-version.dto";

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
    @InjectRepository(ProjectVersion)
    private readonly versions: Repository<ProjectVersion>,
  ) {}

  async list(projectId: number) {
    await this.findPublishedProject(projectId);
    return this.versions.find({
      where: { projectId },
      order: { createdAt: "DESC" },
    });
  }

  async create(
    projectId: number,
    dto: CreateVersionDto,
    user: AuthenticatedUser,
  ) {
    await this.findManageableProject(projectId, user);
    return this.versions.save(this.versions.create({ ...dto, projectId }));
  }

  async update(
    projectId: number,
    versionId: number,
    dto: UpdateVersionDto,
    user: AuthenticatedUser,
  ) {
    await this.findManageableProject(projectId, user);
    const version = await this.versions.findOneBy({ id: versionId, projectId });
    if (!version) throw new NotFoundException("Project version not found");

    this.versions.merge(version, dto);
    return this.versions.save(version);
  }

  async remove(
    projectId: number,
    versionId: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.findManageableProject(projectId, user);
    const result = await this.versions.delete({ id: versionId, projectId });
    if (!result.affected)
      throw new NotFoundException("Project version not found");
  }

  private async findPublishedProject(projectId: number): Promise<Project> {
    const project = await this.projects.findOneBy({
      id: projectId,
      status: "published",
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  private async findManageableProject(
    projectId: number,
    user: AuthenticatedUser,
  ): Promise<Project> {
    const project = await this.projects.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException("Project not found");
    if (
      user.role !== UserRole.ADMIN &&
      (user.role !== UserRole.AUTHOR || project.authorId !== user.id)
    ) {
      throw new ForbiddenException("You can manage only your own projects");
    }
    return project;
  }
}
