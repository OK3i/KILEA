import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { GamesService } from "./games.service";

@ApiTags("Games")
@Controller("games")
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Get()
  @ApiOperation({ summary: "List games" })
  @ApiOkResponse({ description: "Games ordered by name" })
  findAll() {
    return this.games.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a game by ID" })
  @ApiOkResponse({ description: "Game details" })
  @ApiBadRequestResponse({ description: "Game ID must be an integer" })
  @ApiNotFoundResponse({ description: "Game not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.games.findOne(id);
  }
}
