import { condition } from '~/stores/condition';

export default (): { getConditionKey: (itemCondition: string) => string } => {
  const conditionStore = condition();
  const conditionL10n = computed(() => conditionStore.conditionL10n);
  const getConditionKey = (itemCondition: string) =>
    conditionL10n.value.find(({ fr }) => fr === itemCondition)?.en || 'none';
  return { getConditionKey };
};
