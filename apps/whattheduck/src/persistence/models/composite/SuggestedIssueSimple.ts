import type { utilisateurs_publications_suggerees } from 'ducksmanager/api/dist/prisma/client_dm_stats';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('suggestedIssue')
export class SuggestedIssueSimple {
  @PrimaryColumn('text', { nullable: false })
  publicationcode!: utilisateurs_publications_suggerees['publicationcode'];

  @PrimaryColumn('text', { nullable: false })
  issuenumber!: utilisateurs_publications_suggerees['issuenumber'];

  @Column('integer', { nullable: false })
  score!: utilisateurs_publications_suggerees['score'];

  @Column('string', { nullable: true })
  oldestdate!: string;

  @Column('string', { nullable: false })
  storiesList!: string;
}
