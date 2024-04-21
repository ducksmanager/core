// import { issue_condition } from "~prisma-clients/client_dm";
const issue_condition = {
  mauvais: "mauvais",
  moyen: "moyen",
  bon: "bon",
  indefini: "indefini",
} as const;

export type Condition<WithMissing extends boolean = true> = {
  dbValue:
    | keyof typeof issue_condition
    | (WithMissing extends true ? null : never);
  dbEnValue: "none" | "bad" | "notsogood" | "good" | null;
  color: string;
  text: string;
  label: string;
  labelContextMenu: string;
  themeColor: "success" | "light" | "warning" | "danger" | "medium";
};
export default () => {
  const { t: $t, messages } = useI18n();
  console.log(messages.value);
  const conditions: Condition<boolean>[] = [
    {
      dbValue: null,
      dbEnValue: null,
      color: "black",
      text: $t("Non possédé"),
      label: $t("Non possédé"),
      labelContextMenu: $t("Marquer comme non possédé(s)"),
      themeColor: "light",
    },
    {
      dbValue: issue_condition.indefini,
      dbEnValue: "none",
      color: "#808080",
      text: $t("Indéfini"),
      label: $t("En état indéfini"),
      labelContextMenu: $t("Marquer comme possédé(s)"),
      themeColor: "medium",
    },
    {
      dbValue: issue_condition.mauvais,
      dbEnValue: "bad",
      color: "red",
      text: $t("Mauvais"),
      label: $t("En mauvais état"),
      labelContextMenu: $t("Marquer comme en mauvais état"),
      themeColor: "danger",
    },
    {
      dbValue: issue_condition.moyen,
      dbEnValue: "notsogood",
      color: "orange",
      text: $t("Moyen"),
      label: $t("En état moyen"),
      labelContextMenu: $t("Marquer comme en état moyen"),
      themeColor: "warning",
    },
    {
      dbValue: issue_condition.bon,
      dbEnValue: "good",
      color: "#2CA77B",
      text: $t("Bon"),
      label: $t("En bon état"),
      labelContextMenu: $t("Marquer comme en bon état"),
      themeColor: "success",
    },
  ];
  return {
    issue_condition,
    conditions,

    conditionsWithoutMissing: computed(
      () => conditions.filter(({ dbValue }) => dbValue) as Condition<false>[]
    ),
    getConditionLabel: (givenDbValue: string) =>
      conditions.find(
        ({ dbValue }) => givenDbValue.toUpperCase() === dbValue?.toUpperCase()
      )?.label || conditions.find(({ dbValue }) => dbValue === null)!.label,
  };
};
