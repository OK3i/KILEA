import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { ProjectsModule } from "./projects/projects.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UsersModule } from "./users/users.module";
import { VersionsModule } from "./versions/versions.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { CategoriesModule } from "./categories/categories.module";
import { GamesModule } from "./games/games.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    VersionsModule,
    ReviewsModule,
    FavoritesModule,
    CategoriesModule,
    GamesModule,
  ],
})
export class AppModule {}
