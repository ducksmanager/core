-- Medal view columns inherited utf8mb4_general_ci from string literals, causing
-- "Illegal mix of collations" when compared to utf8mb4_unicode_ci columns/parameters.
DROP VIEW IF EXISTS `user_medals`;
DROP VIEW IF EXISTS `user_medals_game`;

CREATE VIEW `user_medals_game` AS
SELECT 'gold' COLLATE utf8mb4_unicode_ci AS medalType,
    g.id AS gameId,
    p.id AS playerId,
    100 AS playerPoints
FROM `game` g
    CROSS JOIN `player` p
WHERE 1 = 0;

CREATE VIEW `user_medals` AS
SELECT 'gold' COLLATE utf8mb4_unicode_ci AS medalType,
    p.id AS playerId,
    0 AS playerPoints
FROM `player` p
WHERE 1 = 0;
