import { useI18n } from "vue-i18n";

const issue_condition = {
  mauvais: "mauvais",
  moyen: "moyen",
  bon: "bon",
  indefini: "indefini",
};

type issue_condition = typeof issue_condition[keyof typeof issue_condition];

export default function () {
  const { t: $t } = useI18n();
  type Condition = {
    value: string;
    dbValue: issue_condition | null;
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
      dbValue: "indefini",
      color: "#808080",
      text: $t("Indéfini"),
      label: $t("En état indéfini"),
      labelContextMenu: $t("Marquer comme possédé(s)"),
    },
    {
      value: "bad",
      dbValue: "mauvais",
      color: "red",
      text: $t("Mauvais"),
      label: $t("En mauvais état"),
      labelContextMenu: $t("Marquer comme en mauvais état"),
    },
    {
      value: "notsogood",
      dbValue: "moyen",
      color: "orange",
      text: $t("Moyen"),
      label: $t("En moyen état"),
      labelContextMenu: $t("Marquer comme en état moyen"),
    },
    {
      value: "good",
      dbValue: "bon",
      color: "#2CA77B",
      text: $t("Bon"),
      label: $t("En bon état"),
      labelContextMenu: $t("Marquer comme en bon état"),
    },
  ];
  return {
    conditions,
    getConditionLabel: (givenDbValue: string) =>
      conditions.find(
        ({ dbValue }) => givenDbValue.toUpperCase() === dbValue?.toUpperCase()
      )?.label || conditions.find(({ dbValue }) => dbValue === null)!.label,
  };
}
