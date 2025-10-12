SELECT
  'gold' AS `medalType`,
  `g`.`id` AS `gameId`,
  `p`.`id` AS `playerId`,
  100 AS `playerPoints`
FROM
  (
    `duckguessr`.`game` `g`
    JOIN `duckguessr`.`player` `p`
  )
WHERE
  1 = 0