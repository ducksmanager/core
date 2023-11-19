SELECT
  `duckguessr`.`dataset`.`name` AS `medalType`,
  `duckguessr`.`game_player`.`player_id` AS `playerId`,
  sum(`duckguessr`.`round_score`.`score`) AS `playerPoints`
FROM
  (
    (
      (
        (
          `duckguessr`.`dataset`
          JOIN `duckguessr`.`game` ON(
            `duckguessr`.`dataset`.`id` = `duckguessr`.`game`.`dataset_id`
          )
        )
        JOIN `duckguessr`.`game_player` ON(
          `duckguessr`.`game`.`id` = `duckguessr`.`game_player`.`game_id`
        )
      )
      JOIN `duckguessr`.`round` ON(
        `duckguessr`.`game`.`id` = `duckguessr`.`round`.`game_id`
      )
    )
    JOIN `duckguessr`.`round_score` ON(
      `duckguessr`.`round`.`id` = `duckguessr`.`round_score`.`round_id`
    )
  )
GROUP BY
  `duckguessr`.`dataset`.`name`,
  `duckguessr`.`game_player`.`player_id`