import { Entity, PrimaryColumn, Column } from 'typeorm';
import type { purchase } from '~prisma-clients/client_dm';

@Entity('purchase')
export class Purchase {
  @PrimaryColumn('integer')
  id!: purchase['id'];

  @Column('date', { nullable: false })
  date!: purchase['date'];

  @Column('text', { nullable: false })
  description!: purchase['description'];
}
