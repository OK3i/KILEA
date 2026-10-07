import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateVersionDto {
  @ApiProperty({ example: "1.2.0", maxLength: 40 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(40)
  version!: string;

  @ApiPropertyOptional({
    example: "Fixes compatibility with the latest patch.",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "https://example.com/downloads/mod-1.2.0.zip",
    format: "uri",
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  downloadUrl?: string;
}
