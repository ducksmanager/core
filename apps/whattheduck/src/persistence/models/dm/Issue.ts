import type { issue } from 'ducksmanager/api/dist/prisma/client_dm';
import { Entity, Column, PrimaryColumn, VirtualColumn } from 'typeorm';

@Entity('issue')
export class Issue {
  @PrimaryColumn('integer')
  id!: issue['id'];

  @Column('text', { nullable: false })
  country!: issue['country'];

  @Column('text', { nullable: false })
  magazine!: issue['magazine'];

  @Column('text', { nullable: true })
  publicationcode!: issue['publicationcode'];

  @Column('text', { nullable: false })
  issuenumber!: issue['issuenumber'];

  @Column('text', { nullable: false })
  condition!: issue['condition'];

  @Column('integer', { nullable: false })
  isToRead!: issue['isToRead'];

  @Column('date', { nullable: true })
  creationDate!: issue['creationDate'];

  @Column('integer', { nullable: true })
  purchaseId!: issue['purchaseId'];
}
