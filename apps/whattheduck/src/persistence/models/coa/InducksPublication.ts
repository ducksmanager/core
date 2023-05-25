import type { inducks_person, inducks_publication } from 'ducksmanager/api/dist/prisma/client_coa';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('inducks_publication')
export class InducksPublication {
  @PrimaryColumn('text')
  publiationcode!: inducks_publication['publicationcode'];

  @Column('text', { nullable: true })
  title!: inducks_publication['title'];
}
