import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, Matches } from "class-validator";
import { CreateProjectDto } from "./create-project.dto";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ example: "published", maxLength: 40 })
  @IsOptional()
  @IsString()
  @Matches(/\S/)
  @MaxLength(40)
  status?: string;
}
