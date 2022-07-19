import mariadb = require('mariadb')
import * as dotenv from 'dotenv'

dotenv.config()

for (const envKey of ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_COA_DATABASE', 'MYSQL_DM_DATABASE', 'MYSQL_DM_STATS_DATABASE', 'MYSQL_PASSWORD']) {
    if (!process.env[envKey]) {
        console.error(`Environment variable not found, aborting: ${envKey}`)
        process.exit(1)
    }
}

let connection: mariadb.PoolConnection

const pool = mariadb.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT as string),
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true
})

export const connect = async () => {
    try {
        connection = await pool.getConnection()
    } catch (err: unknown) {
        console.error(err)
    }
}

export const disconnect = async () => {
    if (connection) {
        await connection.end()
    }
    return pool.end()
}

export const runQuery = async (sql: string) => {
    console.debug(sql)
    await connection.query(sql)
}
