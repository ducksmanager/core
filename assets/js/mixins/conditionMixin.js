export default {
  data: () => ({
    conditions: [{
      value: 'possessed',
      dbValue: '',
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