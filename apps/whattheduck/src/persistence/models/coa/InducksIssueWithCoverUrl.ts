import { Entity, Column, PrimaryColumn } from 'typeorm';
import type { inducks_issue } from '~prisma-clients/client_coa';

@Entity('inducks_issue')
export class InducksIssueWithCoverUrl {
  @PrimaryColumn('text')
  publicationcode!: inducks_issue['publicationcode'];

  @Column('text', { nullable: false })
  issuenumber!: inducks_issue['issuenumber'];

  @Column('text', { nullable: true })
  title!: inducks_issue['title'];

  @Column('text', { nullable: true })
  coverUrl!: string;
}
