-- CreateView
CREATE VIEW `game_scores` AS
SELECT g.id AS game_id,
    p.id AS player_id,
    COALESCE(SUM(rs.score), 0) AS game_score
FROM `game` g
    CROSS JOIN `player` p
    LEFT JOIN `game_player` gp ON gp.game_id = g.id
    AND gp.player_id = p.id
    LEFT JOIN `round` r ON r.game_id = g.id
    LEFT JOIN `round_score` rs ON rs.round_id = r.id
    AND rs.player_id = p.id
GROUP BY g.id,
    p.id;
-- CreateView
CREATE VIEW `user_medals_game` AS
SELECT 'gold' AS medalType,
    g.id AS gameId,
    p.id AS playerId,
    100 AS playerPoints
FROM `game` g
    CROSS JOIN `player` p
WHERE 1 = 0;
-- CreateView
CREATE VIEW `user_medals` AS
SELECT 'gold' AS medalType,
    p.id AS playerId,
    0 AS playerPoints
FROM `player` p
WHERE 1 = 0;