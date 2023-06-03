import type { authorUser } from 'ducksmanager/api/dist/prisma/client_dm';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('authorUser')
export class AuthorUser {
  @PrimaryColumn('text', { nullable: false })
  personcode!: authorUser['personcode'];

  @Column('integer', { nullable: false })
  notation!: authorUser['notation'];
}
