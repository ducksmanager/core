import { Entity, Column, PrimaryColumn } from 'typeorm';
import type { inducks_story, inducks_storyjob } from '~prisma-clients/client_coa';

@Entity('inducks_story')
export class InducksStory {
  @PrimaryColumn('text')
  storycode!: inducks_story['storycode'];

  @Column('text', { nullable: true })
  title!: inducks_story['title'];

  @Column('text', { nullable: false })
  personcodes!: Set<inducks_storyjob['personcode']>;

  @Column('text', { nullable: true })
  storyComment!: inducks_story['storycomment'];
}
