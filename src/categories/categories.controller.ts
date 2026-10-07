import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List project categories" })
  @ApiOkResponse({ description: "Categories ordered by name" })
  findAll() {
    return this.categories.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiOkResponse({ description: "Category details" })
  @ApiBadRequestResponse({ description: "Category ID must be an integer" })
  @ApiNotFoundResponse({ description: "Category not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.categories.findOne(id);
  }
}
