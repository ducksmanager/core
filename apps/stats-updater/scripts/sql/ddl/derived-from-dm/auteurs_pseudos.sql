create table auteurs_pseudos
(
  ID_User int not null,
  NomAuteurAbrege varchar(79) not null,
  Notation tinyint null,
  constraint auteurs_pseudos_pk
    primary key (ID_User, NomAuteurAbrege)
);
