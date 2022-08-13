import { runQuery } from "../rawsql";

export const getUsersQuickStats = async (userIds: number[]) => {
  const userQuickStats = await runQuery(
    `
      select u.ID                                        AS userId,
             u.username,
             u.TextePresentation                         as presentationSentence,
             u.AccepterPartage                           as shared,
             count(distinct Pays)                        AS numberOfCountries,
             count(distinct concat(Pays, '/', Magazine)) as numberOfPublications,
             count(Numero)                               as numberOfIssues
      from dm.users u
               left join dm.numeros on numeros.ID_Utilisateur = u.ID
      where u.ID IN (:userIds)
      group by u.ID`,
    { userIds }
  );

  return userQuickStats.map((result: { [key: string]: any }) => ({
    ...result,
    userId: parseInt(result["userId"]),
    numberOfCountries: parseInt(result["numberOfCountries"]),
    numberOfPublications: parseInt(result["numberOfPublications"]),
    numberOfIssues: parseInt(result["numberOfIssues"]),
  }));
};

export const getUsersPoints = async (userIds: number[]) => {
  const userPoints = await runQuery(
    `
                select type_contribution.contribution,
                       ids_users.ID_User,
                       ifnull(contributions_utilisateur.points_total, 0) as points_total
                from (select 'Photographe' as contribution
                      union
                      select 'Createur' as contribution
                      union
                      select 'Duckhunter' as contribution) as type_contribution
                         join (SELECT ID AS ID_User
                               FROM dm.users
                               WHERE ID IN (:userIds)) AS ids_users
                         left join (SELECT uc.ID_User, uc.contribution, sum(points_new) as points_total
                                    FROM dm.users_contributions uc
                                    GROUP BY uc.ID_User, uc.contribution) as contributions_utilisateur
                                   ON type_contribution.contribution = contributions_utilisateur.contribution
                                       AND ids_users.ID_User = contributions_utilisateur.ID_user`,
    { userIds }
  );
  return userPoints.map((result: { [key: string]: any }) => ({
    ...result,
    points_total: parseInt(result["points_total"]),
    ID_User: parseInt(result["ID_User"]),
  }));
};
