import { computed } from 'vue';
import { IssueWithPublicationcode } from '~/stores/collection';

import { condition } from '~/stores/condition';

export default () => {
  const conditionStore = condition();
  const conditionL10n = computed(() => conditionStore.conditionL10n);
  const getConditionKey = (item: IssueWithPublicationcode) =>
    conditionL10n.value.find(({ fr }) => fr === item.condition)?.en || 'none';
  return { getConditionKey };
};
