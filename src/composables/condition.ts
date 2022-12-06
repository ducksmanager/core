import { useI18n } from "vue-i18n";

export default function () {
  const { t: $t } = useI18n();
  const conditions = [
    {
      value: "missing",
      dbValue: "non_possede",
      color: "black",
      text: $t("Non possédé"),
    },
    {
      value: "possessed",
      dbValue: "indefini",
      color: "#808080",
      text: $t("Indéfini"),
      label: $t("En état indéfini"),
    },
    {
      value: "bad",
      dbValue: "mauvais",
      color: "red",
      text: $t("Mauvais"),
      label: $t("En mauvais état"),
    },
    {
      value: "notsogood",
      dbValue: "moyen",
      color: "orange",
      text: $t("Moyen"),
      label: $t("En moyen état"),
    },
    {
      value: "good",
      dbValue: "bon",
      color: "#2CA77B",
      text: $t("Bon"),
      label: $t("En bon état"),
    },
  ];
  return {
    conditions,
    getConditionLabel: (givenDbValue: string) =>
      conditions.find(
        ({ dbValue }) => givenDbValue.toUpperCase() === dbValue.toUpperCase()
      )?.label || "",
  };
}
