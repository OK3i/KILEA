import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "../categories/entities/category.entity";
import { Favorite } from "../favorites/entities/favorite.entity";
import { Game } from "../games/entities/game.entity";
import { AuthModule } from "../auth/auth.module";
import { Review } from "../reviews/entities/review.entity";
import { Project } from "./entities/project.entity";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Project, Game, Category, Favorite, Review]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
