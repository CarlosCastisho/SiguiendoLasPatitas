-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: siguiendolaspatitas
-- ------------------------------------------------------
-- Server version	8.0.39
-- Table structure for table `adopciones`
--

DROP TABLE IF EXISTS `adopciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adopciones` (
  `ID_ADOPCIONES` int NOT NULL AUTO_INCREMENT,
  `ADOPCION_FECHA` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ID_USER` int NOT NULL,
  `ID_EST_ADOP` int NOT NULL,
  `ID_ADOPTS` int NOT NULL,
  PRIMARY KEY (`ID_ADOPCIONES`),
  KEY `ID_USER` (`ID_USER`),
  KEY `ID_EST_ADOP` (`ID_EST_ADOP`),
  KEY `ID_ADOPTS` (`ID_ADOPTS`),
  CONSTRAINT `adopciones_ibfk_1` FOREIGN KEY (`ID_USER`) REFERENCES `usuario` (`ID_USER`),
  CONSTRAINT `adopciones_ibfk_2` FOREIGN KEY (`ID_EST_ADOP`) REFERENCES `est_adop` (`ID_EST_ADOP`),
  CONSTRAINT `adopciones_ibfk_3` FOREIGN KEY (`ID_ADOPTS`) REFERENCES `adopts` (`ID_ADOPTS`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adopts`
--

DROP TABLE IF EXISTS `adopts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adopts` (
  `ID_ADOPTS` int NOT NULL AUTO_INCREMENT,
  `ADOPTS_NOMBRE` varchar(50) NOT NULL,
  `ADOPTS_DIRECCION` varchar(80) NOT NULL,
  `ADOPTS_LOCALIDAD` varchar(80) NOT NULL,
  PRIMARY KEY (`ID_ADOPTS`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `est_adop`
--

DROP TABLE IF EXISTS `est_adop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `est_adop` (
  `ID_EST_ADOP` int NOT NULL AUTO_INCREMENT,
  `EST_ADOP_DESCRIP` varchar(20) NOT NULL,
  PRIMARY KEY (`ID_EST_ADOP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mascotas`
--

DROP TABLE IF EXISTS `mascotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mascotas` (
  `ID_MASCOTAS` int NOT NULL AUTO_INCREMENT,
  `ID_TIPO_RAZA` int NOT NULL,
  `MASCOTAS_NOMBRE` varchar(20) NOT NULL,
  `MASCOTAS_FNAC` varchar(10) NOT NULL,
  `ID_USER` int NOT NULL,
  PRIMARY KEY (`ID_MASCOTAS`),
  KEY `ID_USER` (`ID_USER`),
  KEY `ID_TIPO_RAZA` (`ID_TIPO_RAZA`),
  CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`ID_TIPO_RAZA`) REFERENCES `tipo_raza` (`ID_TIPO_RAZA`),
  CONSTRAINT `mascotas_ibfk_3` FOREIGN KEY (`ID_USER`) REFERENCES `usuario` (`ID_USER`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `raza`
--

DROP TABLE IF EXISTS `raza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raza` (
  `ID_RAZA` int NOT NULL AUTO_INCREMENT,
  `RAZA_NOMBRE` varchar(30) NOT NULL,
  PRIMARY KEY (`ID_RAZA`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sexo`
--

DROP TABLE IF EXISTS `sexo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sexo` (
  `ID_SEXO` int NOT NULL AUTO_INCREMENT,
  `SEXO_NOMBRE` varchar(50) NOT NULL,
  `SEXO_DESCRIP` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID_SEXO`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo`
--

DROP TABLE IF EXISTS `tipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo` (
  `ID_TIPO` int NOT NULL AUTO_INCREMENT,
  `TIPO_NOMBRE` varchar(45) NOT NULL,
  PRIMARY KEY (`ID_TIPO`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_raza`
--

DROP TABLE IF EXISTS `tipo_raza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_raza` (
  `ID_TIPO_RAZA` int NOT NULL AUTO_INCREMENT,
  `ID_TIPO` int NOT NULL,
  `ID_SEXO` int NOT NULL,
  `ID_RAZA` int NOT NULL,
  PRIMARY KEY (`ID_TIPO_RAZA`),
  KEY `ID_RAZA` (`ID_RAZA`),
  KEY `ID_SEXO` (`ID_SEXO`),
  KEY `tipo_raza_ibfk_3_idx` (`ID_TIPO`),
  CONSTRAINT `tipo_raza_ibfk_1` FOREIGN KEY (`ID_RAZA`) REFERENCES `raza` (`ID_RAZA`),
  CONSTRAINT `tipo_raza_ibfk_2` FOREIGN KEY (`ID_SEXO`) REFERENCES `sexo` (`ID_SEXO`),
  CONSTRAINT `tipo_raza_ibfk_3` FOREIGN KEY (`ID_TIPO`) REFERENCES `tipo` (`ID_TIPO`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `ID_USER` int NOT NULL AUTO_INCREMENT,
  `USER_NOMBRE` varchar(50) NOT NULL,
  `USER_APELLIDO` varchar(50) NOT NULL,
  `USER_CORREO` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `USER_CONTRASENIA` varchar(300) NOT NULL,
  `USER_TELEFONO` varchar(25) NOT NULL,
  `USER_FECHA_REGISTRO` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_USER`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

