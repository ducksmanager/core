import type { inducks_person } from 'ducksmanager/api/dist/prisma/client_coa';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('inducks_person')
export class InducksPerson {
  @PrimaryColumn('text')
  personcode!: inducks_person['personcode'];

  @Column('text', { nullable: false })
  fullname!: inducks_person['fullname'];
}
