export default {
  data: () => ({
    conditions: [{
      value: 'missing',
      dbValue: 'non_possede',
      color: 'black',
      l10nKey: 'NON_POSSEDE'
    }, {
      value: 'possessed',
      dbValue: 'indefini',
      color: '#808080',
      l10nKey: 'INDEFINI'
    }, {
      value: 'bad',
      dbValue: 'mauvais',
      color: 'red',
      l10nKey: 'MAUVAIS'
    }, {
      value: 'notsogood',
      dbValue: 'moyen',
      color: 'orange',
      l10nKey: 'MOYEN'
    }, {
      value: 'good',
      dbValue: 'bon',
      color: '#2CA77B',
      l10nKey: 'BON'
    }]
  })
}