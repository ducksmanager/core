SELECT
  `duckguessr`.`game_player`.`game_id` AS `game_id`,
  `duckguessr`.`game_player`.`player_id` AS `player_id`,
  IFNULL(
    (
      SELECT
        sum(
          `duckguessr`.`round_score`.`score` + `duckguessr`.`round_score`.`speed_bonus`
        )
      FROM
        `duckguessr`.`round_score`
      WHERE
        `duckguessr`.`round_score`.`player_id` = `duckguessr`.`game_player`.`player_id`
        AND `duckguessr`.`round_score`.`round_id` IN (
          SELECT
            `duckguessr`.`round`.`id`
          FROM
            `duckguessr`.`round`
          WHERE
            `duckguessr`.`round`.`game_id` = `duckguessr`.`game_player`.`game_id`
        )
    ),
    0
  ) AS `game_score`
FROM
  `duckguessr`.`game_player`
GROUP BY
  `duckguessr`.`game_player`.`game_id`,
  `duckguessr`.`game_player`.`player_id`