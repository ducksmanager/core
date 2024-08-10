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
  getText: () => string;
  getLabel: () => string;
  getLabelContextMenu: () => string;
  themeColor: "success" | "light" | "warning" | "danger" | "medium";
};
export default () => {
  const { t: $t } = useI18n();
  const conditions: Condition<boolean>[] = [
    {
      dbValue: null,
      dbEnValue: null,
      color: "black",
      getText: () => $t("Non possédé"),
      getLabel: () => $t("Non possédé"),
      getLabelContextMenu: () => $t("Marquer comme non possédé(s)"),
      themeColor: "light",
    },
    {
      dbValue: issue_condition.indefini,
      dbEnValue: "none",
      color: "#808080",
      getText: () => $t("Indéfini"),
      getLabel: () => $t("En état indéfini"),
      getLabelContextMenu: () => $t("Marquer comme possédé(s)"),
      themeColor: "medium",
    },
    {
      dbValue: issue_condition.mauvais,
      dbEnValue: "bad",
      color: "red",
      getText: () => $t("Mauvais"),
      getLabel: () => $t("En mauvais état"),
      getLabelContextMenu: () => $t("Marquer comme en mauvais état"),
      themeColor: "danger",
    },
    {
      dbValue: issue_condition.moyen,
      dbEnValue: "notsogood",
      color: "orange",
      getText: () => $t("Moyen"),
      getLabel: () => $t("En état moyen"),
      getLabelContextMenu: () => $t("Marquer comme en état moyen"),
      themeColor: "warning",
    },
    {
      dbValue: issue_condition.bon,
      dbEnValue: "good",
      color: "#2CA77B",
      getText: () => $t("Bon"),
      getLabel: () => $t("En bon état"),
      getLabelContextMenu: () => $t("Marquer comme en bon état"),
      themeColor: "success",
    },
  ];
  return {
    issue_condition,
    conditions,

    conditionsWithoutMissing: computed(
      () => conditions.filter(({ dbValue }) => dbValue) as Condition<false>[],
    ),
    getConditionLabel: (givenDbValue: string) =>
      conditions
        .find(
          ({ dbValue }) =>
            givenDbValue.toUpperCase() === dbValue?.toUpperCase(),
        )
        ?.getLabel() ||
      conditions.find(({ dbValue }) => dbValue === null)!.getLabel(),
  };
};
