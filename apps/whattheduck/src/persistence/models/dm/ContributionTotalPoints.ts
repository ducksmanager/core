import { Entity, Column, PrimaryColumn } from 'typeorm';
import { userContributionType } from '~prisma-clients/client_dm';
import type { userContribution } from '~prisma-clients/client_dm';

@Entity('contribution_total_points')
export class ContributionTotalPoints {
  @PrimaryColumn('text', { unique: true, nullable: false })
  contribution!: userContributionType;

  @Column('integer', { nullable: false })
  totalPoints!: userContribution['totalPoints'];
}
