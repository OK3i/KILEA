import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_versions')
export class ProjectVersion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'project_id', type: 'int', nullable: false })
  projectId!: number;

  @Column({ type: 'varchar', nullable: false })
  version!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'download_url', type: 'varchar', nullable: true })
  downloadUrl!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'now()',
    nullable: false,
  })
  createdAt!: Date;

  @ManyToOne(() => Project, (project) => project.versions, { nullable: false })
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}