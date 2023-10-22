import { condition } from '~/stores/condition';

const conditionL10n = computed(() => condition().conditionL10n);
export const getConditionText = (itemCondition: string): string =>
  conditionL10n.value.find(({ fr }) => fr === itemCondition)?.en || 'none';

type Condition = {
  dbValue: string;
  color: string;
  text: string;
};
export const conditions = computed((): Condition[] => [
  {
    dbValue: 'missing',
    color: 'black',
    text: 'Non possédé',
  },
  ...[
    {
      dbValue: 'indefini',
      color: '#808080',
    },
    {
      dbValue: 'mauvais',
      color: 'red',
    },
    {
      dbValue: 'moyen',
      color: 'orange',
    },
    {
      dbValue: 'bon',
      color: '#2CA77B',
    },
  ].map((condition) => ({ ...condition, text: getConditionText(condition.dbValue) })),
]);

export const conditionsWithoutMissing = computed(() => conditions.value.filter(({ dbValue }) => dbValue !== 'missing'));
