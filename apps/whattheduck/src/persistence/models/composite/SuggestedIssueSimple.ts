import type { suggestedIssueForUser } from 'ducksmanager/api/dist/prisma/client_dm_stats';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('suggestedIssue')
export class SuggestedIssueSimple {
  @PrimaryColumn('text', { nullable: false })
  publicationcode!: suggestedIssueForUser['publicationcode'];

  @PrimaryColumn('text', { nullable: false })
  issuenumber!: suggestedIssueForUser['issuenumber'];

  @Column('integer', { nullable: false })
  score!: suggestedIssueForUser['score'];

  @Column('text', { nullable: true })
  oldestdate!: string;

  @Column('text', { nullable: false })
  storiesList!: string;
}
