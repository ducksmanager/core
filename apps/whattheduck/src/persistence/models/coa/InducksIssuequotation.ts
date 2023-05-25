import type { inducks_issuequotation } from 'ducksmanager/api/dist/prisma/client_coa';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('inducks_issuequotation')
export class InducksIssuequotation {
  @PrimaryColumn('text', { nullable: false })
  publicationcode!: inducks_issuequotation['publicationcode'];

  @PrimaryColumn('text', { nullable: false })
  issuenumber!: inducks_issuequotation['issuenumber'];

  @Column('real', { nullable: true })
  estimationmin!: inducks_issuequotation['estimationmin'];

  @Column('real', { nullable: true })
  estimationmax!: inducks_issuequotation['estimationmax'];
}
