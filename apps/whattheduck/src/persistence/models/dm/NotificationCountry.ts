import type { userOption } from 'ducksmanager/api/dist/prisma/client_dm';
import { Entity, PrimaryColumn } from 'typeorm';

@Entity('notificationCountry')
export class NotificationCountry {
  @PrimaryColumn('text')
  country!: userOption['optionValue'];
}
