import fs = require('fs')
import db = require('./db')

const tables = [
    'auteurs_histoires',
    'histoires_publications',
    'utilisateurs_histoires_manquantes',
    'utilisateurs_publications_manquantes',
    'utilisateurs_publications_suggerees'
]

const dbName = process.env.MYSQL_DM_STATS_DATABASE


db.connect().then(async () => {
    await db.runQuery(`DROP DATABASE IF EXISTS ${dbName}_new`)
    await db.runQuery(`CREATE DATABASE ${dbName}_new`)

    for (const dbName2 of [dbName, `${dbName}_new`]) {
        await db.runQuery(`USE ${dbName2}; ${fs.readFileSync('sql/ddl/create-stats-tables.sql').toString()}`)
    }

    await db.runQuery(fs.readFileSync('sql/create-stories-publications.sql').toString())
    await db.runQuery(fs.readFileSync('sql/create-authors-stories.sql').toString())
    await db.runQuery(fs.readFileSync('sql/create-users-missing-stories.sql').toString())
    await db.runQuery(fs.readFileSync('sql/create-users-missing-issues.sql').toString())
    await db.runQuery(fs.readFileSync('sql/create-users-suggested-issues.sql').toString())

    await db.runQuery(`DROP DATABASE IF EXISTS ${dbName}_old`)
    await db.runQuery(`CREATE DATABASE ${dbName}_old`)

    for (const table of tables) {
        await db.runQuery(`RENAME TABLE
        ${dbName}.${table} TO ${dbName}_old.${table},
        ${dbName}_new.${table} TO ${dbName}.${table}`
        )
    }

    await db.disconnect()
})
