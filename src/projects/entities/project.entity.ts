import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Game } from '../../games/entities/game.entity';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { ProjectVersion } from './project-version.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'author_id', type: 'int', nullable: false })
  authorId!: number;

  @Column({ name: 'game_id', type: 'int', nullable: false })
  gameId!: number;

  @Column({ name: 'category_id', type: 'int', nullable: false })
  categoryId!: number;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  requirements!: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'varchar', default: 'published', nullable: false })
  status!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'now()',
    nullable: false,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'now()',
    nullable: false,
  })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.projects, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne(() => Game, (game) => game.projects, { nullable: false })
  @JoinColumn({ name: 'game_id' })
  game!: Game;

  @ManyToOne(() => Category, (category) => category.projects, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToMany(() => ProjectVersion, (version) => version.project)
  versions!: ProjectVersion[];

  @OneToMany(() => Review, (review) => review.project)
  reviews!: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.project)
  favorites!: Favorite[];
}