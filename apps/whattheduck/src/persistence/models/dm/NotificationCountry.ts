import type { userOption } from 'ducksmanager/api/dist/prisma/client_dm';
import { Entity, PrimaryColumn } from 'typeorm';

@Entity('notification_country')
export class NotificationCountry {
  @PrimaryColumn('text')
  country!: userOption['optionValue'];
}
