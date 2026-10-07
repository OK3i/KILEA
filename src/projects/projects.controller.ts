import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthenticatedUser, CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CheckOwnership } from "../auth/ownership.decorator";
import { ResourceOwnershipGuard } from "../auth/resource-ownership.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../database/entities/user-role.enum";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectQueryDto } from "./dto/project-query.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Project } from "./entities/project.entity";
import { ProjectsService } from "./projects.service";

@ApiTags("Projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: "Search and filter published projects" })
  @ApiOkResponse({ description: "Paginated projects with total count" })
  @ApiBadRequestResponse({
    description: "Invalid search or pagination parameters",
  })
  list(@Query() query: ProjectQueryDto) {
    return this.projectsService.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a published project and its versions" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Project details" })
  @ApiBadRequestResponse({ description: "Project ID must be an integer" })
  @ApiNotFoundResponse({ description: "Project not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a project as an author or administrator" })
  @ApiCreatedResponse({ description: "Project created" })
  @ApiBadRequestResponse({ description: "Invalid project data" })
  @ApiNotFoundResponse({ description: "Game or category not found" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Author role required" })
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.create(dto, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @CheckOwnership(Project, "id", "authorId")
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Update a project owned by the author or any project as admin",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Project updated" })
  @ApiBadRequestResponse({ description: "Invalid project ID or update data" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Project belongs to another author" })
  @ApiNotFoundResponse({ description: "Project not found" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @CheckOwnership(Project, "id", "authorId")
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Delete a project owned by the author or any project as admin",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({
    description:
      "Project and dependent versions, reviews, and favorites deleted",
  })
  @ApiBadRequestResponse({ description: "Project ID must be an integer" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Project belongs to another author" })
  @ApiNotFoundResponse({ description: "Project not found" })
  remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.remove(id, user);
  }
}
