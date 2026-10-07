import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  Min,
  MinLength,
} from "class-validator";

export class CreateProjectDto {
  @ApiProperty({
    description: "ID of the game this project modifies",
    example: 3,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  gameId!: number;

  @ApiProperty({
    description: "ID of the project category",
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiProperty({
    description: "Project name",
    example: "Enhanced weather system",
    minLength: 2,
    maxLength: 160,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: "Project description",
    example: "Adds dynamic weather to the game.",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Game and installation requirements",
    example: "Requires game version 2.0 or later.",
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({
    description: "Absolute URL of the project image",
    example: "https://example.com/weather-mod.png",
    format: "uri",
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  imageUrl?: string;
}
