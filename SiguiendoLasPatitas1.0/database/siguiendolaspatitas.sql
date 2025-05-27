CREATE DATABASE  IF NOT EXISTS `energycars` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `energycars`;


DROP TABLE IF EXISTS `anio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anio` (
  `ID_ANIO` int NOT NULL AUTO_INCREMENT,
  `ANIO` int NOT NULL,
  PRIMARY KEY (`ID_ANIO`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estaciones_carga`
--

DROP TABLE IF EXISTS `estaciones_carga`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estaciones_carga` (
  `ID_ESTC` int NOT NULL AUTO_INCREMENT,
  `ESTC_NOMBRE` varchar(50) NOT NULL,
  `ESTC_DIRECCION` varchar(80) NOT NULL,
  `ESTC_LOCALIDAD` varchar(80) NOT NULL,
  `ID_PROVINCIA` int NOT NULL,
  `ESTC_CANT_SURTIDORES` tinyint NOT NULL,
  `ESTC_LATITUD` decimal(11,8) DEFAULT NULL,
  `ESTC_LONGITUD` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`ID_ESTC`),
  KEY `ID_PROVINCIA` (`ID_PROVINCIA`),
  CONSTRAINT `estaciones_carga_ibfk_1` FOREIGN KEY (`ID_PROVINCIA`) REFERENCES `provincias` (`ID_PROVINCIA`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estado_reservas`
--

DROP TABLE IF EXISTS `estado_reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_reservas` (
  `ID_EST_RES` int NOT NULL AUTO_INCREMENT,
  `EST_RES_DESCRIP` varchar(10) NOT NULL,
  PRIMARY KEY (`ID_EST_RES`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `marca_modelo`
--

DROP TABLE IF EXISTS `marca_modelo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca_modelo` (
  `ID_MARCA_MODELO` int NOT NULL AUTO_INCREMENT,
  `ID_MARCA` int NOT NULL,
  `ID_MODELO` int NOT NULL,
  `ID_TC` int NOT NULL,
  PRIMARY KEY (`ID_MARCA_MODELO`),
  KEY `ID_MARCA` (`ID_MARCA`),
  KEY `ID_MODELO` (`ID_MODELO`),
  KEY `ID_TC` (`ID_TC`),
  CONSTRAINT `marca_modelo_ibfk_1` FOREIGN KEY (`ID_MARCA`) REFERENCES `marcas` (`ID_MARCA`),
  CONSTRAINT `marca_modelo_ibfk_2` FOREIGN KEY (`ID_MODELO`) REFERENCES `modelos` (`ID_MODELO`),
  CONSTRAINT `marca_modelo_ibfk_3` FOREIGN KEY (`ID_TC`) REFERENCES `tipos_conectores` (`ID_TC`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas` (
  `ID_MARCA` int NOT NULL AUTO_INCREMENT,
  `MARC_NOMBRE` varchar(30) NOT NULL,
  PRIMARY KEY (`ID_MARCA`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medida`
--

DROP TABLE IF EXISTS `medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medida` (
  `ID_MEDIDA` int NOT NULL AUTO_INCREMENT,
  `MEDIDA_DESCRIPCION` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID_MEDIDA`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modelos`
--

DROP TABLE IF EXISTS `modelos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelos` (
  `ID_MODELO` int NOT NULL AUTO_INCREMENT,
  `MOD_NOMBRE` varchar(30) NOT NULL,
  PRIMARY KEY (`ID_MODELO`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `precios`
--

DROP TABLE IF EXISTS `precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `precios` (
  `ID_PRECIO` int NOT NULL AUTO_INCREMENT,
  `PRECIO_DESCRIP` varchar(20) NOT NULL,
  `PRECIO_TIEMPO` decimal(10,0) NOT NULL,
  `PRECIO_KW` decimal(10,0) NOT NULL,
  `ID_TIEMPO_CARGA` int NOT NULL,
  `ID_ESTC` int NOT NULL,
  PRIMARY KEY (`ID_PRECIO`),
  KEY `ID_TIEMPO_CARGA` (`ID_TIEMPO_CARGA`),
  KEY `ID_ESTC` (`ID_ESTC`),
  CONSTRAINT `precios_ibfk_1` FOREIGN KEY (`ID_TIEMPO_CARGA`) REFERENCES `tiempo_carga` (`ID_TIEMPO_CARGA`),
  CONSTRAINT `precios_ibfk_2` FOREIGN KEY (`ID_ESTC`) REFERENCES `estaciones_carga` (`ID_ESTC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `provincias`
--

DROP TABLE IF EXISTS `provincias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provincias` (
  `ID_PROVINCIA` int NOT NULL AUTO_INCREMENT,
  `PROVINCIA_NOMBRE` varchar(50) NOT NULL,
  `PROVINCIA_DESCRIP` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID_PROVINCIA`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `ID_RESERVA` int NOT NULL AUTO_INCREMENT,
  `RESERVA_FECHA` varchar(10) NOT NULL,
  `RESERVA_HORA_INI` varchar(5) NOT NULL,
  `RESERVA_HORA_FIN` varchar(5) NOT NULL,
  `RESERVA_IMPORTE` varchar(10) NOT NULL,
  `ID_USER` int NOT NULL,
  `ID_EST_RES` int NOT NULL,
  `ID_SURTIDOR` int NOT NULL,
  PRIMARY KEY (`ID_RESERVA`),
  KEY `ID_USER` (`ID_USER`),
  KEY `ID_EST_RES` (`ID_EST_RES`),
  KEY `ID_SURTIDOR` (`ID_SURTIDOR`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`ID_USER`) REFERENCES `usuario` (`ID_USER`),
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`ID_EST_RES`) REFERENCES `estado_reservas` (`ID_EST_RES`),
  CONSTRAINT `reservas_ibfk_3` FOREIGN KEY (`ID_SURTIDOR`) REFERENCES `surtidores` (`ID_SURTIDOR`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
-- Table structure for table `surtidores`
--

DROP TABLE IF EXISTS `surtidores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surtidores` (
  `ID_SURTIDOR` int NOT NULL AUTO_INCREMENT,
  `SURT_ESTADO` tinyint(1) NOT NULL,
  `ID_ESTC` int NOT NULL,
  PRIMARY KEY (`ID_SURTIDOR`),
  KEY `ID_TC` (`SURT_ESTADO`),
  KEY `ID_ESTC` (`ID_ESTC`),
  CONSTRAINT `surtidores_ibfk_2` FOREIGN KEY (`ID_ESTC`) REFERENCES `estaciones_carga` (`ID_ESTC`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tiempo_carga`
--

DROP TABLE IF EXISTS `tiempo_carga`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiempo_carga` (
  `ID_TIEMPO_CARGA` int NOT NULL AUTO_INCREMENT,
  `TIEMPO_CARGA` int NOT NULL,
  `ID_MEDIDA` int NOT NULL,
  PRIMARY KEY (`ID_TIEMPO_CARGA`),
  KEY `ID_MEDIDA` (`ID_MEDIDA`),
  CONSTRAINT `tiempo_carga_ibfk_1` FOREIGN KEY (`ID_MEDIDA`) REFERENCES `medida` (`ID_MEDIDA`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipos_conectores`
--

DROP TABLE IF EXISTS `tipos_conectores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_conectores` (
  `ID_TC` int NOT NULL AUTO_INCREMENT,
  `TC_NOMBRE` varchar(50) NOT NULL,
  `TC_DESCRIP` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID_TC`)
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
  `USER_CONTRASENIA` varchar(255) DEFAULT NULL,
  `USER_TELEFONO` varchar(25) NOT NULL,
  `USER_FECHA_REGISTRO` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_USER`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculos` (
  `ID_VEHICULO` int NOT NULL AUTO_INCREMENT,
  `ID_MARCA_MODELO` int NOT NULL,
  `ID_ANIO` int NOT NULL,
  `VEH_PATENTE` varchar(10) NOT NULL,
  `ID_USER` int NOT NULL,
  PRIMARY KEY (`ID_VEHICULO`),
  KEY `ID_ANIO` (`ID_ANIO`),
  KEY `ID_MARCA_MODELO` (`ID_MARCA_MODELO`),
  KEY `ID_USER` (`ID_USER`),
  CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`ID_ANIO`) REFERENCES `anio` (`ID_ANIO`),
  CONSTRAINT `vehiculos_ibfk_2` FOREIGN KEY (`ID_MARCA_MODELO`) REFERENCES `marca_modelo` (`ID_MARCA_MODELO`),
  CONSTRAINT `vehiculos_ibfk_3` FOREIGN KEY (`ID_USER`) REFERENCES `usuario` (`ID_USER`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-26 22:46:44
