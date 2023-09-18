import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { authorUser } from '~prisma-clients/client_dm';

@Entity('authorUser')
export class AuthorUser {
  @PrimaryColumn('text', { nullable: false })
  personcode!: authorUser['personcode'];

  @Column('integer', { nullable: false })
  notation!: authorUser['notation'];
}
