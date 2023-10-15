import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('http_cache')
export class HttpCache {
  @PrimaryColumn('text')
  key!: string;

  @Column('text')
  data!: string;
}
