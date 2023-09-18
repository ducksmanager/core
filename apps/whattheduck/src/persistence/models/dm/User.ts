import { Entity, PrimaryColumn, Column } from 'typeorm';
import type { user } from '~prisma-clients/client_dm';

@Entity('user')
export class User {
  @PrimaryColumn('text', { unique: true, nullable: false })
  username!: user['username'];

  @Column('text')
  token!: string;
}
