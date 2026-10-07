import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum ProjectSort {
  NEWEST = "newest",
  POPULAR = "popular",
}

export class ProjectQueryDto {
  @ApiPropertyOptional({
    description:
      "Search by project name or description, game name, or category name",
    example: "weather",
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: "Filter by game ID",
    minimum: 1,
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  gameId?: number;

  @ApiPropertyOptional({
    description: "Filter by category ID",
    minimum: 1,
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({
    minimum: 1,
    description: "Filter by project author ID",
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number;

  @ApiPropertyOptional({
    description: "Filter by a partial author name, case-insensitive",
    example: "Alex",
  })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ enum: ProjectSort, default: ProjectSort.NEWEST })
  @IsOptional()
  @IsEnum(ProjectSort)
  sort?: ProjectSort = ProjectSort.NEWEST;

  @ApiPropertyOptional({
    description: "Page number (1-based)",
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: "Number of projects per page",
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
