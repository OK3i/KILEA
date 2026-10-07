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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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
import { Project } from "../projects/entities/project.entity";
import { CreateVersionDto } from "./dto/create-version.dto";
import { UpdateVersionDto } from "./dto/update-version.dto";
import { VersionsService } from "./versions.service";

@ApiTags("Project versions")
@Controller("projects/:projectId/versions")
export class VersionsController {
  constructor(private readonly versions: VersionsService) {}

  @Get()
  @ApiOperation({ summary: "List versions of a published project" })
  @ApiOkResponse({ description: "Project versions, newest first" })
  @ApiBadRequestResponse({ description: "Invalid project ID" })
  @ApiNotFoundResponse({ description: "Project not found" })
  list(@Param("projectId", ParseIntPipe) projectId: number) {
    return this.versions.list(projectId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @CheckOwnership(Project, "projectId", "authorId")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Add a version to an owned project" })
  @ApiCreatedResponse({ description: "Version created" })
  @ApiBadRequestResponse({ description: "Invalid project ID or version data" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({
    description: "Author role or project ownership required",
  })
  @ApiNotFoundResponse({ description: "Project not found" })
  create(
    @Param("projectId", ParseIntPipe) projectId: number,
    @Body() dto: CreateVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.versions.create(projectId, dto, user);
  }

  @Patch(":versionId")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @CheckOwnership(Project, "projectId", "authorId")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update a version of an owned project" })
  @ApiOkResponse({ description: "Version updated" })
  @ApiBadRequestResponse({
    description: "Invalid project or version ID or data",
  })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Project ownership required" })
  @ApiNotFoundResponse({ description: "Project or version not found" })
  update(
    @Param("projectId", ParseIntPipe) projectId: number,
    @Param("versionId", ParseIntPipe) versionId: number,
    @Body() dto: UpdateVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.versions.update(projectId, versionId, dto, user);
  }

  @Delete(":versionId")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @CheckOwnership(Project, "projectId", "authorId")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a version of an owned project" })
  @ApiOkResponse({ description: "Version deleted" })
  @ApiBadRequestResponse({ description: "Invalid project or version ID" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Project ownership required" })
  @ApiNotFoundResponse({ description: "Project or version not found" })
  remove(
    @Param("projectId", ParseIntPipe) projectId: number,
    @Param("versionId", ParseIntPipe) versionId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.versions.remove(projectId, versionId, user);
  }
}
