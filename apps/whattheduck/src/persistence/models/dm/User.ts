import type { user } from 'ducksmanager/api/dist/prisma/client_dm';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryColumn('text', { unique: true, nullable: false })
  username!: user['username'];

  @Column('text')
  token!: string;
}
