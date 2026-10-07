import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { Project } from "../projects/entities/project.entity";
import { ProjectVersion } from "../projects/entities/project-version.entity";
import { VersionsController } from "./versions.controller";
import { VersionsService } from "./versions.service";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Project, ProjectVersion])],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
