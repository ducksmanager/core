export default {
  computed: {
    conditions() {
      return [{
        value: "missing",
        dbValue: "non_possede",
        color: "black",
        text: this.$t('Non possédé')
      }, {
        value: "possessed",
        dbValue: "indefini",
        color: "#808080",
        text: this.$t('Indéfini'),
        label: this.$t("En état indéfini")
      }, {
        value: "bad",
        dbValue: "mauvais",
        color: "red",
        text: this.$t('Mauvais'),
        label: this.$t("En mauvais état")
      }, {
        value: "notsogood",
        dbValue: "moyen",
        color: "orange",
        text: this.$t('Moyen'),
        label: this.$t("En moyen état")
      }, {
        value: "good",
        dbValue: "bon",
        color: "#2CA77B",
        text: this.$t('Bon'),
        label: this.$t("En bon état")
      }];
    }
  },

  methods: {
    getConditionLabel(givenDbValue) {
      const condition = this.conditions.find(({dbValue}) => givenDbValue.toUpperCase() === dbValue.toUpperCase())
      return condition ? condition.label : ''
    }
  }
};
