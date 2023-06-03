import type { issuePopularity } from 'ducksmanager/api/dist/prisma/client_dm';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('issuePopularity')
export class IssuePopularity {
  @PrimaryColumn('text', { nullable: false })
  country!: issuePopularity['country'];

  @PrimaryColumn('text', { nullable: false })
  magazine!: issuePopularity['magazine'];

  @PrimaryColumn('text', { nullable: false })
  issuenumber!: issuePopularity['issuenumber'];

  @Column('integer', { nullable: true })
  popularity!: issuePopularity['popularity'];
}
