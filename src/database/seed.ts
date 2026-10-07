import { ConfigModule } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { Category } from "../categories/entities/category.entity";
import { UserRole } from "./entities/user-role.enum";
import { Favorite } from "../favorites/entities/favorite.entity";
import { Game } from "../games/entities/game.entity";
import { Project } from "../projects/entities/project.entity";
import { ProjectVersion } from "../projects/entities/project-version.entity";
import { Review } from "../reviews/entities/review.entity";
import { User } from "../users/entities/user.entity";

async function seed(): Promise<void> {
  await ConfigModule.forRoot({ isGlobal: true });
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be configured before running the seed");
  }

  const dataSource = new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [User, Game, Category, Project, ProjectVersion, Review, Favorite],
    synchronize:
      process.env.DB_SYNCHRONIZE === "true" ||
      process.env.NODE_ENV !== "production",
  });

  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const passwordHash = await bcrypt.hash("password123", 12);
      const seedUsers = [
        {
          name: "ModForge Admin",
          email: "admin@modforge.local",
          passwordHash,
          role: UserRole.ADMIN,
          avatarUrl: null,
        },
        {
          name: "ModForge Author",
          email: "author@modforge.local",
          passwordHash,
          role: UserRole.AUTHOR,
          avatarUrl: null,
        },
        {
          name: "ModForge User",
          email: "user@modforge.local",
          passwordHash,
          role: UserRole.USER,
          avatarUrl: null,
        },
      ];

      await usersRepository.upsert(seedUsers, ["email"]);
      const users = new Map<string, User>();
      for (const seedUser of seedUsers) {
        const user = await usersRepository.findOneByOrFail({
          email: seedUser.email,
        });
        users.set(seedUser.email, user);
      }

      const categoryRepository = manager.getRepository(Category);
      const categorySeeds = [
        { name: "Графика", description: "Графические модификации и улучшения" },
        { name: "Геймплей", description: "Изменения игрового процесса" },
        { name: "Квесты", description: "Новые задания и сюжетные линии" },
        {
          name: "Интерфейс",
          description: "Улучшения пользовательского интерфейса",
        },
      ];
      await categoryRepository.upsert(categorySeeds, ["name"]);
      const categories = new Map<string, Category>();
      for (const seedCategory of categorySeeds) {
        const category = await categoryRepository.findOneByOrFail({
          name: seedCategory.name,
        });
        categories.set(seedCategory.name, category);
      }

      const gameRepository = manager.getRepository(Game);
      const gameSeeds = [
        {
          name: "The Witcher 3",
          description: "Open-world role-playing game",
        },
        { name: "Skyrim", description: "Fantasy role-playing game" },
      ];
      await gameRepository.upsert(gameSeeds, ["name"]);
      const games = new Map<string, Game>();
      for (const seedGame of gameSeeds) {
        const game = await gameRepository.findOneByOrFail({
          name: seedGame.name,
        });
        games.set(seedGame.name, game);
      }

      const author = users.get("author@modforge.local")!;
      const projectSeeds = [
        {
          name: "Northern Realms Reforged",
          game: "The Witcher 3",
          category: "Графика",
          description:
            "A visual refresh for the Northern Kingdoms with richer lighting and landscapes.",
          requirements: "The Witcher 3: Wild Hunt",
          imageUrl: null,
        },
        {
          name: "Wild Horizons",
          game: "Skyrim",
          category: "Графика",
          description:
            "A community visual preset for clearer skies, distant terrain, and forests.",
          requirements: "Skyrim Special Edition",
          imageUrl: null,
        },
        {
          name: "Balanced Combat",
          game: "Skyrim",
          category: "Геймплей",
          description:
            "A lightweight combat rebalance with faster encounters and more responsive defense.",
          requirements: "Skyrim Special Edition",
          imageUrl: null,
        },
      ];

      const projectRepository = manager.getRepository(Project);
      const projects = new Map<string, Project>();
      for (const seedProject of projectSeeds) {
        let project = await projectRepository.findOneBy({
          authorId: author.id,
          name: seedProject.name,
        });
        if (!project) project = projectRepository.create();
        projectRepository.merge(project, {
          authorId: author.id,
          gameId: games.get(seedProject.game)!.id,
          categoryId: categories.get(seedProject.category)!.id,
          name: seedProject.name,
          description: seedProject.description,
          requirements: seedProject.requirements,
          imageUrl: seedProject.imageUrl,
          status: "published",
        });
        project = await projectRepository.save(project);
        projects.set(seedProject.name, project);
      }

      const versionSeeds = [
        {
          project: "Northern Realms Reforged",
          version: "1.0.0",
          description: "Initial release with the complete visual preset.",
        },
        {
          project: "Northern Realms Reforged",
          version: "1.1.0",
          description: "Improved lighting balance and compatibility fixes.",
        },
        {
          project: "Wild Horizons",
          version: "1.0.0",
          description: "Initial release of the landscape and sky improvements.",
        },
        {
          project: "Balanced Combat",
          version: "1.0.0",
          description: "Initial combat rebalance.",
        },
      ];
      const versionRepository = manager.getRepository(ProjectVersion);
      for (const seedVersion of versionSeeds) {
        const projectId = projects.get(seedVersion.project)!.id;
        const version =
          (await versionRepository.findOneBy({
            projectId,
            version: seedVersion.version,
          })) ??
          versionRepository.create({
            projectId,
            version: seedVersion.version,
            description: seedVersion.description,
          });
        version.projectId = projectId;
        version.version = seedVersion.version;
        version.description = seedVersion.description;
        version.downloadUrl = null;
        await versionRepository.save(version);
      }

      const reviewSeeds = [
        {
          user: "user@modforge.local",
          project: "Northern Realms Reforged",
          rating: 5,
          comment: "Beautiful atmosphere and a noticeable visual upgrade.",
        },
        {
          user: "admin@modforge.local",
          project: "Northern Realms Reforged",
          rating: 4,
          comment: "A polished preset with a strong sense of place.",
        },
        {
          user: "user@modforge.local",
          project: "Wild Horizons",
          rating: 4,
          comment: "The distant landscapes look much more alive.",
        },
        {
          user: "admin@modforge.local",
          project: "Balanced Combat",
          rating: 5,
          comment: "Combat feels more responsive without losing its challenge.",
        },
      ];
      const reviewRepository = manager.getRepository(Review);
      for (const seedReview of reviewSeeds) {
        await reviewRepository.upsert(
          {
            userId: users.get(seedReview.user)!.id,
            projectId: projects.get(seedReview.project)!.id,
            rating: seedReview.rating,
            comment: seedReview.comment,
          },
          ["userId", "projectId"],
        );
      }

      const favoriteSeeds = [
        { user: "user@modforge.local", project: "Northern Realms Reforged" },
        { user: "user@modforge.local", project: "Wild Horizons" },
        { user: "admin@modforge.local", project: "Balanced Combat" },
      ];
      const favoriteRepository = manager.getRepository(Favorite);
      for (const seedFavorite of favoriteSeeds) {
        await favoriteRepository.upsert(
          {
            userId: users.get(seedFavorite.user)!.id,
            projectId: projects.get(seedFavorite.project)!.id,
          },
          ["userId", "projectId"],
        );
      }

      console.info(
        `Seed complete: ${seedUsers.length} users, ${categorySeeds.length} categories, ` +
          `${gameSeeds.length} games, ${projectSeeds.length} projects, ` +
          `${versionSeeds.length} versions, ${reviewSeeds.length} reviews, ` +
          `${favoriteSeeds.length} favorites.`,
      );
    });
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error("Database seeding failed:", error);
  process.exitCode = 1;
});
