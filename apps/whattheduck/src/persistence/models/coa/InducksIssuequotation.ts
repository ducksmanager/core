import { Entity, Column, PrimaryColumn } from 'typeorm';
import type { inducks_issuequotation } from '~prisma-clients/client_coa';

@Entity('inducks_issuequotation')
export class InducksIssuequotation {
  @PrimaryColumn('text', { nullable: false })
  publicationcode!: inducks_issuequotation['publicationcode'];

  @PrimaryColumn('text', { nullable: false })
  issuenumber!: inducks_issuequotation['issuenumber'];

  @Column('real', { nullable: true })
  estimationmin!: inducks_issuequotation['estimationMin'];

  @Column('real', { nullable: true })
  estimationmax!: inducks_issuequotation['estimationMax'];
}
