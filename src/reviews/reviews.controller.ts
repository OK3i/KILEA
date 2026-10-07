import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthenticatedUser, CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get("projects/:projectId")
  @ApiOperation({ summary: "List reviews for a published project" })
  @ApiOkResponse({ description: "Project reviews" })
  @ApiBadRequestResponse({ description: "Invalid project ID" })
  @ApiNotFoundResponse({ description: "Project not found" })
  listForProject(@Param("projectId", ParseIntPipe) projectId: number) {
    return this.reviews.listForProject(projectId);
  }

  @Post("projects/:projectId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Rate and review a published project" })
  @ApiCreatedResponse({ description: "Review created" })
  @ApiConflictResponse({
    description: "The current user has already reviewed this project",
  })
  @ApiBadRequestResponse({ description: "Invalid project ID or review data" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiNotFoundResponse({ description: "Project not found" })
  create(
    @Param("projectId", ParseIntPipe) projectId: number,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviews.create(projectId, dto, user);
  }

  @Patch(":reviewId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update your review" })
  @ApiOkResponse({ description: "Review updated" })
  @ApiBadRequestResponse({ description: "Invalid review ID or data" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Review belongs to another user" })
  @ApiNotFoundResponse({ description: "Review not found" })
  update(
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviews.update(reviewId, dto, user);
  }

  @Delete(":reviewId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete your review or moderate as admin" })
  @ApiOkResponse({ description: "Review deleted" })
  @ApiBadRequestResponse({ description: "Invalid review ID" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Review belongs to another user" })
  @ApiNotFoundResponse({ description: "Review not found" })
  remove(
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviews.remove(reviewId, user);
  }
}
