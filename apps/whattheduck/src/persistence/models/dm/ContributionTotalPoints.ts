import type { userContribution, userContributionType } from 'ducksmanager/api/dist/prisma/client_dm';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('contribution_total_points')
export class ContributionTotalPoints {
  @PrimaryColumn('text', { unique: true, nullable: false })
  contribution!: userContributionType;

  @Column('integer', { nullable: false })
  totalPoints!: userContribution['totalPoints'];
}
