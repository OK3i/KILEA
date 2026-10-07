import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthenticatedUser, CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FavoritesService } from "./favorites.service";

@ApiTags("Favorites")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's favorite projects" })
  @ApiOkResponse({ description: "Favorite projects" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.favorites.list(user);
  }

  @Post(":projectId")
  @ApiOperation({ summary: "Add a published project to favorites" })
  @ApiCreatedResponse({ description: "Project added to favorites" })
  @ApiBadRequestResponse({ description: "Invalid project ID" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiNotFoundResponse({ description: "Project not found" })
  add(
    @Param("projectId", ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.favorites.add(projectId, user);
  }

  @Delete(":projectId")
  @ApiOperation({ summary: "Remove a project from favorites" })
  @ApiOkResponse({ description: "Project removed from favorites" })
  @ApiBadRequestResponse({ description: "Invalid project ID" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiNotFoundResponse({ description: "Favorite project not found" })
  remove(
    @Param("projectId", ParseIntPipe) projectId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.favorites.remove(projectId, user);
  }
}
