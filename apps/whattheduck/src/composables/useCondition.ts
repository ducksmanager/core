import { computed } from 'vue';

import { condition } from '~/stores/condition';

export default () => {
  const conditionStore = condition();
  const conditionL10n = computed(() => conditionStore.conditionL10n);
  const getConditionKey = (itemCondition: string) =>
    conditionL10n.value.find(({ fr }) => fr === itemCondition)?.en || 'none';
  return { getConditionKey };
};
