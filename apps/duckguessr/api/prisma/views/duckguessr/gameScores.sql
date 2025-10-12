SELECT
  `g`.`id` AS `game_id`,
  `p`.`id` AS `player_id`,
  coalesce(sum(`rs`.`score`), 0) AS `game_score`
FROM
  (
    (
      (
        (
          `duckguessr`.`game` `g`
          JOIN `duckguessr`.`player` `p`
        )
        LEFT JOIN `duckguessr`.`game_player` `gp` ON(
          `gp`.`game_id` = `g`.`id`
          AND `gp`.`player_id` = `p`.`id`
        )
      )
      LEFT JOIN `duckguessr`.`round` `r` ON(`r`.`game_id` = `g`.`id`)
    )
    LEFT JOIN `duckguessr`.`round_score` `rs` ON(
      `rs`.`round_id` = `r`.`id`
      AND `rs`.`player_id` = `p`.`id`
    )
  )
GROUP BY
  `g`.`id`,
  `p`.`id`