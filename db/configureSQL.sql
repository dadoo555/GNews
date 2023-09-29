CREATE DATABASE `news_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE news_db;
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


-- fake news and users to test it
USE news_db;
INSERT INTO `news_db`.`authors` (`name`, `last_name`, `password`) VALUES ('Eduardo', '', 'admin');
INSERT INTO `news_db`.`authors` (`name`, `last_name`, `password`) VALUES ('Renan', '', 'admin');
INSERT INTO `news_db`.`authors` (`name`, `last_name`, `password`) VALUES ('Maria', '', 'admin');

INSERT INTO `news_db`.`index_homepage` (`index_id`, `news_id`) VALUES ('1', '1');
INSERT INTO `news_db`.`index_homepage` (`index_id`, `news_id`) VALUES ('2', '2');
INSERT INTO `news_db`.`index_homepage` (`index_id`, `news_id`) VALUES ('3', '3');

INSERT INTO `news_db`.`news` (`url_path`, `card_size`, `card_placement`, `title`, `subtitle`, `text`, `date`, `locality`, `author_id`) VALUES ('missao-lunar-russia', 'big', '', 'Missao lunar da russia fracassou', 'Subtitulo da missao lunar', 'Texto da missao lunar Texto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunarTexto da missao lunar', '2023-09-29', 'Rio de Janeiro', '1');
INSERT INTO `news_db`.`news` (`url_path`, `card_size`, `card_placement`, `title`, `subtitle`, `text`, `date`, `locality`, `author_id`) VALUES ('pinguins-sofrem', 'normal', '', 'Pinguins estao sofrendo com aquecimento dos oceanos', 'Na Antartida, pinguins estao cada dia com menos alimento', 'Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins Texto pinguins', '2023-09-25', 'Brasil', '2');
INSERT INTO `news_db`.`news` (`url_path`, `card_size`, `card_placement`, `title`, `subtitle`, `text`, `date`, `locality`, `author_id`) VALUES ('dinheiro-drogas', 'big', '', 'Dinheiro de drogas apreendido', 'Policia achou o dinheiro apos operacao de busca', 'texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas texto drogas ', '2023-09-20', 'Salvador', '3');

INSERT INTO `news_db`.`pictures` (`description`, `path`, `news_id`) VALUES ('Nave russa', '1024.jpg', '1');
INSERT INTO `news_db`.`pictures` (`description`, `path`, `news_id`) VALUES ('Pinguins Foto', 'ap23235711173825.webp', '2');
INSERT INTO `news_db`.`pictures` (`description`, `path`, `news_id`) VALUES ('Foto mostra dinheiro', 'noticia1.webp', '3');
