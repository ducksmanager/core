import { Entity, Column, PrimaryColumn } from 'typeorm';
import type { issue } from '~prisma-clients/client_dm';

export type issueWithPublicationcode = issue & {
  publicationcode: string;
};
@Entity('issue')
export class Issue {
  @PrimaryColumn('integer')
  id!: issueWithPublicationcode['id'];

  @Column('text', { nullable: false })
  country!: issueWithPublicationcode['country'];

  @Column('text', { nullable: false })
  magazine!: issueWithPublicationcode['magazine'];

  @Column('text', { nullable: true })
  publicationcode!: issueWithPublicationcode['publicationcode'];

  @Column('text', { nullable: false })
  issuenumber!: issueWithPublicationcode['issuenumber'];

  @Column('text', { nullable: false })
  condition!: issueWithPublicationcode['condition'];

  @Column('integer', { nullable: false })
  isToRead!: issueWithPublicationcode['isToRead'];

  @Column('date', { nullable: true })
  creationDate!: issueWithPublicationcode['creationDate'];

  @Column('integer', { nullable: true })
  purchaseId!: issueWithPublicationcode['purchaseId'];
}
