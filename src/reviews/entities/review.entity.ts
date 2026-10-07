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

@Entity("reviews")
@Index("uq_reviews_user_project", ["userId", "projectId"], { unique: true })
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "user_id", type: "int", nullable: false })
  userId!: number;

  @Column({ name: "project_id", type: "int", nullable: false })
  projectId!: number;

  @Column({ type: "int", nullable: false })
  rating!: number;

  @Column({ type: "text", nullable: true })
  comment!: string | null;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "now()",
    nullable: false,
  })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.reviews, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Project, (project) => project.reviews, { nullable: false })
  @JoinColumn({ name: "project_id" })
  project!: Project;
}
