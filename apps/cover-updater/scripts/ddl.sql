CREATE DATABASE IF NOT EXISTS `cover_info` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `cover_info`;

CREATE TABLE IF NOT EXISTS `covers` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `issuecode` varchar(17) NOT NULL,
  `sitecode` varchar(11) NOT NULL,
  `url` varchar(87) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uniquefieldset` (`issuecode`,`sitecode`,`url`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `cover_imports` (
  `coverid` int(11) NOT NULL,
  `imported` datetime DEFAULT NULL,
  `import_error` varchar(200) DEFAULT NULL,
  UNIQUE KEY `uniquefieldset` (`coverid`,`imported`,`import_error`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;