import { useI18n } from "vue-i18n";

enum issue_condition {
  mauvais = "mauvais",
  moyen = "moyen",
  bon = "bon",
  indefini = "indefini",
}

export default function () {
  const { t: $t } = useI18n();
  interface Condition {
    value: issue_condition | null;
    dbValue: string | null;
    color: string;
    text: string;
    label: string;
    labelContextMenu: string;
  }
  const conditions: Condition[] = [
    {
      value: null,
      dbValue: null,
      color: "black",
      text: $t("Non possédé"),
      label: $t("Non possédé"),
      labelContextMenu: $t("Marquer comme non possédé(s)"),
    },
    {
      value: issue_condition.indefini,
      dbValue: issue_condition.indefini.toString(),
      color: "#808080",
      text: $t("Indéfini"),
      label: $t("En état indéfini"),
      labelContextMenu: $t("Marquer comme possédé(s)"),
    },
    {
      value: issue_condition.mauvais,
      dbValue: issue_condition.mauvais.toString(),
      color: "red",
      text: $t("Mauvais"),
      label: $t("En mauvais état"),
      labelContextMenu: $t("Marquer comme en mauvais état"),
    },
    {
      value: issue_condition.moyen,
      dbValue: issue_condition.moyen.toString(),
      color: "orange",
      text: $t("Moyen"),
      label: $t("En moyen état"),
      labelContextMenu: $t("Marquer comme en état moyen"),
    },
    {
      value: issue_condition.bon,
      dbValue: issue_condition.bon.toString(),
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
        ({ dbValue }) => givenDbValue.toUpperCase() === dbValue?.toUpperCase(),
      )?.label ?? conditions.find(({ dbValue }) => dbValue === null)!.label,
  };
}
