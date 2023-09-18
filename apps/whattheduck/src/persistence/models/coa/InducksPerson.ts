import { Entity, Column, PrimaryColumn } from 'typeorm';
import type { inducks_person } from '~prisma-clients/client_coa';

@Entity('inducks_person')
export class InducksPerson {
  @PrimaryColumn('text')
  personcode!: inducks_person['personcode'];

  @Column('text', { nullable: false })
  fullname!: inducks_person['fullname'];
}
