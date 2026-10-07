import "dotenv/config";
import { DataSource } from "typeorm";
import { Category } from "../categories/entities/category.entity";
import { Favorite } from "../favorites/entities/favorite.entity";
import { Game } from "../games/entities/game.entity";
import { Project } from "../projects/entities/project.entity";
import { ProjectVersion } from "../projects/entities/project-version.entity";
import { Review } from "../reviews/entities/review.entity";
import { User } from "../users/entities/user.entity";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be configured before running migrations");
}

export default new DataSource({
  type: "postgres",
  url: databaseUrl,
  entities: [User, Game, Category, Project, ProjectVersion, Review, Favorite],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
});
