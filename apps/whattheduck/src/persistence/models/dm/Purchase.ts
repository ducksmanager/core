import type { purchase } from 'ducksmanager/api/dist/prisma/client_dm';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('purchase')
export class Purchase {
  @PrimaryColumn('integer')
  id!: purchase['id'];

  @Column('date', { nullable: false })
  date!: purchase['date'];

  @Column('text', { nullable: false })
  description!: purchase['description'];
}
