import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { AuthenticatedUser } from "../auth/current-user.decorator";
import { UserRole } from "../database/entities/user-role.enum";
import { Project } from "../projects/entities/project.entity";
import { Review } from "./entities/review.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
  ) {}

  async listForProject(projectId: number) {
    await this.findPublishedProject(projectId);
    return this.reviews.find({
      where: { projectId },
      relations: { user: true },
      select: {
        id: true,
        userId: true,
        projectId: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { id: true, name: true, avatarUrl: true },
      },
      order: { createdAt: "DESC" },
    });
  }

  async create(
    projectId: number,
    dto: CreateReviewDto,
    user: AuthenticatedUser,
  ) {
    await this.findPublishedProject(projectId);
    if (await this.reviews.findOneBy({ projectId, userId: user.id })) {
      throw new ConflictException("You have already reviewed this project");
    }
    try {
      return await this.reviews.save(
        this.reviews.create({ ...dto, projectId, userId: user.id }),
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === "23505"
      ) {
        throw new ConflictException("You have already reviewed this project");
      }
      throw error;
    }
  }

  async update(
    reviewId: number,
    dto: UpdateReviewDto,
    user: AuthenticatedUser,
  ) {
    const review = await this.findOwnedReview(reviewId, user);
    this.reviews.merge(review, dto);
    return this.reviews.save(review);
  }

  async remove(reviewId: number, user: AuthenticatedUser): Promise<void> {
    const review = await this.reviews.findOneBy({ id: reviewId });
    if (!review) throw new NotFoundException("Review not found");
    if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("You can manage only your own reviews");
    }
    await this.reviews.remove(review);
  }

  private async findOwnedReview(
    reviewId: number,
    user: AuthenticatedUser,
  ): Promise<Review> {
    const review = await this.reviews.findOneBy({ id: reviewId });
    if (!review) throw new NotFoundException("Review not found");
    if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("You can manage only your own reviews");
    }
    return review;
  }

  private async findPublishedProject(projectId: number): Promise<Project> {
    const project = await this.projects.findOneBy({
      id: projectId,
      status: "published",
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }
}
