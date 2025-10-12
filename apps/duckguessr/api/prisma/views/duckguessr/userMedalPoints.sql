SELECT
  'gold' AS `medalType`,
  `p`.`id` AS `playerId`,
  0 AS `playerPoints`
FROM
  `duckguessr`.`player` `p`
WHERE
  1 = 0