import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('sync')
export class Sync {
  @PrimaryColumn('datetime')
  timestamp!: Date;

  @Column('text', { nullable: true })
  appVersion: string | null = null;
}
