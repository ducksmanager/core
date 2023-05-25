import type { inducks_countryname } from 'ducksmanager/api/dist/prisma/client_coa';
import { Entity, Column, PrimaryColumn } from 'typeorm';
import 'reflect-metadata';

@Entity('inducks_countryname')
export class InducksCountryname {
  @PrimaryColumn('text')
  countrycode!: inducks_countryname['countrycode'];

  @Column('text', { nullable: false })
  countryname!: inducks_countryname['countryname'];
}
