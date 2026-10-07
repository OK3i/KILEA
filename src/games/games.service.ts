import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "./entities/game.entity";

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly games: Repository<Game>,
  ) {}

  findAll() {
    return this.games.find({ order: { name: "ASC" } });
  }

  async findOne(id: number) {
    const game = await this.games.findOneBy({ id });
    if (!game) throw new NotFoundException("Game not found");
    return game;
  }
}
