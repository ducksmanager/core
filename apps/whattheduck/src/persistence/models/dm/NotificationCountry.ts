import { Entity, PrimaryColumn } from 'typeorm';
import type { userOption } from '~prisma-clients/client_dm';

@Entity('notificationCountry')
export class NotificationCountry {
  @PrimaryColumn('text')
  country!: userOption['optionValue'];
}
