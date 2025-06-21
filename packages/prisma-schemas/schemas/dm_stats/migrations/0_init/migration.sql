-- CreateTable
CREATE TABLE `auteurs_histoires` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `personcode` VARCHAR(79) NOT NULL,
    `storycode` VARCHAR(19) NOT NULL,

    INDEX `index_storycode`(`storycode`),
    UNIQUE INDEX `unique_index`(`personcode`, `storycode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auteurs_pseudos` (
    `NomAuteurAbrege` VARCHAR(79) NOT NULL,
    `ID_user` INTEGER NOT NULL,
    `Notation` INTEGER NOT NULL DEFAULT -1,

    INDEX `auteurs_pseudos_ID_user_index`(`ID_user`),
    UNIQUE INDEX `auteurs_pseudos_uindex`(`ID_user`, `NomAuteurAbrege`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `numeros_simple` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_Utilisateur` INTEGER NOT NULL,
    `issuecode` VARCHAR(25) NULL DEFAULT (concat(convert(`Pays` using utf8mb3),'/',convert(`Magazine` using utf8mb3),' ',`Numero`)),

    INDEX `Utilisateur`(`ID_Utilisateur`),
    INDEX `issuecode`(`issuecode`),
    INDEX `issuecode_user`(`issuecode`, `ID_Utilisateur`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `histoires_publications` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `storycode` VARCHAR(19) NOT NULL,
    `publicationcode` VARCHAR(12) NULL,
    `issuenumber` VARCHAR(12) NULL,
    `issuecode` VARCHAR(25) NOT NULL,
    `oldestdate` VARCHAR(10) NULL,

    INDEX `index_issue`(`issuecode`),
    INDEX `index_oldestdate`(`oldestdate`),
    INDEX `index_story`(`storycode`),
    UNIQUE INDEX `unique_index`(`issuecode`, `storycode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs_histoires_manquantes` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_User` INTEGER NOT NULL,
    `personcode` VARCHAR(79) NOT NULL,
    `storycode` VARCHAR(19) NOT NULL,

    UNIQUE INDEX `missing_issue_for_user`(`ID_User`, `personcode`, `storycode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs_publications_manquantes` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_User` INTEGER NOT NULL,
    `personcode` VARCHAR(79) NOT NULL,
    `storycode` VARCHAR(19) NOT NULL,
    `publicationcode` VARCHAR(12) NULL,
    `issuenumber` VARCHAR(12) NULL,
    `issuecode` VARCHAR(25) NOT NULL,
    `oldestdate` VARCHAR(10) NULL,
    `Notation` TINYINT UNSIGNED NOT NULL,

    INDEX `missing_user_issue`(`ID_User`, `publicationcode`, `issuenumber`),
    INDEX `suggested`(`ID_User`, `publicationcode`, `issuenumber`, `oldestdate`),
    INDEX `user_stories`(`ID_User`, `personcode`, `storycode`),
    INDEX `missing_user_issue_issuecode`(`ID_User`, `issuecode`),
    INDEX `suggested_issuecode`(`ID_User`, `issuecode`, `oldestdate`),
    UNIQUE INDEX `unique_index`(`ID_User`, `personcode`, `storycode`, `publicationcode`, `issuenumber`),
    UNIQUE INDEX `unique_index_issuecode`(`ID_User`, `personcode`, `storycode`, `issuecode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs_publications_suggerees` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_User` INTEGER NOT NULL,
    `publicationcode` VARCHAR(12) NULL,
    `issuenumber` VARCHAR(12) NULL,
    `issuecode` VARCHAR(25) NOT NULL,
    `oldestdate` VARCHAR(10) NULL,
    `Score` INTEGER NOT NULL,

    INDEX `suggested_issue_user`(`ID_User`),
    UNIQUE INDEX `suggested_issue_for_user`(`ID_User`, `publicationcode`, `issuenumber`),
    UNIQUE INDEX `suggested_issue_for_user_issuecode`(`ID_User`, `issuecode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

