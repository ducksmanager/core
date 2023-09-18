import { Entity, Column, PrimaryColumn } from 'typeorm';
import type { inducks_publication } from '~prisma-clients/client_coa';

@Entity('inducks_publication')
export class InducksPublication {
  @PrimaryColumn('text')
  publiationcode!: inducks_publication['publicationcode'];

  @Column('text', { nullable: true })
  title!: inducks_publication['title'];
}
