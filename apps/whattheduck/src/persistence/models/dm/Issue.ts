import { Entity, Column, PrimaryColumn } from 'typeorm';
import type { issue } from '~prisma-clients/client_dm';

export type IssueWithPublicationcode = issue & {
  publicationcode: string;
};
@Entity('issue')
export class Issue {
  @PrimaryColumn('integer')
  id!: IssueWithPublicationcode['id'];

  @Column('text', { nullable: false })
  country!: IssueWithPublicationcode['country'];

  @Column('text', { nullable: false })
  magazine!: IssueWithPublicationcode['magazine'];

  @Column('text', { nullable: true })
  publicationcode!: IssueWithPublicationcode['publicationcode'];

  @Column('text', { nullable: false })
  issuenumber!: IssueWithPublicationcode['issuenumber'];

  @Column('text', { nullable: false })
  condition!: IssueWithPublicationcode['condition'];

  @Column('integer', { nullable: false })
  isToRead!: IssueWithPublicationcode['isToRead'];

  @Column('date', { nullable: true })
  creationDate!: IssueWithPublicationcode['creationDate'];

  @Column('integer', { nullable: true })
  purchaseId!: IssueWithPublicationcode['purchaseId'];
}
