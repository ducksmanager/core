const mariadb = require('mariadb')

for (const envKey of ['MYSQL_COA_HOST', 'MYSQL_COA_PORT', 'MYSQL_COA_DATABASE', 'MYSQL_PASSWORD']) {
  if (!process.env[envKey]) {
    console.error(`Environment variable not found, aborting: ${envKey}`)
    process.exit(1)
  }
}

let coaConnection
const cachedCoaIssues = {}

const coaPool = mariadb.createPool({
  host: process.env.MYSQL_COA_HOST,
  port: process.env.MYSQL_COA_PORT,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_COA_DATABASE
})

module.exports = {
  createQuotation: async (publicationcode, issuenumber, estimationMin, estimationMax, scrapeDate) => {
    console.log(`Adding ${publicationcode} ${issuenumber}`)
    return await coaConnection.query(
      'INSERT INTO inducks_issuequotation(publicationcode, issuenumber, estimationmin, estimationmax, scrapedate) VALUES(?,?,?,?,?)',
      [
        publicationcode,
        issuenumber,
        estimationMin,
        estimationMax,
        scrapeDate
      ]
    );
  },

  truncateQuotations: async () =>
    await coaConnection.query('TRUNCATE inducks_issuequotation'),

  isInducksIssueExisting: async (publicationcode, issuenumber) => {
    cachedCoaIssues[publicationcode] = cachedCoaIssues[publicationcode] ||
      (await coaConnection.query(
        'SELECT issuenumber FROM inducks_issue WHERE publicationcode=?',
        [publicationcode]
      )).map(({issuenumber}) => issuenumber)
    if (!cachedCoaIssues[publicationcode].length) {
      console.warn(` No issue found in COA for publication code ${publicationcode}`)
      return false
    } else if (!cachedCoaIssues[publicationcode].find(dbIssuenumber => dbIssuenumber === issuenumber)) {
      console.warn(` No issue found in COA for publication code ${publicationcode} and issue number ${issuenumber}`)
      return false
    }
    return true
  },

  async connect() {
    return coaPool.getConnection()
      .then(async connection => {
        coaConnection = connection
        await coaConnection.query(`
            CREATE TABLE IF NOT EXISTS inducks_issuequotation
            (
                ID              int                                 NOT NULL AUTO_INCREMENT,
                publicationcode varchar(15) COLLATE utf8_unicode_ci NOT NULL,
                issuenumber     varchar(12) COLLATE utf8_unicode_ci NOT NULL,
                estimationmin   float    DEFAULT NULL,
                estimationmax   float    DEFAULT NULL,
                scrapedate      datetime DEFAULT NULL,
                issuecode       varchar(28) GENERATED ALWAYS AS (concat(publicationcode, ' ', issuenumber)) VIRTUAL,
                PRIMARY KEY (ID),
                UNIQUE KEY inducks_issuequotation__uindex_issuecode (issuecode),
                KEY inducks_issuequotation__index_publication (publicationcode)
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8
              COLLATE = utf8_unicode_ci
        `)
      }).catch(err => {
        console.error(err)
      })
  },

  async disconnect() {
    await coaConnection.end()
    return coaPool.end()
  }
}

