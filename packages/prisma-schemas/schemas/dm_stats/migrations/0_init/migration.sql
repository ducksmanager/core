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
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NomAuteurAbrege` VARCHAR(79) NOT NULL,
    `ID_User` INTEGER NOT NULL,
    `Notation` TINYINT UNSIGNED NULL,

    INDEX `auteurs_pseudos_ID_user_index`(`ID_User`),
    UNIQUE INDEX `auteurs_pseudos_uindex`(`ID_User`, `NomAuteurAbrege`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `numeros_simple` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_Utilisateur` INTEGER NOT NULL,
    `issuecode` VARCHAR(25) NOT NULL,

    INDEX `ID_Utilisateur`(`ID_Utilisateur`),
    INDEX `user_issue`(`issuecode`),
    UNIQUE INDEX `unique_index`(`ID_Utilisateur`, `issuecode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `histoires_publications` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `storycode` VARCHAR(19) NOT NULL,
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
    `issuecode` VARCHAR(25) NOT NULL,
    `oldestdate` VARCHAR(10) NULL,
    `Notation` TINYINT UNSIGNED NULL,

    INDEX `missing_user_issue`(`ID_User`, `issuecode`),
    INDEX `suggested`(`ID_User`, `issuecode`, `oldestdate`),
    INDEX `user_stories`(`ID_User`, `personcode`, `storycode`),
    UNIQUE INDEX `unique_index`(`ID_User`, `personcode`, `storycode`, `issuecode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs_publications_suggerees` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_User` INTEGER NOT NULL,
    `issuecode` VARCHAR(25) NOT NULL,
    `oldestdate` VARCHAR(10) NULL,
    `Score` INTEGER NOT NULL,

    INDEX `suggested_issue_user`(`ID_User`),
    UNIQUE INDEX `suggested_issue_for_user`(`ID_User`, `issuecode`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

