import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Project } from "../../projects/entities/project.entity";
import { User } from "../../users/entities/user.entity";

@Entity("favorites")
@Index("uq_favorites_user_project", ["userId", "projectId"], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "user_id", type: "int", nullable: false })
  userId!: number;

  @Column({ name: "project_id", type: "int", nullable: false })
  projectId!: number;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "now()",
    nullable: false,
  })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.favorites, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Project, (project) => project.favorites, { nullable: false })
  @JoinColumn({ name: "project_id" })
  project!: Project;
}
