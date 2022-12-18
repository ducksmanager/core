import { useI18n } from "vue-i18n";

enum issue_condition {
  mauvais,
  moyen,
  bon,
  indefini,
}

export default function () {
  const { t: $t } = useI18n();
  type Condition = {
    value: string;
    dbValue: typeof issue_condition[keyof typeof issue_condition] | null;
    color: string;
    text: string;
    label: string;
    labelContextMenu: string;
  };
  const conditions: Condition[] = [
    {
      value: "missing",
      dbValue: null,
      color: "black",
      text: $t("Non possédé"),
      label: $t("Non possédé"),
      labelContextMenu: $t("Marquer comme non possédé"),
    },
    {
      value: "possessed",
      dbValue: issue_condition.indefini,
      color: "#808080",
      text: $t("Indéfini"),
      label: $t("En état indéfini"),
      labelContextMenu: $t("Marquer comme possédé(s)"),
    },
    {
      value: "bad",
      dbValue: issue_condition.mauvais,
      color: "red",
      text: $t("Mauvais"),
      label: $t("En mauvais état"),
      labelContextMenu: $t("Marquer comme en mauvais état"),
    },
    {
      value: "notsogood",
      dbValue: issue_condition.moyen,
      color: "orange",
      text: $t("Moyen"),
      label: $t("En moyen état"),
      labelContextMenu: $t("Marquer comme en état moyen"),
    },
    {
      value: "good",
      dbValue: issue_condition.bon,
      color: "#2CA77B",
      text: $t("Bon"),
      label: $t("En bon état"),
      labelContextMenu: $t("Marquer comme en bon état"),
    },
  ];
  return {
    issue_condition,
    conditions,
    getConditionLabel: (givenDbValue: string) =>
      conditions.find(
        ({ dbValue }) =>
          givenDbValue.toUpperCase() === dbValue?.toString().toUpperCase()
      )?.label || conditions.find(({ dbValue }) => dbValue === null)!.label,
  };
}
