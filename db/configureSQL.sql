CREATE DATABASE `news_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE TABLE `authors` (
  `author_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `password` varchar(20) NOT NULL,
  PRIMARY KEY (`author_id`)
);

CREATE TABLE `index_homepage` (
  `idx` int NOT NULL AUTO_INCREMENT,
  `index_id` varchar(10) NOT NULL,
  `news_id` varchar(10) NOT NULL,
  PRIMARY KEY (`idx`)
);

CREATE TABLE `news` (
  `news_id` int NOT NULL AUTO_INCREMENT,
  `url_path` varchar(60) NOT NULL,
  `card_size` varchar(20) NOT NULL,
  `card_placement` varchar(20) DEFAULT NULL,
  `title` mediumtext NOT NULL,
  `subtitle` text,
  `text` mediumtext NOT NULL,
  `date` date NOT NULL,
  `locality` varchar(45) NOT NULL,
  `author_id` varchar(45) NOT NULL,
  PRIMARY KEY (`news_id`)
);

CREATE TABLE `pictures` (
  `picture_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) DEFAULT NULL,
  `path` varchar(300) NOT NULL,
  `news_id` int NOT NULL,
  PRIMARY KEY (`picture_id`)
);
