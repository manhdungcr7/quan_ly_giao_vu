-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: quan_ly_giao_vu
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int unsigned DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=330 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 12:41:13'),(2,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 12:47:16'),(3,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 13:00:14'),(4,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 13:12:58'),(5,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 13:23:52'),(6,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 13:28:26'),(7,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 13:29:03'),(8,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 13:37:14'),(9,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 13:49:27'),(10,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 14:31:28'),(11,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 14:55:25'),(12,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 14:56:19'),(13,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 14:59:17'),(14,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 15:46:52'),(15,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 16:01:34'),(16,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 16:22:47'),(17,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 16:23:28'),(18,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 16:46:05'),(19,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-09-30 17:01:35'),(20,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 02:05:53'),(21,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 02:57:54'),(22,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 03:30:19'),(23,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 04:02:56'),(24,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 04:35:00'),(25,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 05:06:01'),(26,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 08:17:13'),(27,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 08:31:55'),(28,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 08:57:11'),(29,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 09:08:30'),(30,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 13:08:44'),(31,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 13:21:01'),(32,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 13:45:50'),(33,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 13:47:02'),(34,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 13:56:46'),(35,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 14:09:20'),(36,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 14:10:34'),(37,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 14:19:07'),(38,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 14:22:25'),(39,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 14:43:15'),(40,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 14:49:17'),(41,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:15:23'),(42,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:20:36'),(43,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:23:59'),(44,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:24:27'),(45,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:26:38'),(46,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:29:39'),(47,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:40:16'),(48,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:43:44'),(49,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:46:20'),(50,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:48:01'),(51,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:49:49'),(52,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 15:56:33'),(53,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 16:04:06'),(54,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-01 16:09:13'),(55,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 01:37:05'),(56,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 03:52:12'),(57,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 04:01:16'),(58,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 04:21:14'),(59,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 04:23:05'),(60,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 06:35:32'),(61,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 06:47:47'),(62,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 06:55:36'),(63,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 06:58:15'),(64,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 06:59:57'),(65,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 07:20:22'),(66,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 07:50:23'),(67,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 07:53:15'),(68,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 08:01:05'),(69,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 12:56:50'),(70,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 13:06:03'),(71,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 13:15:00'),(72,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 13:27:30'),(73,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 13:37:11'),(74,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 13:40:09'),(75,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 14:05:49'),(76,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 14:08:28'),(77,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 14:14:07'),(78,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 14:23:42'),(79,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 15:19:41'),(80,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-02 15:28:44'),(81,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 01:46:42'),(82,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 06:34:19'),(83,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 06:59:28'),(84,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 07:54:45'),(85,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 08:07:20'),(86,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 08:18:25'),(87,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 08:29:30'),(88,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 08:40:17'),(89,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 13:56:00'),(90,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 14:11:59'),(91,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 14:18:35'),(92,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 14:18:57'),(93,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 14:23:13'),(94,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 14:28:56'),(95,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 14:50:25'),(96,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 14:53:12'),(97,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 15:15:44'),(98,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 16:01:51'),(99,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 16:09:40'),(100,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 16:16:30'),(101,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 16:25:16'),(102,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 16:38:21'),(103,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 16:45:01'),(104,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 17:29:07'),(105,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 17:43:16'),(106,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 17:51:20'),(107,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-03 23:35:06'),(108,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 00:02:26'),(109,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 00:14:38'),(110,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 00:24:04'),(111,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 02:17:26'),(112,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 02:24:41'),(113,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 02:25:29'),(114,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 04:12:26'),(115,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 04:28:51'),(116,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 04:36:55'),(117,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 04:46:27'),(118,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 04:50:45'),(119,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 05:15:42'),(120,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 06:23:04'),(121,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 06:23:07'),(122,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 06:24:09'),(123,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 10:56:30'),(124,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 11:14:38'),(125,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 11:23:56'),(126,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 11:25:42'),(127,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 11:30:10'),(128,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 12:32:34'),(129,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 12:50:49'),(130,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 13:03:50'),(131,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 13:31:31'),(132,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 13:43:47'),(133,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 13:56:58'),(134,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 13:57:33'),(135,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 14:09:20'),(136,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 14:23:32'),(137,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 14:45:25'),(138,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 14:45:53'),(139,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 15:04:24'),(140,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 15:17:02'),(141,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 15:23:36'),(142,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 15:35:19'),(143,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 16:34:57'),(144,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 23:08:46'),(145,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 23:30:17'),(146,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-04 23:58:45'),(147,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 00:02:10'),(148,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 00:04:10'),(149,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 00:54:01'),(150,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:27:10'),(151,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:35:59'),(152,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:36:24'),(153,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:38:38'),(154,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:45:21'),(155,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:47:48'),(156,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:55:15'),(157,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 02:57:24'),(158,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 03:02:50'),(159,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 03:17:47'),(160,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 03:18:08'),(161,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 03:32:20'),(162,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 03:33:31'),(163,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 03:46:20'),(164,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 04:14:12'),(165,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 04:16:50'),(166,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 04:23:35'),(167,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 05:19:46'),(168,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 05:20:27'),(169,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 06:14:39'),(170,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 06:39:57'),(171,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 06:56:56'),(172,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 07:06:52'),(173,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 07:07:10'),(174,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 07:16:22'),(175,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 07:24:35'),(176,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 07:48:56'),(177,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 07:52:51'),(178,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 08:11:51'),(179,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 08:14:11'),(180,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 08:41:45'),(181,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 08:43:52'),(182,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 08:56:12'),(183,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 09:06:59'),(184,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 09:25:21'),(185,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 09:27:45'),(186,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 09:38:19'),(187,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 09:42:01'),(188,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 09:44:02'),(189,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 11:40:31'),(190,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:27:00'),(191,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:31:34'),(192,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:40:51'),(193,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:41:13'),(194,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:43:44'),(195,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:45:29'),(196,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:52:03'),(197,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 12:53:28'),(198,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 13:25:44'),(199,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 13:26:10'),(200,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 13:35:41'),(201,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 13:50:02'),(202,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 13:55:23'),(203,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 13:59:03'),(204,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 14:06:18'),(205,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 14:10:30'),(206,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 14:19:14'),(207,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 14:39:05'),(208,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 14:58:46'),(209,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:12:03'),(210,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:30:20'),(211,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:32:16'),(212,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:35:26'),(213,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:36:19'),(214,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:46:21'),(215,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:48:57'),(216,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 15:53:15'),(217,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 16:02:30'),(218,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-05 16:17:07'),(219,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 05:05:48'),(220,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 06:58:15'),(221,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 07:22:26'),(222,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 07:41:07'),(223,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 08:04:09'),(224,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 08:09:24'),(225,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 08:15:26'),(226,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 08:27:12'),(227,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 08:35:17'),(228,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 09:06:21'),(229,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 14:05:45'),(230,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 14:29:20'),(231,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 14:32:41'),(232,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 14:51:29'),(233,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 15:12:03'),(234,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 15:14:30'),(235,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 15:15:32'),(236,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-06 15:32:06'),(237,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 03:56:23'),(238,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 03:57:07'),(239,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 04:48:51'),(240,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 12:05:31'),(241,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 12:29:16'),(242,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 12:34:38'),(243,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 12:48:48'),(244,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 12:50:52'),(245,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 12:55:36'),(246,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 13:08:02'),(247,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 13:30:33'),(248,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 14:17:37'),(249,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 14:24:51'),(250,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 14:27:58'),(251,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 14:43:48'),(252,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-07 15:02:52'),(253,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 04:34:44'),(254,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 04:55:35'),(255,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 04:56:04'),(256,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 04:57:14'),(257,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 05:19:35'),(258,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 05:20:50'),(259,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 05:37:09'),(260,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 05:37:44'),(261,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 05:43:27'),(262,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 08:38:12'),(263,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 09:57:33'),(264,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 10:12:12'),(265,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 10:54:46'),(266,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 11:11:11'),(267,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:00:14'),(268,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:05:50'),(269,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:27:07'),(270,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:35:57'),(271,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:36:38'),(272,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:46:20'),(273,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:47:25'),(274,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 12:56:21'),(275,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:02:54'),(276,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:35:42'),(277,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:36:20'),(278,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:36:48'),(279,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:39:22'),(280,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:39:49'),(281,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:47:26'),(282,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 13:49:04'),(283,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 14:09:36'),(284,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 14:14:25'),(285,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 14:28:29'),(286,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 14:31:04'),(287,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 15:18:30'),(288,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 15:29:40'),(289,NULL,'STATUS_CHANGE','documents',10,'{\"status\": \"pending\"}','{\"status\": \"completed\"}',NULL,NULL,'2025-10-08 15:29:46'),(290,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:01:43'),(291,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:17:06'),(292,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:18:15'),(293,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:21:55'),(294,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:50:24'),(295,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:50:26'),(296,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:50:38'),(297,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:50:39'),(298,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:50:41'),(299,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:50:54'),(300,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:51:07'),(301,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:51:09'),(302,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:51:43'),(303,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:51:44'),(304,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:51:45'),(305,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:51:46'),(306,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:51:47'),(307,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:53:42'),(308,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 16:55:45'),(309,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 17:03:26'),(310,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 17:04:28'),(311,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 17:12:06'),(312,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 17:14:50'),(313,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 17:25:14'),(314,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-08 17:37:52'),(315,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 01:12:34'),(316,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 01:31:58'),(317,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:07:12'),(318,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:09:58'),(319,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:12:24'),(320,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:13:01'),(321,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:14:03'),(322,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:21:24'),(323,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:44:59'),(324,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:46:08'),(325,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:46:53'),(326,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 02:47:22'),(327,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 03:26:25'),(328,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 03:39:24'),(329,1,'UPDATE','users',1,'{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}','{\"email\": \"admin@khoa-anninh.edu.vn\", \"username\": \"admin\", \"full_name\": \"Quản trị viên\"}',NULL,NULL,'2025-10-09 04:51:53');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_categories`
--

DROP TABLE IF EXISTS `asset_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_categories` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `depreciation_rate` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_categories`
--

LOCK TABLES `asset_categories` WRITE;
/*!40000 ALTER TABLE `asset_categories` DISABLE KEYS */;
INSERT INTO `asset_categories` VALUES (1,'Máy tính','MT',NULL,20.00,1,'2025-09-30 11:42:10'),(2,'Thiết bị văn phòng','TBVP',NULL,15.00,1,'2025-09-30 11:42:10'),(3,'Nội thất','NT',NULL,10.00,1,'2025-09-30 11:42:10'),(4,'Thiết bị giảng dạy','TBGD',NULL,12.00,1,'2025-09-30 11:42:10');
/*!40000 ALTER TABLE `asset_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_maintenance`
--

DROP TABLE IF EXISTS `asset_maintenance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_maintenance` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `asset_id` int unsigned NOT NULL,
  `maintenance_date` date NOT NULL,
  `type` enum('routine','repair','upgrade','inspection') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost` decimal(10,2) DEFAULT '0.00',
  `performed_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_asset` (`asset_id`),
  KEY `idx_date` (`maintenance_date`),
  KEY `idx_type` (`type`),
  CONSTRAINT `asset_maintenance_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_maintenance_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_maintenance`
--

LOCK TABLES `asset_maintenance` WRITE;
/*!40000 ALTER TABLE `asset_maintenance` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_maintenance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `asset_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` mediumint unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `serial_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_price` decimal(12,2) DEFAULT '0.00',
  `current_value` decimal(12,2) DEFAULT '0.00',
  `warranty_expiry` date DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to` int unsigned DEFAULT NULL,
  `status` enum('available','in_use','maintenance','retired','disposed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `condition_rating` enum('excellent','good','fair','poor','broken') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'good',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_code` (`asset_code`),
  KEY `created_by` (`created_by`),
  KEY `idx_code` (`asset_code`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_serial` (`serial_number`),
  FULLTEXT KEY `idx_search` (`name`,`description`,`brand`,`model`),
  FULLTEXT KEY `name` (`name`,`description`,`brand`,`model`),
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `staff` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,'BB','Laptop Dell Latitude 5420',NULL,'Laptop công tác cho giảng viên, Core i5-11th Gen, 16GB RAM, 512GB SSD','DL5420','Dell','Latitude 5420','2024-01-11',10.00,23000000.00,'2027-01-11','Phòng giảng viên P301',NULL,'in_use','excellent','Máy mới, hiệu năng tốt',1,'2025-10-05 13:49:00','2025-10-06 14:31:01'),(2,'ccccc','Laptop HP ProBook 450 G9',NULL,'Laptop dự phòng cho công tác, Core i7, 16GB RAM, 512GB SSD','HP450G9-2024-002','Test Brand','xzxzxzx','2024-02-16',28000000.00,1000000.00,'2027-02-16','A Hà',NULL,'available','excellent','Sẵn sàng cấp phát',1,'2025-10-05 13:49:00','2025-10-06 14:31:47'),(3,'IT-PC-001','Máy tính để bàn Dell OptiPlex 7090',1,'PC cho phòng hành chính, Core i5-11th, 8GB RAM, 256GB SSD','DELL7090-2023-001','Dell','OptiPlex 7090','2023-09-10',18000000.00,15000000.00,'2026-09-10','Phòng hành chính P201',NULL,'in_use','good','Hoạt động ổn định',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(4,'FUR-DSK-001','Bàn làm việc IKEA BEKANT',3,'Bàn làm việc điều chỉnh chiều cao, 160x80cm, màu trắng','BEKANT-160-001','IKEA','BEKANT 160x80','2023-06-01',5000000.00,4500000.00,'2026-06-01','Phòng giảng viên P302',NULL,'in_use','good','Tình trạng tốt',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(5,'FUR-CHR-001','Ghế văn phòng Herman Miller Aeron',3,'Ghế ergonomic cao cấp, đệm lưới thoáng khí','HM-AERON-2023-001','Herman Miller','Aeron Size B','2023-06-01',12000000.00,11000000.00,'2035-06-01','Phòng giảng viên P302',NULL,'in_use','excellent','Bảo hành 12 năm',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(6,'EQ-PRJ-001','Máy chiếu Epson EB-2250U',2,'Máy chiếu WUXGA 5000 lumens cho phòng học','EPSON-EB2250U-001','Epson','EB-2250U','2023-08-15',35000000.00,32000000.00,'2026-08-15','Phòng học A301',NULL,'in_use','good','Thay bóng đèn lần cuối: 2024-09-01',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(7,'EQ-PRJ-002','Máy chiếu Sony VPL-FHZ70',2,'Máy chiếu laser WUXGA cho hội trường','SONY-VPLFHZ70-001','Sony','VPL-FHZ70','2024-03-20',85000000.00,82000000.00,'2027-03-20','Kho thiết bị',NULL,'maintenance','good','Đang bảo trì định kỳ, dự kiến hoàn thành 2024-10-15',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(8,'EQ-PRT-001','Máy in HP LaserJet Pro M404dn',2,'Máy in laser đen trắng tốc độ cao','HP-M404DN-2023-001','HP','LaserJet Pro M404dn','2023-05-10',8500000.00,7000000.00,'2026-05-10','Phòng hành chính P201',NULL,'in_use','good','Thay mực lần cuối: 2024-09-20',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(9,'VEH-CAR-001','Xe ô tô Toyota Innova 2023',4,'Xe 7 chỗ phục vụ công tác, màu bạc','INNOVA-2023-VN-001','Toyota','Innova 2.0E MT','2023-01-20',750000000.00,680000000.00,'2026-01-20','Bãi đỗ xe khoa',NULL,'in_use','good','Bảo dưỡng định kỳ lần cuối: 2024-09-10. Biển số: 30A-12345',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(10,'EQ-AC-001','Máy lạnh Daikin FTKC35UVMV',2,'Máy lạnh inverter 1.5HP cho phòng họp','DAIKIN-FTKC35-2022-001','Daikin','FTKC35UVMV','2022-04-15',12000000.00,9000000.00,'2024-04-15','Phòng họp P401',NULL,'in_use','fair','Hết bảo hành, cần lên lịch bảo trì',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(11,'IT-LAP-003','Laptop Asus ZenBook 14',1,'Laptop cũ đã hết chu kỳ sử dụng','ASUS-ZB14-2019-001','Asus','ZenBook 14 UX434','2019-03-10',22000000.00,5000000.00,'2022-03-10','Kho thiết bị cũ',NULL,'retired','poor','Đã qua 5 năm sử dụng, chờ thanh lý',1,'2025-10-05 13:49:00','2025-10-05 13:49:00'),(13,'TEST-CREATE-1','Thiet bi thu nghiem',NULL,NULL,'SER123','Brand','MD1',NULL,1000.00,900.00,NULL,NULL,NULL,'available','good',NULL,1,'2025-10-06 15:26:35','2025-10-06 15:26:35'),(15,'TEST-CREATE-UNIQ','Thiet bi moi',NULL,NULL,'SER456','Brand','MD2',NULL,1000.00,900.00,NULL,NULL,NULL,'available','good',NULL,1,'2025-10-06 15:30:17','2025-10-06 15:30:17'),(16,'hghhhhhhhhhhhhh','zzzzzzzz',NULL,NULL,'zzzzzzzzzzzz','z','zzzzzzzzzz',NULL,1111111.00,21212221.00,NULL,NULL,NULL,'available','good',NULL,1,'2025-10-07 03:56:43','2025-10-07 03:56:43');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT 'Mã lớp',
  `name` varchar(255) NOT NULL COMMENT 'Tên lớp',
  `subject_id` int DEFAULT NULL COMMENT 'ID môn học',
  `teacher_id` int DEFAULT NULL COMMENT 'ID giảng viên',
  `semester` varchar(50) DEFAULT NULL COMMENT 'Học kỳ',
  `academic_year` varchar(20) DEFAULT NULL COMMENT 'Năm học',
  `student_count` int DEFAULT '0' COMMENT 'Số lượng sinh viên',
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `subject_id` (`subject_id`),
  KEY `idx_code` (`code`),
  KEY `idx_semester` (`semester`,`academic_year`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lớp học';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (5,'LAW101-01','Lớp Pháp luật đại cương 01',1,NULL,'HK I','2024-2025',45,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(6,'LAW101-02','Lớp Pháp luật đại cương 02',1,NULL,'HK I','2024-2025',42,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(7,'CS201-01','Lớp Lập trình OOP 01',2,NULL,'HK I','2024-2025',35,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(8,'CS201-02','Lớp Lập trình OOP 02',2,NULL,'HK I','2024-2025',38,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(9,'ADM301-01','Lớp Quản trị nhà nước 01',3,NULL,'HK I','2024-2025',50,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(10,'ECO101-01','Lớp Kinh tế vi mô 01',4,NULL,'HK I','2024-2025',48,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(11,'SEC401-01','Lớp An ninh mạng 01',5,NULL,'HK I','2024-2025',32,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(12,'POL201-01','Lớp Lý luận chính trị 01',6,NULL,'HK I','2024-2025',55,'active','2025-10-04 02:20:14','2025-10-04 02:20:14');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_lecturers`
--

DROP TABLE IF EXISTS `course_lecturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_lecturers` (
  `course_id` int unsigned NOT NULL,
  `staff_id` int unsigned NOT NULL,
  `role` enum('primary','assistant','guest') COLLATE utf8mb4_unicode_ci DEFAULT 'primary',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`,`staff_id`),
  KEY `idx_course` (`course_id`),
  KEY `idx_staff` (`staff_id`),
  CONSTRAINT `course_lecturers_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_lecturers_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lecturers`
--

LOCK TABLES `course_lecturers` WRITE;
/*!40000 ALTER TABLE `course_lecturers` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_lecturers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `course_code` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credits` tinyint unsigned DEFAULT '0',
  `semester` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_year` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `idx_code` (`course_code`),
  KEY `idx_semester` (`semester`),
  KEY `idx_year` (`academic_year`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` mediumint unsigned DEFAULT NULL,
  `head_id` int unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_active` (`is_active`),
  KEY `fk_dept_head` (`head_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_dept_head` FOREIGN KEY (`head_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Khoa An ninh điều tra','KANDI',NULL,NULL,'Khoa An ninh điều tra - Trường Đại học An ninh nhân dân',1,'2025-09-30 11:42:10'),(2,'Bộ môn Lý thuyết An ninh','BMLT',NULL,NULL,'Bộ môn Lý thuyết An ninh',1,'2025-09-30 11:42:10'),(3,'Bộ môn Pháp luật Hình sự','BMPL',NULL,NULL,'Bộ môn Pháp luật Hình sự',1,'2025-09-30 11:42:10'),(4,'Bộ môn Kỹ thuật điều tra','BMKT',NULL,NULL,'Bộ môn Kỹ thuật điều tra',1,'2025-09-30 11:42:10'),(5,'Văn phòng Khoa','VP',NULL,NULL,'Văn phòng Khoa An ninh điều tra',1,'2025-09-30 11:42:10');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_attachments`
--

DROP TABLE IF EXISTS `document_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_attachments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `document_id` int unsigned NOT NULL,
  `filename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int unsigned DEFAULT '0',
  `mime_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` int unsigned NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_document` (`document_id`),
  CONSTRAINT `document_attachments_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_attachments`
--

LOCK TABLES `document_attachments` WRITE;
/*!40000 ALTER TABLE `document_attachments` DISABLE KEYS */;
INSERT INTO `document_attachments` VALUES (1,10,'doc_1759324231686-377167835_TÀI LIỆU LỚP CÔNG AN.pdf','TÀI LIỆU LỚP CÔNG AN.pdf','public/uploads/documents/doc_1759324231686-377167835_TÀI LIỆU LỚP CÔNG AN.pdf',1944985,'application/pdf',1,'2025-10-01 13:10:31'),(2,10,'doc_1759326375122-175667320_TÀI LIỆU LỚP CÔNG AN.pdf','TÀI LIỆU LỚP CÔNG AN.pdf','public/uploads/documents/doc_1759326375122-175667320_TÀI LIỆU LỚP CÔNG AN.pdf',1944985,'application/pdf',1,'2025-10-01 13:46:15');
/*!40000 ALTER TABLE `document_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_directive_history`
--

DROP TABLE IF EXISTS `document_directive_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_directive_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `document_id` int unsigned NOT NULL,
  `old_value` text,
  `new_value` text,
  `action` enum('update','approve') NOT NULL,
  `acted_by` int unsigned DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `document_id` (`document_id`),
  KEY `acted_by` (`acted_by`),
  CONSTRAINT `fk_ddh_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ddh_user` FOREIGN KEY (`acted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_directive_history`
--

LOCK TABLES `document_directive_history` WRITE;
/*!40000 ALTER TABLE `document_directive_history` DISABLE KEYS */;
INSERT INTO `document_directive_history` VALUES (1,10,'aaaaa','aaaaa','approve',1,NULL,'2025-10-01 02:58:08'),(2,10,'aaaaa','444444','update',1,NULL,'2025-10-01 02:58:21'),(3,10,'444444','444444','update',1,NULL,'2025-10-01 14:45:29');
/*!40000 ALTER TABLE `document_directive_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_files`
--

DROP TABLE IF EXISTS `document_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `document_id` int unsigned NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `mime_type` varchar(120) NOT NULL,
  `size` int unsigned NOT NULL,
  `relative_path` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `document_id` (`document_id`),
  CONSTRAINT `fk_document_files_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_files`
--

LOCK TABLES `document_files` WRITE;
/*!40000 ALTER TABLE `document_files` DISABLE KEYS */;
INSERT INTO `document_files` VALUES (1,10,'Trần Vĩnh Chiến.docx','doc_1759306655293-710786096_Trần Vĩnh Chiến.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',16851,'/public/uploads/documents/doc_1759306655293-710786096_Trần Vĩnh Chiến.docx','2025-10-01 08:17:35');
/*!40000 ALTER TABLE `document_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_types`
--

DROP TABLE IF EXISTS `document_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_types` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_types`
--

LOCK TABLES `document_types` WRITE;
/*!40000 ALTER TABLE `document_types` DISABLE KEYS */;
INSERT INTO `document_types` VALUES (1,'Công văn','CV',NULL,1,'2025-09-30 11:42:10'),(2,'Thông báo','TB',NULL,1,'2025-09-30 11:42:10'),(3,'Quyết định','QD',NULL,1,'2025-09-30 11:42:10'),(4,'Hướng dẫn','HD',NULL,1,'2025-09-30 11:42:10'),(5,'Báo cáo','BC',NULL,1,'2025-09-30 11:42:10');
/*!40000 ALTER TABLE `document_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `document_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_id` mediumint unsigned DEFAULT NULL,
  `direction` enum('incoming','outgoing') COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_org_id` mediumint unsigned DEFAULT NULL,
  `to_org_id` mediumint unsigned DEFAULT NULL,
  `chi_dao` text COLLATE utf8mb4_unicode_ci,
  `issue_date` date DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `processing_deadline` date DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('draft','pending','processing','completed','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `confidential_level` enum('public','internal','confidential','secret') COLLATE utf8mb4_unicode_ci DEFAULT 'internal',
  `content_summary` text COLLATE utf8mb4_unicode_ci,
  `results_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int unsigned NOT NULL,
  `assigned_to` int unsigned DEFAULT NULL,
  `approved_by` int unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `document_number` (`document_number`),
  KEY `type_id` (`type_id`),
  KEY `from_org_id` (`from_org_id`),
  KEY `to_org_id` (`to_org_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_number` (`document_number`),
  KEY `idx_direction` (`direction`),
  KEY `idx_issue_date` (`issue_date`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_documents_status_date` (`status`,`issue_date`),
  KEY `idx_documents_assigned_status` (`assigned_to`,`status`),
  FULLTEXT KEY `idx_search` (`title`,`content_summary`),
  FULLTEXT KEY `title` (`title`,`content_summary`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `document_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`from_org_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`to_org_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `documents_ibfk_5` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_6` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (2,'VD-002/2024','Văn bản thử nghiệm đi',2,'outgoing',2,1,NULL,'2024-09-30',NULL,NULL,'high','draft','internal','Nội dung văn bản đi thử nghiệm',NULL,1,NULL,NULL,NULL,NULL,'2025-09-30 14:02:36','2025-09-30 14:02:36'),(6,'123/CV-A02','hhhhhhhhhh',5,'outgoing',NULL,10,NULL,'2025-09-30',NULL,NULL,'low','pending','internal','dsdsdsds',NULL,1,NULL,NULL,NULL,NULL,'2025-09-30 14:59:48','2025-09-30 14:59:47'),(7,'23/BC','vhhhhhhhhhhhhhhh',5,'incoming',2,NULL,NULL,'2025-10-01','2025-10-02','2025-10-03','high','pending','internal','sfffffffffffffffffff',NULL,1,1,NULL,NULL,NULL,'2025-09-30 15:07:43','2025-09-30 15:07:42'),(10,'54/cv','aaaaaaaaa',5,'incoming',10,NULL,'444444',NULL,NULL,'2025-09-25','low','completed','internal','aaaaaaaaaaaaaa',NULL,1,NULL,NULL,NULL,NULL,'2025-09-30 17:02:20','2025-10-08 15:29:47');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_documents_status_update` AFTER UPDATE ON `documents` FOR EACH ROW BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (NEW.assigned_to, 'STATUS_CHANGE', 'documents', NEW.id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status));
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `evaluation_criteria`
--

DROP TABLE IF EXISTS `evaluation_criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation_criteria` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('teaching','research','service','professional','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'teaching',
  `measurement_type` enum('numeric','percentage','grade','boolean','text') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'numeric',
  `min_value` decimal(10,2) DEFAULT NULL,
  `max_value` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đơn vị đo: giờ, bài báo, học viên, điểm...',
  `weight` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Trọng số trong tổng điểm (0-100)',
  `is_required` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`),
  KEY `idx_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục các tiêu chí đánh giá cán bộ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_criteria`
--

LOCK TABLES `evaluation_criteria` WRITE;
/*!40000 ALTER TABLE `evaluation_criteria` DISABLE KEYS */;
INSERT INTO `evaluation_criteria` VALUES (1,'TEACH_HOURS','Số giờ giảng dạy','Tổng số giờ giảng dạy trong kỳ (bao gồm lý thuyết, thực hành, hướng dẫn)','teaching','numeric',0.00,500.00,'giờ',15.00,1,1,1,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(2,'TEACH_QUALITY','Chất lượng giảng dạy','Điểm đánh giá từ sinh viên và phòng Đào tạo','teaching','numeric',0.00,10.00,'điểm',10.00,1,1,2,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(3,'TEACH_MATERIALS','Tài liệu giảng dạy','Số giáo trình, bài giảng, tài liệu mới biên soạn','teaching','numeric',0.00,20.00,'tài liệu',5.00,0,1,3,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(4,'TEACH_INNOVATION','Đổi mới phương pháp','Áp dụng phương pháp giảng dạy mới, công nghệ vào giảng dạy','teaching','grade',NULL,NULL,NULL,5.00,0,1,4,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(5,'STUDENT_SUPERVISION','Hướng dẫn sinh viên','Số sinh viên NCKH, luận văn, thực tập được hướng dẫn','teaching','numeric',0.00,50.00,'sinh viên',5.00,0,1,5,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(6,'RESEARCH_PAPERS','Bài báo khoa học','Số bài báo được công bố (ISI, Scopus, ĐHQG)','research','numeric',0.00,20.00,'bài',15.00,0,1,11,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(7,'RESEARCH_PROJECTS','Đề tài nghiên cứu','Tham gia/chủ trì các đề tài nghiên cứu (cấp cơ sở, Bộ, Nhà nước)','research','numeric',0.00,10.00,'đề tài',8.00,0,1,12,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(8,'RESEARCH_CONFERENCES','Hội nghị, hội thảo','Tham gia, báo cáo tại hội nghị khoa học','research','numeric',0.00,15.00,'hội thảo',4.00,0,1,13,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(9,'RESEARCH_BOOKS','Sách chuyên khảo','Xuất bản sách, chương sách chuyên môn','research','numeric',0.00,5.00,'cuốn',3.00,0,1,14,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(10,'SERVICE_COMMITTEES','Tham gia hội đồng','Tham gia hội đồng khoa học, biên tập, phản biện...','service','numeric',0.00,10.00,'hội đồng',5.00,0,1,21,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(11,'SERVICE_TRAINING','Tập huấn, bồi dưỡng','Tham gia giảng dạy các khóa bồi dưỡng ngắn hạn','service','numeric',0.00,20.00,'khóa',4.00,0,1,22,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(12,'SERVICE_COMMUNITY','Hoạt động xã hội','Tham gia hoạt động từ thiện, tư vấn cộng đồng','service','boolean',NULL,NULL,NULL,3.00,0,1,23,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(13,'SERVICE_MEDIA','Truyền thông khoa học','Viết bài phổ biến khoa học, tham gia truyền thông','service','numeric',0.00,10.00,'bài',3.00,0,1,24,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(14,'PROF_TRAINING','Đào tạo, bồi dưỡng','Tham gia các khóa đào tạo nâng cao năng lực','professional','numeric',0.00,10.00,'khóa',4.00,0,1,31,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(15,'PROF_CERTIFICATIONS','Chứng chỉ nghề nghiệp','Đạt các chứng chỉ chuyên môn quốc tế, trong nước','professional','numeric',0.00,5.00,'chứng chỉ',3.00,0,1,32,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(16,'PROF_AWARDS','Giải thưởng cá nhân','Nhận giải thưởng, khen thưởng cá nhân','professional','numeric',0.00,5.00,'giải',3.00,0,1,33,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(17,'OTHER_DISCIPLINE','Kỷ luật, chuyên cần','Chấp hành nội quy, giờ giấc, kỷ luật lao động','other','grade',NULL,NULL,NULL,3.00,1,1,41,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(18,'OTHER_ETHICS','Đạo đức nghề nghiệp','Thái độ làm việc, quan hệ đồng nghiệp, sinh viên','other','grade',NULL,NULL,NULL,2.00,1,1,42,'2025-10-08 04:54:50','2025-10-08 04:54:50'),(19,'SSSSS','zzzzzzzz','ssssssssss','teaching','numeric',NULL,NULL,'ssssssss',1.00,0,1,999,'2025-10-08 04:56:54','2025-10-08 04:56:54'),(20,'DSDSDSC','3dsd','cccccccc','other','numeric',NULL,NULL,'cx',0.00,0,1,999,'2025-10-08 05:05:39','2025-10-08 05:05:39');
/*!40000 ALTER TABLE `evaluation_criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluation_period_criteria`
--

DROP TABLE IF EXISTS `evaluation_period_criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation_period_criteria` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `period_id` int unsigned NOT NULL,
  `criteria_id` int unsigned NOT NULL,
  `weight` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Trọng số riêng cho đợt này',
  `target_value` decimal(10,2) DEFAULT NULL COMMENT 'Chỉ tiêu tối thiểu',
  `excellent_value` decimal(10,2) DEFAULT NULL COMMENT 'Chỉ tiêu xuất sắc',
  `is_required` tinyint(1) DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period_criteria` (`period_id`,`criteria_id`),
  KEY `idx_period` (`period_id`),
  KEY `idx_criteria` (`criteria_id`),
  CONSTRAINT `evaluation_period_criteria_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluation_period_criteria_ibfk_2` FOREIGN KEY (`criteria_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cấu hình tiêu chí cho từng đợt đánh giá';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_period_criteria`
--

LOCK TABLES `evaluation_period_criteria` WRITE;
/*!40000 ALTER TABLE `evaluation_period_criteria` DISABLE KEYS */;
INSERT INTO `evaluation_period_criteria` VALUES (1,1,1,15.00,90.00,150.00,1,NULL),(2,1,2,10.00,7.00,9.00,1,NULL),(3,1,3,5.00,NULL,NULL,0,NULL),(4,1,4,5.00,NULL,NULL,0,NULL),(5,1,5,5.00,NULL,NULL,0,NULL),(6,1,6,15.00,1.00,3.00,0,NULL),(7,1,7,8.00,NULL,NULL,0,NULL),(8,1,8,4.00,NULL,NULL,0,NULL),(9,1,9,3.00,NULL,NULL,0,NULL),(10,1,10,5.00,NULL,NULL,0,NULL),(11,1,11,4.00,NULL,NULL,0,NULL),(12,1,12,3.00,NULL,NULL,0,NULL),(13,1,13,3.00,NULL,NULL,0,NULL),(14,1,14,4.00,NULL,NULL,0,NULL),(15,1,15,3.00,NULL,NULL,0,NULL),(16,1,16,3.00,NULL,NULL,0,NULL),(17,1,17,3.00,NULL,NULL,1,NULL),(18,1,18,2.00,NULL,NULL,1,NULL),(32,1,19,1.00,NULL,NULL,0,NULL),(33,1,20,0.00,NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `evaluation_period_criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluation_periods`
--

DROP TABLE IF EXISTS `evaluation_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation_periods` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên đợt đánh giá: HK1 2024-2025',
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Năm học: 2024-2025',
  `semester` tinyint DEFAULT NULL COMMENT 'Học kỳ: 1, 2, 3 (hè), NULL=cả năm',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `evaluation_deadline` date DEFAULT NULL COMMENT 'Hạn nộp tự đánh giá',
  `status` enum('draft','active','closed','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_year` (`academic_year`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Các đợt/kỳ đánh giá theo năm học';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_periods`
--

LOCK TABLES `evaluation_periods` WRITE;
/*!40000 ALTER TABLE `evaluation_periods` DISABLE KEYS */;
INSERT INTO `evaluation_periods` VALUES (1,'Học kỳ 1 năm học 2024-2025','2024-2025',1,'2024-09-01','2025-01-15','2025-01-20','active','Đợt đánh giá học kỳ 1 cho toàn bộ giảng viên','2025-10-08 04:54:50','2025-10-08 04:54:50'),(2,'Học kỳ 2 năm học 2024-2025','2024-2025',2,'2025-01-16','2025-06-15','2025-06-20','draft','Đợt đánh giá học kỳ 2 (dự kiến)','2025-10-08 04:54:50','2025-10-08 04:54:50'),(3,'Tổng kết năm học 2024-2025','2024-2025',NULL,'2024-09-01','2025-06-30','2025-07-10','draft','Đánh giá tổng kết cả năm học','2025-10-08 04:54:50','2025-10-08 04:54:50');
/*!40000 ALTER TABLE `evaluation_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_invigilators`
--

DROP TABLE IF EXISTS `exam_invigilators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_invigilators` (
  `exam_id` int unsigned NOT NULL,
  `staff_id` int unsigned NOT NULL,
  `role` enum('chief','assistant') COLLATE utf8mb4_unicode_ci DEFAULT 'assistant',
  PRIMARY KEY (`exam_id`,`staff_id`),
  KEY `idx_exam` (`exam_id`),
  KEY `idx_staff` (`staff_id`),
  CONSTRAINT `exam_invigilators_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_invigilators_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_invigilators`
--

LOCK TABLES `exam_invigilators` WRITE;
/*!40000 ALTER TABLE `exam_invigilators` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_invigilators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_attendance`
--

DROP TABLE IF EXISTS `examination_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL COMMENT 'ID ca thi',
  `invigilator_id` int NOT NULL COMMENT 'ID người coi thi',
  `check_in_time` timestamp NULL DEFAULT NULL COMMENT 'Giờ check-in',
  `check_out_time` timestamp NULL DEFAULT NULL COMMENT 'Giờ check-out',
  `status` enum('absent','present','late') DEFAULT 'present',
  `notes` text COMMENT 'Ghi chú',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invigilator_id` (`invigilator_id`),
  KEY `idx_session` (`session_id`),
  CONSTRAINT `examination_attendance_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_attendance_ibfk_2` FOREIGN KEY (`invigilator_id`) REFERENCES `examination_invigilators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Điểm danh coi thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_attendance`
--

LOCK TABLES `examination_attendance` WRITE;
/*!40000 ALTER TABLE `examination_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `examination_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_files`
--

DROP TABLE IF EXISTS `examination_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL COMMENT 'ID ca thi',
  `file_name` varchar(255) NOT NULL COMMENT 'Tên file gốc',
  `file_path` varchar(500) NOT NULL COMMENT 'Đường dẫn lưu file',
  `file_size` int DEFAULT NULL COMMENT 'Kích thước file (bytes)',
  `file_type` varchar(100) DEFAULT NULL COMMENT 'Loại file (MIME type)',
  `file_extension` varchar(10) DEFAULT NULL COMMENT 'Phần mở rộng (.pdf, .docx)',
  `uploaded_by` int DEFAULT NULL COMMENT 'Người upload',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_primary` tinyint(1) DEFAULT '0' COMMENT 'File chính',
  `description` text COMMENT 'Mô tả file',
  `download_count` int DEFAULT '0' COMMENT 'Số lần tải xuống',
  `status` enum('active','deleted') DEFAULT 'active',
  `metadata` json DEFAULT NULL COMMENT 'Metadata bổ sung',
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_type` (`file_type`),
  KEY `idx_uploaded_at` (`uploaded_at`),
  KEY `idx_file_status` (`session_id`,`status`),
  KEY `idx_primary_file` (`session_id`,`is_primary`),
  CONSTRAINT `examination_files_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='File đính kèm ca thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_files`
--

LOCK TABLES `examination_files` WRITE;
/*!40000 ALTER TABLE `examination_files` DISABLE KEYS */;
INSERT INTO `examination_files` VALUES (1,22,'TÀI LIỆU LỚP CÔNG AN.pdf','D:/PHAN MEM/quan_ly_giao_vu_new/quan_ly_giao_vu_mvc/public/uploads/1759631294987-321329026_TÀI LIỆU LỚP CÔNG AN.pdf',1944985,'application/pdf','.pdf',1,'2025-10-05 02:28:15',1,'',1,'active',NULL);
/*!40000 ALTER TABLE `examination_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_invigilators`
--

DROP TABLE IF EXISTS `examination_invigilators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_invigilators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL COMMENT 'ID ca thi',
  `staff_id` int NOT NULL COMMENT 'ID cán bộ',
  `role` enum('main','assistant','supervisor') DEFAULT 'main' COMMENT 'Vai trò',
  `assigned_by` int DEFAULT NULL COMMENT 'Người phân công',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed` tinyint(1) DEFAULT '0' COMMENT 'Đã xác nhận',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `notes` text COMMENT 'Ghi chú',
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_staff` (`staff_id`),
  CONSTRAINT `examination_invigilators_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phân công coi thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_invigilators`
--

LOCK TABLES `examination_invigilators` WRITE;
/*!40000 ALTER TABLE `examination_invigilators` DISABLE KEYS */;
/*!40000 ALTER TABLE `examination_invigilators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_papers`
--

DROP TABLE IF EXISTS `examination_papers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_papers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL COMMENT 'ID ca thi',
  `paper_code` varchar(50) DEFAULT NULL COMMENT 'Mã đề',
  `title` varchar(255) DEFAULT NULL COMMENT 'Tiêu đề đề thi',
  `file_path` varchar(500) DEFAULT NULL COMMENT 'Đường dẫn file',
  `file_name` varchar(255) DEFAULT NULL COMMENT 'Tên file',
  `file_size` bigint DEFAULT NULL COMMENT 'Kích thước file',
  `copies_needed` int DEFAULT NULL COMMENT 'Số bản cần in',
  `copies_printed` int DEFAULT '0' COMMENT 'Số bản đã in',
  `created_by` int DEFAULT NULL COMMENT 'Người tạo',
  `approved_by` int DEFAULT NULL COMMENT 'Người duyệt',
  `approved_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','pending','approved','rejected','printed') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `examination_papers_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Đề thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_papers`
--

LOCK TABLES `examination_papers` WRITE;
/*!40000 ALTER TABLE `examination_papers` DISABLE KEYS */;
/*!40000 ALTER TABLE `examination_papers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_periods`
--

DROP TABLE IF EXISTS `examination_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'Tên kỳ thi',
  `semester` varchar(50) DEFAULT NULL COMMENT 'Học kỳ',
  `academic_year` varchar(20) DEFAULT NULL COMMENT 'Năm học',
  `start_date` date DEFAULT NULL COMMENT 'Ngày bắt đầu',
  `end_date` date DEFAULT NULL COMMENT 'Ngày kết thúc',
  `status` enum('draft','active','completed','cancelled') DEFAULT 'draft' COMMENT 'Trạng thái',
  `description` text COMMENT 'Mô tả',
  `created_by` int DEFAULT NULL COMMENT 'Người tạo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Kỳ thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_periods`
--

LOCK TABLES `examination_periods` WRITE;
/*!40000 ALTER TABLE `examination_periods` DISABLE KEYS */;
INSERT INTO `examination_periods` VALUES (1,'Thi kết thúc học kỳ I','Học kỳ I','2024-2025','2024-12-15','2024-12-30','active',NULL,NULL,'2025-10-04 00:04:30','2025-10-04 00:04:30'),(2,'Thi giữa kỳ I','Học kỳ I','2024-2025','2024-10-20','2024-10-27','completed',NULL,NULL,'2025-10-04 00:04:30','2025-10-04 00:04:30'),(3,'Kỳ thi giữa kỳ HK I 2024-2025','HK I','2024-2025','2024-11-01','2024-11-15','active','Kỳ thi giữa kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:20:14','2025-10-04 02:20:14'),(4,'Kỳ thi cuối kỳ HK I 2024-2025','HK I','2024-2025','2024-12-20','2025-01-10','draft','Kỳ thi cuối kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:20:14','2025-10-04 02:20:14'),(5,'Kỳ thi giữa kỳ HK II 2024-2025','HK II','2024-2025','2025-03-15','2025-03-30','draft','Kỳ thi giữa kỳ học kỳ II năm học 2024-2025',NULL,'2025-10-04 02:20:14','2025-10-04 02:20:14'),(6,'Kỳ thi giữa kỳ HK I 2024-2025','HK I','2024-2025','2024-11-01','2024-11-15','active','Kỳ thi giữa kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:21:28','2025-10-04 02:21:28'),(7,'Kỳ thi cuối kỳ HK I 2024-2025','HK I','2024-2025','2024-12-20','2025-01-10','draft','Kỳ thi cuối kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:21:28','2025-10-04 02:21:28'),(8,'Kỳ thi giữa kỳ HK II 2024-2025','HK II','2024-2025','2025-03-15','2025-03-30','draft','Kỳ thi giữa kỳ học kỳ II năm học 2024-2025',NULL,'2025-10-04 02:21:28','2025-10-04 02:21:28'),(9,'Kỳ thi giữa kỳ HK I 2024-2025','HK I','2024-2025','2024-11-01','2024-11-15','active','Kỳ thi giữa kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:27:21','2025-10-04 02:27:21'),(10,'Kỳ thi cuối kỳ HK I 2024-2025','HK I','2024-2025','2024-12-20','2025-01-10','draft','Kỳ thi cuối kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:27:21','2025-10-04 02:27:21'),(11,'Kỳ thi giữa kỳ HK II 2024-2025','HK II','2024-2025','2025-03-15','2025-03-30','draft','Kỳ thi giữa kỳ học kỳ II năm học 2024-2025',NULL,'2025-10-04 02:27:21','2025-10-04 02:27:21'),(12,'Kỳ thi giữa kỳ HK I 2024-2025','HK I','2024-2025','2024-11-01','2024-11-15','active','Kỳ thi giữa kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:28:00','2025-10-04 02:28:00'),(13,'Kỳ thi cuối kỳ HK I 2024-2025','HK I','2024-2025','2024-12-20','2025-01-10','draft','Kỳ thi cuối kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:28:00','2025-10-04 02:28:00'),(14,'Kỳ thi giữa kỳ HK II 2024-2025','HK II','2024-2025','2025-03-15','2025-03-30','draft','Kỳ thi giữa kỳ học kỳ II năm học 2024-2025',NULL,'2025-10-04 02:28:00','2025-10-04 02:28:00'),(15,'Kỳ thi giữa kỳ HK I 2024-2025','HK I','2024-2025','2024-11-01','2024-11-15','active','Kỳ thi giữa kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:29:18','2025-10-04 02:29:18'),(16,'Kỳ thi cuối kỳ HK I 2024-2025','HK I','2024-2025','2024-12-20','2025-01-10','draft','Kỳ thi cuối kỳ học kỳ I năm học 2024-2025',NULL,'2025-10-04 02:29:18','2025-10-04 02:29:18'),(17,'Kỳ thi giữa kỳ HK II 2024-2025','HK II','2024-2025','2025-03-15','2025-03-30','draft','Kỳ thi giữa kỳ học kỳ II năm học 2024-2025',NULL,'2025-10-04 02:29:18','2025-10-04 02:29:18');
/*!40000 ALTER TABLE `examination_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_reminders`
--

DROP TABLE IF EXISTS `examination_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL COMMENT 'ID ca thi',
  `reminder_type` enum('grading','invigilator','paper','other') DEFAULT 'grading' COMMENT 'Loại nhắc việc',
  `recipient_id` int NOT NULL COMMENT 'ID người nhận',
  `recipient_email` varchar(255) DEFAULT NULL COMMENT 'Email người nhận',
  `subject` varchar(500) DEFAULT NULL COMMENT 'Tiêu đề',
  `message` text COMMENT 'Nội dung',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian gửi',
  `status` enum('sent','failed','pending') DEFAULT 'pending' COMMENT 'Trạng thái',
  `sent_by` int DEFAULT NULL COMMENT 'Người gửi',
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_recipient` (`recipient_id`),
  KEY `idx_sent_at` (`sent_at`),
  CONSTRAINT `examination_reminders_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử nhắc việc';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_reminders`
--

LOCK TABLES `examination_reminders` WRITE;
/*!40000 ALTER TABLE `examination_reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `examination_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_sessions`
--

DROP TABLE IF EXISTS `examination_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period_id` int NOT NULL COMMENT 'ID kỳ thi',
  `subject_id` int NOT NULL COMMENT 'ID môn học',
  `class_id` int DEFAULT NULL COMMENT 'ID lớp học',
  `exam_code` varchar(50) DEFAULT NULL COMMENT 'Mã ca thi',
  `exam_name` varchar(255) DEFAULT NULL COMMENT 'Tên bài thi',
  `exam_date` date NOT NULL COMMENT 'Ngày thi',
  `exam_time` time NOT NULL COMMENT 'Giờ thi',
  `duration` int DEFAULT '90' COMMENT 'Thời lượng (phút)',
  `room` varchar(100) DEFAULT NULL COMMENT 'Phòng thi',
  `building` varchar(100) DEFAULT NULL COMMENT 'Tòa nhà',
  `student_count` int DEFAULT '0' COMMENT 'Số lượng sinh viên',
  `expected_copies` int DEFAULT NULL COMMENT 'Dự kiến số bản cần in',
  `actual_copies` int DEFAULT NULL COMMENT 'Số bản thực tế',
  `grader_id` int DEFAULT NULL COMMENT 'ID cán bộ chấm thi',
  `grader_manual_name` varchar(120) DEFAULT NULL,
  `grading_deadline` date DEFAULT NULL COMMENT 'Hạn chấm bài',
  `reminder_sent` tinyint(1) DEFAULT '0' COMMENT 'Đã gửi nhắc việc',
  `reminder_sent_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian gửi nhắc việc',
  `link` varchar(500) DEFAULT NULL COMMENT 'Link thi online',
  `exam_type` enum('online','offline','hybrid') DEFAULT 'offline' COMMENT 'Hình thức thi',
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `notes` text COMMENT 'Ghi chú',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `file_count` int DEFAULT '0' COMMENT 'Số lượng file đính kèm',
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_code` (`exam_code`),
  KEY `subject_id` (`subject_id`),
  KEY `class_id` (`class_id`),
  KEY `idx_exam_date` (`exam_date`),
  KEY `idx_status` (`status`),
  KEY `idx_period` (`period_id`),
  KEY `idx_grader` (`grader_id`),
  KEY `idx_grading_deadline` (`grading_deadline`),
  CONSTRAINT `examination_sessions_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `examination_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_sessions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_sessions_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ca thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_sessions`
--

LOCK TABLES `examination_sessions` WRITE;
/*!40000 ALTER TABLE `examination_sessions` DISABLE KEYS */;
INSERT INTO `examination_sessions` VALUES (18,1,6,NULL,'POL201-GK-01','Thi giữa kỳ Lý luận chính trị','2024-11-10','08:00:00',90,'F201',NULL,55,60,NULL,NULL,NULL,NULL,0,NULL,NULL,'offline','scheduled',NULL,'2025-10-04 02:30:49','2025-10-04 02:30:49',0),(22,2,5,9,'SEC401-CK-01','Thi cuối kỳ An ninh mạng','2024-12-16','13:30:00',120,'E401','',32,35,NULL,NULL,'sâsasasa','2025-10-06',0,NULL,'','offline','scheduled','','2025-10-04 02:30:49','2025-10-05 04:23:07',0);
/*!40000 ALTER TABLE `examination_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_students`
--

DROP TABLE IF EXISTS `examination_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL COMMENT 'ID ca thi',
  `student_id` int NOT NULL COMMENT 'ID sinh viên',
  `student_code` varchar(50) DEFAULT NULL COMMENT 'Mã sinh viên',
  `student_name` varchar(255) DEFAULT NULL COMMENT 'Tên sinh viên',
  `registration_number` varchar(50) DEFAULT NULL COMMENT 'Số báo danh',
  `seat_number` varchar(20) DEFAULT NULL COMMENT 'Số báo danh',
  `status` enum('registered','present','absent','disqualified') DEFAULT 'registered',
  `checked_in_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian check-in',
  `notes` text COMMENT 'Ghi chú',
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_student_code` (`student_code`),
  CONSTRAINT `examination_students_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Sinh viên dự thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_students`
--

LOCK TABLES `examination_students` WRITE;
/*!40000 ALTER TABLE `examination_students` DISABLE KEYS */;
/*!40000 ALTER TABLE `examination_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` int unsigned DEFAULT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL,
  `duration_minutes` smallint unsigned DEFAULT '90',
  `room` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('midterm','final','makeup','special') COLLATE utf8mb4_unicode_ci DEFAULT 'final',
  `max_score` decimal(5,2) DEFAULT '100.00',
  `status` enum('scheduled','ongoing','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_code` (`exam_code`),
  KEY `created_by` (`created_by`),
  KEY `idx_code` (`exam_code`),
  KEY `idx_date` (`exam_date`),
  KEY `idx_course` (`course_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `legal_document_attachments`
--

DROP TABLE IF EXISTS `legal_document_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_document_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên file trên server',
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên file gốc',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Đường dẫn file',
  `file_size` bigint DEFAULT NULL COMMENT 'Kích thước file (bytes)',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Loại file',
  `version` int DEFAULT '1' COMMENT 'Phiên bản file',
  `is_current` tinyint(1) DEFAULT '1' COMMENT '1=phiên bản hiện tại, 0=phiên bản cũ',
  `replaced_by` int DEFAULT NULL COMMENT 'ID file thay thế',
  `download_count` int DEFAULT '0' COMMENT 'Số lần tải xuống',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_version` (`document_id`,`version`),
  KEY `idx_is_current` (`is_current`),
  CONSTRAINT `fk_legal_attachments_document` FOREIGN KEY (`document_id`) REFERENCES `legal_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='File đính kèm văn bản pháp lý';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_document_attachments`
--

LOCK TABLES `legal_document_attachments` WRITE;
/*!40000 ALTER TABLE `legal_document_attachments` DISABLE KEYS */;
INSERT INTO `legal_document_attachments` VALUES (1,3,'doc_1759392083815-38139988_TÀI LIỆU LỚP CÔNG AN.pdf','TÀI LIỆU LỚP CÔNG AN.pdf','public/uploads/documents/doc_1759392083815-38139988_TÀI LIỆU LỚP CÔNG AN.pdf',1944985,'application/pdf',1,1,NULL,0,1,'2025-10-02 08:01:23');
/*!40000 ALTER TABLE `legal_document_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `legal_document_audit_logs`
--

DROP TABLE IF EXISTS `legal_document_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_document_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `action` enum('Tạo mới','Cập nhật','Xóa','Tải xuống','Xem','Upload file','Xóa file') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên người thực hiện',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Browser info',
  `old_values` text COLLATE utf8mb4_unicode_ci COMMENT 'Giá trị cũ (JSON)',
  `new_values` text COLLATE utf8mb4_unicode_ci COMMENT 'Giá trị mới (JSON)',
  `details` text COLLATE utf8mb4_unicode_ci COMMENT 'Chi tiết thao tác',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_audit_document` FOREIGN KEY (`document_id`) REFERENCES `legal_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký hoạt động văn bản pháp lý';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_document_audit_logs`
--

LOCK TABLES `legal_document_audit_logs` WRITE;
/*!40000 ALTER TABLE `legal_document_audit_logs` DISABLE KEYS */;
INSERT INTO `legal_document_audit_logs` VALUES (1,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-01 15:24:18'),(2,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-01 15:57:01'),(3,3,'Tạo mới',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','{\"document_number\":\"1234\",\"title\":\"aaaaaaaaaaaa\",\"document_type\":\"Luật\",\"issuing_authority\":\"Quốc hội\",\"issue_date\":null,\"effective_date\":null,\"expiry_date\":null,\"status\":\"Dự thảo\",\"subject\":\"Hình sự\",\"summary\":null,\"keywords\":\"sa\",\"signer_name\":null,\"signer_position\":null,\"replaced_by\":null,\"related_documents\":null,\"version\":1,\"created_by\":1}','Tạo văn bản 1234','2025-10-01 16:04:22'),(4,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-01 16:04:22'),(5,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-01 16:14:41'),(6,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-01 16:14:58'),(7,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 01:51:04'),(8,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:06:20'),(9,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:06:22'),(10,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:06:41'),(11,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:06:45'),(12,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:08:01'),(13,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:08:04'),(14,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:08:05'),(15,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 02:08:05'),(16,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 03:52:22'),(17,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 04:01:24'),(19,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 04:21:19'),(20,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:23:10'),(21,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 04:30:36'),(22,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 04:30:42'),(23,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:30:49'),(24,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:34:41'),(25,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:45:57'),(30,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:53:06'),(31,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:54:50'),(32,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:54:51'),(33,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 04:54:58'),(34,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 04:55:02'),(36,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 06:35:39'),(37,1,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản QC-QLTL-2025','2025-10-02 06:35:58'),(38,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 06:36:06'),(39,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 06:55:47'),(40,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 06:58:19'),(41,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 07:00:03'),(42,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 07:20:27'),(43,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 07:50:26'),(44,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 07:53:18'),(45,3,'Xem',1,'admin','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','null','null','Xem văn bản 1234','2025-10-02 08:01:23');
/*!40000 ALTER TABLE `legal_document_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `legal_documents`
--

DROP TABLE IF EXISTS `legal_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Số văn bản',
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề/Trích yếu',
  `document_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại văn bản: Luật, Nghị định, Thông tư, Quyết định, etc',
  `issuing_authority` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Cơ quan ban hành',
  `issue_date` date DEFAULT NULL COMMENT 'Ngày ban hành',
  `effective_date` date DEFAULT NULL COMMENT 'Ngày có hiệu lực',
  `expiry_date` date DEFAULT NULL COMMENT 'Ngày hết hiệu lực',
  `status` enum('Dự thảo','Còn hiệu lực','Hết hiệu lực','Bị thay thế','Đã hủy') COLLATE utf8mb4_unicode_ci DEFAULT 'Dự thảo',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lĩnh vực',
  `summary` text COLLATE utf8mb4_unicode_ci COMMENT 'Tóm tắt nội dung',
  `keywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Từ khóa',
  `replaced_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Văn bản thay thế',
  `related_documents` text COLLATE utf8mb4_unicode_ci COMMENT 'Văn bản liên quan',
  `signer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Người ký',
  `signer_position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Chức vụ người ký',
  `version` int DEFAULT '1' COMMENT 'Phiên bản văn bản',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `document_number` (`document_number`),
  KEY `idx_type` (`document_type`),
  KEY `idx_status` (`status`),
  KEY `idx_issue_date` (`issue_date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_advanced_search` (`document_type`,`status`,`issue_date`,`effective_date`),
  KEY `idx_signer` (`signer_name`),
  FULLTEXT KEY `idx_fulltext_search` (`document_number`,`title`,`summary`,`keywords`,`subject`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý văn bản pháp lý';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_documents`
--

LOCK TABLES `legal_documents` WRITE;
/*!40000 ALTER TABLE `legal_documents` DISABLE KEYS */;
INSERT INTO `legal_documents` VALUES (1,'QC-QLTL-2025','Quy chế quản lý tài liệu','Quy định','Khoa ANDT','2025-03-12','2025-04-01',NULL,'Còn hiệu lực','Quản lý tài liệu','Quy định về quy trình quản lý, lưu trữ và sử dụng tài liệu trong khoa','quy chế, tài liệu, lưu trữ',NULL,NULL,NULL,NULL,1,1,NULL,'2025-10-01 14:06:24',NULL),(3,'1234','aaaaaaaaaaaa','Luật','Quốc hội','2025-09-26','2025-09-28',NULL,'Dự thảo','Hình sự',NULL,'sa',NULL,NULL,NULL,NULL,1,1,1,'2025-10-01 16:04:22','2025-10-02 08:01:23');
/*!40000 ALTER TABLE `legal_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_code` (`code`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Trường Đại học Bách khoa Hà Nội','HUST',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(2,'Bộ Giáo dục và Đào tạo','MOET',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(3,'Viện Khoa học và Công nghệ Việt Nam','VAST',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(4,'Trường Đại học Quốc gia Hà Nội','VNU',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(5,'Trường Đại học Kinh tế Quốc dân','NEU',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(6,'Trường Đại học Y Hà Nội','HMU',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(7,'Phòng Đào tạo','EDUCATION',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(8,'Phòng Khoa học và Công nghệ','SCIENCE',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(9,'Phòng Tài chính Kế toán','FINANCE',NULL,NULL,NULL,1,'2025-09-30 13:43:50'),(10,'Ban Giám hiệu','ADMIN',NULL,NULL,NULL,1,'2025-09-30 13:43:50');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `positions` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` tinyint unsigned DEFAULT '0',
  `department_id` mediumint unsigned DEFAULT NULL,
  `salary_min` decimal(12,2) DEFAULT '0.00',
  `salary_max` decimal(12,2) DEFAULT '0.00',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_level` (`level`),
  KEY `idx_dept` (`department_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `positions_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (1,'Trưởng khoa','TK',1,1,0.00,0.00,NULL,1,'2025-09-30 11:42:10'),(2,'Phó trưởng khoa','PTK',2,1,0.00,0.00,NULL,1,'2025-09-30 11:42:10'),(3,'Trưởng bộ môn','TBM',3,NULL,0.00,0.00,NULL,1,'2025-09-30 11:42:10'),(4,'Phó trưởng bộ môn','PTBM',4,NULL,0.00,0.00,NULL,1,'2025-09-30 11:42:10'),(5,'Giảng viên chính','GVC',5,NULL,0.00,0.00,NULL,1,'2025-09-30 11:42:10'),(6,'Giảng viên','GV',6,NULL,0.00,0.00,NULL,1,'2025-09-30 11:42:10'),(7,'Cán bộ hành chính','CBHC',7,NULL,0.00,0.00,NULL,1,'2025-09-30 11:42:10');
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_categories`
--

DROP TABLE IF EXISTS `project_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_categories` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_categories`
--

LOCK TABLES `project_categories` WRITE;
/*!40000 ALTER TABLE `project_categories` DISABLE KEYS */;
INSERT INTO `project_categories` VALUES (1,'Nghiên cứu cấp khoa','NCK',NULL,1),(2,'Nghiên cứu cấp trường','NCT',NULL,1),(3,'Nghiên cứu cấp bộ','NCB',NULL,1),(4,'Dự án phát triển','DPT',NULL,1);
/*!40000 ALTER TABLE `project_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_members` (
  `project_id` int unsigned NOT NULL,
  `staff_id` int unsigned NOT NULL,
  `role` enum('leader','member','advisor') COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`,`staff_id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_staff` (`staff_id`),
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_milestones`
--

DROP TABLE IF EXISTS `project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_milestones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int unsigned NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_date` date NOT NULL,
  `status` enum('pending','in_progress','completed','overdue') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `progress` tinyint unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `project_milestones_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_milestones`
--

LOCK TABLES `project_milestones` WRITE;
/*!40000 ALTER TABLE `project_milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `project_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` mediumint unsigned DEFAULT NULL,
  `leader_id` int unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `budget` decimal(15,2) DEFAULT '0.00',
  `status` enum('planning','active','completed','paused','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planning',
  `progress` tinyint unsigned DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `objectives` text COLLATE utf8mb4_unicode_ci,
  `results_summary` text COLLATE utf8mb4_unicode_ci,
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_code` (`project_code`),
  KEY `created_by` (`created_by`),
  KEY `idx_code` (`project_code`),
  KEY `idx_category` (`category_id`),
  KEY `idx_leader` (`leader_id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_projects_status_dates` (`status`,`start_date`,`end_date`),
  FULLTEXT KEY `idx_search` (`title`,`description`,`objectives`),
  FULLTEXT KEY `title` (`title`,`description`,`objectives`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `project_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`leader_id`) REFERENCES `staff` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'PRJ-2025-10-08-21-29','ggggggggggggg',NULL,2,'2025-10-05','2025-10-14',0.00,'planning',0,NULL,NULL,NULL,1,'2025-10-08 14:29:47','2025-10-08 14:29:47');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reminders`
--

DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `deadline` datetime NOT NULL,
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `status` enum('pending','completed','cancelled','overdue') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_by` int unsigned NOT NULL,
  `assigned_to` int unsigned NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `reminder_before_minutes` smallint unsigned DEFAULT '15',
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurrence_rule` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_deadline` (`deadline`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_reminders_assigned_deadline` (`assigned_to`,`deadline`),
  CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `reminders_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminders`
--

LOCK TABLES `reminders` WRITE;
/*!40000 ALTER TABLE `reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_reviews`
--

DROP TABLE IF EXISTS `report_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_reviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `report_id` int unsigned NOT NULL,
  `reviewer_id` int unsigned NOT NULL,
  `review_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `decision` enum('approved','rejected','needs_revision') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_report` (`report_id`),
  KEY `idx_reviewer` (`reviewer_id`),
  CONSTRAINT `report_reviews_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_reviews`
--

LOCK TABLES `report_reviews` WRITE;
/*!40000 ALTER TABLE `report_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_schedules`
--

DROP TABLE IF EXISTS `report_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_schedules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `frequency` enum('weekly','monthly','quarterly','annual','custom') NOT NULL DEFAULT 'monthly',
  `owner_unit_id` mediumint unsigned DEFAULT NULL,
  `owner_custom` varchar(120) DEFAULT NULL,
  `channel` varchar(150) DEFAULT NULL,
  `scope` text,
  `status` enum('planning','pending','in_progress','draft','on_hold') NOT NULL DEFAULT 'planning',
  `progress` tinyint unsigned NOT NULL DEFAULT '0',
  `completion_rate` tinyint unsigned NOT NULL DEFAULT '0',
  `remind_before_hours` smallint unsigned NOT NULL DEFAULT '48',
  `next_due_date` date DEFAULT NULL,
  `due_label` varchar(150) DEFAULT NULL,
  `recurrence_pattern` json DEFAULT NULL,
  `attachments_expected` tinyint unsigned NOT NULL DEFAULT '0',
  `tags` json DEFAULT NULL,
  `last_submitted_at` date DEFAULT NULL,
  `created_by` int unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_frequency` (`frequency`),
  KEY `idx_status_report` (`status`),
  KEY `idx_next_due` (`next_due_date`),
  KEY `idx_owner_unit` (`owner_unit_id`),
  KEY `idx_active_schedule` (`is_active`),
  CONSTRAINT `report_schedules_ibfk_1` FOREIGN KEY (`owner_unit_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `report_schedules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_schedules`
--

LOCK TABLES `report_schedules` WRITE;
/*!40000 ALTER TABLE `report_schedules` DISABLE KEYS */;
INSERT INTO `report_schedules` VALUES (1,'Báo cáo tuần công tác','weekly',NULL,'Văn phòng Khoa','SharePoint nội bộ','Tổng hợp tiến độ các phòng ban và lịch làm việc trọng tâm','pending',65,92,48,'2025-10-10','Thứ sáu hàng tuần','{\"type\": \"weekly\", \"dayOfWeek\": 5}',5,'[\"Định kỳ\", \"Lãnh đạo khoa\"]','2025-10-03',NULL,0,'2025-10-08 12:05:06','2025-10-08 12:36:03'),(2,'Báo cáo chất lượng đào tạo tháng','monthly',NULL,'Phòng Đảm bảo chất lượng','Kho dữ liệu đào tạo','Theo dõi tỷ lệ hoàn thành kế hoạch giảng dạy, tình trạng lớp học','in_progress',48,87,48,'2025-10-22','Ngày 18 hàng tháng','{\"type\": \"monthly\", \"dayOfMonth\": 18}',8,'[\"Định kỳ\", \"Đào tạo\"]','2025-09-18',NULL,1,'2025-10-08 12:05:06','2025-10-08 12:05:06'),(3,'Báo cáo tổng hợp quý IV/2025','quarterly',NULL,'Phòng Thanh tra - Kiểm tra','Kho dữ liệu báo cáo','Đánh giá chỉ tiêu kế hoạch, ngân sách, công tác phối hợp đơn vị','planning',25,74,48,'2025-11-13','Hạn nộp: 05/11/2025','{\"day\": 5, \"type\": \"quarterly\", \"month\": 11}',3,'[\"Chiến lược\", \"Tổng hợp\"]','2025-07-20',NULL,1,'2025-10-08 12:05:06','2025-10-08 12:05:06'),(4,'Báo cáo tổng kết năm học 2024-2025','annual',NULL,'Ban Chủ nhiệm Khoa','Kho dữ liệu báo cáo','Tổng hợp kết quả toàn diện, đề xuất kế hoạch 2026','draft',15,58,48,'2025-12-19','Hạn trình: 10/12/2025','{\"day\": 10, \"type\": \"annual\", \"month\": 12}',0,'[\"Chiến lược\", \"Ban giám hiệu\"]',NULL,NULL,1,'2025-10-08 12:05:06','2025-10-08 12:05:06'),(5,'ZZz','monthly',4,NULL,'zZ',NULL,'pending',0,0,48,NULL,'Ngày 18 hàng tháng','{\"type\": \"monthly\", \"dayOfMonth\": 18}',0,NULL,NULL,1,1,'2025-10-08 12:06:33','2025-10-08 12:06:33'),(6,'gfgfg','monthly',1,NULL,NULL,NULL,'pending',0,0,48,NULL,'Ngày 18 hàng tháng','{\"type\": \"monthly\", \"dayOfMonth\": 18}',0,NULL,NULL,1,1,'2025-10-08 12:36:26','2025-10-08 12:36:26');
/*!40000 ALTER TABLE `report_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_types`
--

DROP TABLE IF EXISTS `report_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_types` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_types`
--

LOCK TABLES `report_types` WRITE;
/*!40000 ALTER TABLE `report_types` DISABLE KEYS */;
INSERT INTO `report_types` VALUES (1,'Báo cáo tháng','BCT',NULL,1),(2,'Báo cáo quý','BCQ',NULL,1),(3,'Báo cáo năm','BCN',NULL,1),(4,'Báo cáo chuyên đề','BCCD',NULL,1);
/*!40000 ALTER TABLE `report_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_id` mediumint unsigned DEFAULT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `unit_id` mediumint unsigned DEFAULT NULL,
  `author_id` int unsigned NOT NULL,
  `status` enum('draft','submitted','reviewed','approved','published') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `summary` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type_id`),
  KEY `idx_period` (`period_start`,`period_end`),
  KEY `idx_unit` (`unit_id`),
  KEY `idx_author` (`author_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `report_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','System Administrator','[\"all\"]',1,'2025-09-30 11:42:10'),(2,'staff','Staff Member','[\"read\", \"write_own\"]',1,'2025-09-30 11:42:10'),(3,'lecturer','Lecturer','[\"read\", \"write_own\", \"teach\"]',1,'2025-09-30 11:42:10'),(4,'viewer','Read Only','[\"read\"]',1,'2025-09-30 11:42:10');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_exceptions`
--

DROP TABLE IF EXISTS `schedule_exceptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_exceptions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `schedule_id` int unsigned NOT NULL COMMENT 'ID lịch gốc',
  `exception_date` date NOT NULL COMMENT 'Ngày ngoại lệ',
  `action` enum('skip','modify') DEFAULT 'skip' COMMENT 'Hành động',
  `modified_data` json DEFAULT NULL COMMENT 'Dữ liệu thay đổi',
  `reason` text COMMENT 'Lý do',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_exception` (`schedule_id`,`exception_date`),
  KEY `idx_schedule_id` (`schedule_id`),
  CONSTRAINT `fk_exception_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ngoại lệ lịch lặp';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_exceptions`
--

LOCK TABLES `schedule_exceptions` WRITE;
/*!40000 ALTER TABLE `schedule_exceptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_exceptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_history`
--

DROP TABLE IF EXISTS `schedule_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_history` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `schedule_id` int unsigned NOT NULL,
  `action` enum('created','updated','cancelled','rescheduled','deleted') NOT NULL,
  `changed_by` int unsigned NOT NULL,
  `old_data` json DEFAULT NULL COMMENT 'Dữ liệu cũ',
  `new_data` json DEFAULT NULL COMMENT 'Dữ liệu mới',
  `change_summary` text COMMENT 'Tóm tắt thay đổi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_schedule` (`schedule_id`),
  KEY `idx_date` (`created_at`),
  KEY `fk_history_user` (`changed_by`),
  CONSTRAINT `fk_history_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử thay đổi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_history`
--

LOCK TABLES `schedule_history` WRITE;
/*!40000 ALTER TABLE `schedule_history` DISABLE KEYS */;
INSERT INTO `schedule_history` VALUES (1,7,'created',1,NULL,'{\"room\": \"\", \"color\": \"\", \"title\": \"aaa\", \"status\": \"confirmed\", \"location\": \"a\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"meeting\", \"is_all_day\": false, \"description\": \"aaaaaaaaa\", \"end_datetime\": \"2025-10-06T16:57\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-06T14:57\", \"reminder_minutes\": 15}','Tạo lịch mới','2025-10-05 07:57:57'),(2,7,'updated',1,'{\"id\": 7, \"icon\": null, \"room\": null, \"tags\": null, \"color\": null, \"notes\": null, \"title\": \"aaa\", \"status\": \"confirmed\", \"building\": null, \"location\": \"a\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_at\": \"2025-10-05T07:57:57.000Z\", \"created_by\": 1, \"event_type\": \"meeting\", \"is_all_day\": 0, \"updated_at\": \"2025-10-05T07:57:57.000Z\", \"attachments\": null, \"description\": \"aaaaaaaaa\", \"creator_name\": \"Quản trị viên\", \"end_datetime\": \"2025-10-06T09:57:00.000Z\", \"organizer_id\": 1, \"participants\": [], \"public_notes\": null, \"reminder_sent\": 0, \"organizer_name\": \"Quản trị viên\", \"start_datetime\": \"2025-10-06T07:57:00.000Z\", \"organizer_email\": \"admin@khoa-anninh.edu.vn\", \"recurrence_rule\": null, \"reminder_minutes\": 15, \"reminder_sent_at\": null, \"online_meeting_url\": null, \"recurrence_end_date\": null}','{\"room\": \"\", \"color\": \"\", \"title\": \"aaa\", \"status\": \"confirmed\", \"location\": \"a\", \"priority\": \"normal\", \"event_type\": \"meeting\", \"description\": \"aaaaaaaaa\", \"end_datetime\": \"2025-10-06T16:57\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-06T14:57\"}','Cập nhật lịch','2025-10-05 07:58:22'),(3,8,'created',1,NULL,'{\"room\": \"b10\", \"tags\": {\"lecturer\": \"sasa\"}, \"color\": \"#06b6d4\", \"notes\": \"aaaaa\", \"title\": \"sâssss\", \"status\": \"confirmed\", \"building\": \"C\", \"location\": \"sss\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"aaaaa\\nGiảng viên: sasa\\nĐịa điểm: b10 - C - sss\", \"end_datetime\": \"2025-10-05T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-05T07:30\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 08:56:50'),(4,9,'created',1,NULL,'{\"room\": \"21\", \"tags\": {\"class\": \"đ\", \"lecturer\": \"ddd\"}, \"color\": \"#06b6d4\", \"title\": \"dđ\", \"status\": \"confirmed\", \"building\": \"d\", \"location\": \"đ\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Lớp: đ\\nGiảng viên: ddd\\nĐịa điểm: 21 - d - đ\", \"end_datetime\": \"2025-10-03T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-03T07:30\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 09:41:15'),(5,10,'created',1,NULL,'{\"room\": \"21\", \"tags\": {\"class\": \"đ\", \"lecturer\": \"ddd\"}, \"color\": \"#06b6d4\", \"title\": \"dđ\", \"status\": \"confirmed\", \"building\": \"d\", \"location\": \"đ\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Lớp: đ\\nGiảng viên: ddd\\nĐịa điểm: 21 - d - đ\", \"end_datetime\": \"2025-10-03T18:42\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-03T13:32\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 09:41:15'),(6,11,'created',1,NULL,'{\"tags\": {\"class\": \"dddd\", \"lecturer\": \"Quản trị viên\"}, \"color\": \"#06b6d4\", \"title\": \"ddddd\", \"status\": \"confirmed\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Lớp: dddd\\nGiảng viên: Quản trị viên\", \"end_datetime\": \"2025-10-01T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-01T07:30\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 10:45:17'),(7,12,'created',1,NULL,'{\"tags\": {\"lecturer\": \"ddddddddd\"}, \"color\": \"#06b6d4\", \"title\": \"ddddddddd\", \"status\": \"confirmed\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Giảng viên: ddddddddd\", \"end_datetime\": \"2025-09-30T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-09-30T07:30\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 10:45:32'),(8,13,'created',1,NULL,'{\"room\": \"dsd\", \"tags\": {\"lecturer\": \"Quản trị viên\"}, \"color\": \"#06b6d4\", \"title\": \"dsdsdsd\", \"status\": \"confirmed\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Giảng viên: Quản trị viên\\nĐịa điểm: dsd\", \"end_datetime\": \"2025-09-29T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-09-29T07:30\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 10:45:44'),(9,14,'created',1,NULL,'{\"tags\": {\"lecturer\": \"Quản trị viên\"}, \"color\": \"#06b6d4\", \"title\": \"dsđ\", \"status\": \"confirmed\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Giảng viên: Quản trị viên\", \"end_datetime\": \"2025-10-02T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-02T07:30\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 10:45:56'),(10,15,'created',1,NULL,'{\"tags\": {\"lecturer\": \"dsâsđ\"}, \"color\": \"#06b6d4\", \"title\": \"ssasas\", \"status\": \"confirmed\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Giảng viên: dsâsđ\", \"end_datetime\": \"2025-10-13T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-13T07:30\", \"reminder_minutes\": 30}','Tạo lịch mới','2025-10-05 12:44:48');
/*!40000 ALTER TABLE `schedule_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_participants`
--

DROP TABLE IF EXISTS `schedule_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_participants` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `schedule_id` int unsigned NOT NULL COMMENT 'ID lịch công tác',
  `user_id` int unsigned NOT NULL COMMENT 'ID người tham gia',
  `role` enum('organizer','required','optional','viewer') DEFAULT 'required' COMMENT 'Vai trò',
  `status` enum('pending','accepted','declined','tentative','no_response') DEFAULT 'pending' COMMENT 'Trạng thái tham gia',
  `response_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian phản hồi',
  `notes` text COMMENT 'Ghi chú của người tham gia',
  `notification_sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participant` (`schedule_id`,`user_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `schedule_participants_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedule_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Người tham gia lịch';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_participants`
--

LOCK TABLES `schedule_participants` WRITE;
/*!40000 ALTER TABLE `schedule_participants` DISABLE KEYS */;
INSERT INTO `schedule_participants` VALUES (1,1,1,'organizer','accepted',NULL,NULL,0,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(2,2,1,'organizer','accepted',NULL,NULL,0,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(3,3,1,'organizer','accepted',NULL,NULL,0,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(4,4,1,'organizer','accepted',NULL,NULL,0,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(5,5,1,'organizer','accepted',NULL,NULL,0,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(6,6,1,'organizer','accepted',NULL,NULL,0,'2025-10-05 05:44:37','2025-10-05 05:44:37');
/*!40000 ALTER TABLE `schedule_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_templates`
--

DROP TABLE IF EXISTS `schedule_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_templates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `template_data` json NOT NULL COMMENT 'Dữ liệu mẫu',
  `category` varchar(100) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `usage_count` int DEFAULT '0',
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_category` (`category`),
  CONSTRAINT `schedule_templates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Mẫu sự kiện';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_templates`
--

LOCK TABLES `schedule_templates` WRITE;
/*!40000 ALTER TABLE `schedule_templates` DISABLE KEYS */;
INSERT INTO `schedule_templates` VALUES (1,'Họp khoa','Mẫu họp khoa định kỳ','{\"color\": \"#3b82f6\", \"location\": \"Phòng họp A\", \"event_type\": \"meeting\", \"duration_minutes\": 120, \"reminder_minutes\": 30}','meeting',1,0,1,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(2,'Kiểm tra giữa kỳ','Mẫu tổ chức kiểm tra','{\"color\": \"#ef4444\", \"priority\": \"high\", \"event_type\": \"exam\", \"duration_minutes\": 90, \"reminder_minutes\": 60}','exam',1,0,1,'2025-10-05 05:44:37','2025-10-05 05:44:37');
/*!40000 ALTER TABLE `schedule_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_types`
--

DROP TABLE IF EXISTS `schedule_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_types` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#3B82F6',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_types`
--

LOCK TABLES `schedule_types` WRITE;
/*!40000 ALTER TABLE `schedule_types` DISABLE KEYS */;
INSERT INTO `schedule_types` VALUES (1,'Họp khoa','HK','#3B82F6',NULL,1),(2,'Hội nghị','HN','#10B981',NULL,1),(3,'Đào tạo','DT','#F59E0B',NULL,1),(4,'Thi cử','TC','#EF4444',NULL,1),(5,'Sự kiện khác','SK','#8B5CF6',NULL,1);
/*!40000 ALTER TABLE `schedule_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `staff_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_id` mediumint unsigned DEFAULT NULL,
  `department_id` mediumint unsigned DEFAULT NULL,
  `employment_type` enum('full_time','part_time','contract','temporary') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'full_time',
  `hire_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F','O') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `salary` decimal(12,2) NOT NULL DEFAULT '0.00',
  `academic_rank` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_degree` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `years_experience` smallint unsigned NOT NULL DEFAULT '0',
  `publications_count` smallint unsigned NOT NULL DEFAULT '0',
  `status` enum('active','inactive','on_leave','terminated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_staff_user` (`user_id`),
  UNIQUE KEY `uq_staff_code` (`staff_code`),
  KEY `idx_staff_code` (`staff_code`),
  KEY `idx_staff_position` (`position_id`),
  KEY `idx_staff_department` (`department_id`),
  KEY `idx_staff_status` (`status`),
  KEY `idx_staff_hire_date` (`hire_date`),
  CONSTRAINT `fk_staff_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_staff_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,2,'GVTEST001',6,1,'full_time','2024-10-01',NULL,'1980-01-01','M','0123456789','Address',0.00,NULL,NULL,0,0,'active',NULL,'2025-10-08 05:27:56','2025-10-08 05:27:56'),(2,3,'zxxzxz',NULL,1,'full_time','2025-10-07',NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,0,0,'active',NULL,'2025-10-08 08:43:45','2025-10-08 08:43:45');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_awards`
--

DROP TABLE IF EXISTS `staff_awards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_awards` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `award_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `award_year` year DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_staff` (`staff_id`),
  KEY `idx_year` (`award_year`),
  CONSTRAINT `staff_awards_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_awards`
--

LOCK TABLES `staff_awards` WRITE;
/*!40000 ALTER TABLE `staff_awards` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_awards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_evaluation_summary`
--

DROP TABLE IF EXISTS `staff_evaluation_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_evaluation_summary` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `period_id` int unsigned NOT NULL,
  `total_score` decimal(6,2) DEFAULT NULL COMMENT 'Tổng điểm (0-100)',
  `final_grade` enum('excellent','good','average','poor','incomplete') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ranking_in_department` int DEFAULT NULL COMMENT 'Xếp hạng trong khoa/bộ môn',
  `ranking_in_school` int DEFAULT NULL COMMENT 'Xếp hạng toàn trường',
  `strengths` text COLLATE utf8mb4_unicode_ci COMMENT 'Điểm mạnh',
  `weaknesses` text COLLATE utf8mb4_unicode_ci COMMENT 'Điểm cần cải thiện',
  `recommendations` text COLLATE utf8mb4_unicode_ci COMMENT 'Đề xuất phát triển',
  `self_assessment_submitted` tinyint(1) DEFAULT '0',
  `manager_review_completed` tinyint(1) DEFAULT '0',
  `final_approved` tinyint(1) DEFAULT '0',
  `approved_by` int unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_period` (`staff_id`,`period_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_staff` (`staff_id`),
  KEY `idx_period` (`period_id`),
  KEY `idx_grade` (`final_grade`),
  KEY `idx_score` (`total_score`),
  CONSTRAINT `staff_evaluation_summary_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_evaluation_summary_ibfk_2` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_evaluation_summary_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tổng hợp kết quả đánh giá theo đợt';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_evaluation_summary`
--

LOCK TABLES `staff_evaluation_summary` WRITE;
/*!40000 ALTER TABLE `staff_evaluation_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_evaluation_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_evaluations`
--

DROP TABLE IF EXISTS `staff_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_evaluations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `period_id` int unsigned NOT NULL,
  `criteria_id` int unsigned NOT NULL,
  `self_assessment_value` decimal(10,2) DEFAULT NULL COMMENT 'Tự đánh giá',
  `self_assessment_note` text COLLATE utf8mb4_unicode_ci,
  `self_assessment_date` datetime DEFAULT NULL,
  `manager_assessment_value` decimal(10,2) DEFAULT NULL COMMENT 'Đánh giá của quản lý',
  `manager_assessment_note` text COLLATE utf8mb4_unicode_ci,
  `manager_id` int unsigned DEFAULT NULL,
  `manager_assessment_date` datetime DEFAULT NULL,
  `final_value` decimal(10,2) DEFAULT NULL COMMENT 'Giá trị chính thức',
  `grade` enum('excellent','good','average','poor') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evidence_files` json DEFAULT NULL COMMENT 'Link các file minh chứng',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_evaluation` (`staff_id`,`period_id`,`criteria_id`),
  KEY `criteria_id` (`criteria_id`),
  KEY `manager_id` (`manager_id`),
  KEY `idx_staff` (`staff_id`),
  KEY `idx_period` (`period_id`),
  KEY `idx_grade` (`grade`),
  CONSTRAINT `staff_evaluations_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_evaluations_ibfk_2` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_evaluations_ibfk_3` FOREIGN KEY (`criteria_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_evaluations_ibfk_4` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kết quả đánh giá chi tiết theo từng tiêu chí';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_evaluations`
--

LOCK TABLES `staff_evaluations` WRITE;
/*!40000 ALTER TABLE `staff_evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_interests`
--

DROP TABLE IF EXISTS `staff_interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_interests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `interest` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_interest` (`staff_id`,`interest`),
  KEY `idx_staff` (`staff_id`),
  CONSTRAINT `staff_interests_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_interests`
--

LOCK TABLES `staff_interests` WRITE;
/*!40000 ALTER TABLE `staff_interests` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_specializations`
--

DROP TABLE IF EXISTS `staff_specializations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_specializations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `specialization` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_specialization` (`staff_id`,`specialization`),
  KEY `idx_staff` (`staff_id`),
  CONSTRAINT `staff_specializations_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_specializations`
--

LOCK TABLES `staff_specializations` WRITE;
/*!40000 ALTER TABLE `staff_specializations` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_specializations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT 'Mã môn học',
  `name` varchar(255) NOT NULL COMMENT 'Tên môn học',
  `credits` int DEFAULT NULL COMMENT 'Số tín chỉ',
  `department` varchar(100) DEFAULT NULL COMMENT 'Khoa/Bộ môn',
  `theory_hours` int DEFAULT NULL COMMENT 'Số giờ lý thuyết',
  `practice_hours` int DEFAULT NULL COMMENT 'Số giờ thực hành',
  `exam_duration` int DEFAULT '90' COMMENT 'Thời gian thi (phút)',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Môn học';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'LAW101','Pháp luật đại cương',2,'Tự-nghiên',NULL,NULL,120,'active','2025-10-04 00:04:30','2025-10-04 00:04:30'),(2,'CS0001','Tài phương học',3,'PGS.Lan Hải G',NULL,NULL,75,'active','2025-10-04 00:04:30','2025-10-04 00:04:30'),(3,'ADM001','Luật hành chính',3,'Tự-Lan',NULL,NULL,110,'active','2025-10-04 00:04:30','2025-10-04 00:04:30'),(4,'PROC10','Tổ hợp kinh tế',3,'vầu-đập',NULL,NULL,95,'active','2025-10-04 00:04:30','2025-10-04 00:04:30'),(5,'CS201','Lập trình hướng đối tượng',3,'Khoa CNTT',30,15,90,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(6,'ADM301','Quản trị nhà nước',3,'Khoa Hành chính',36,9,120,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(7,'ECO101','Kinh tế vi mô',3,'Khoa Kinh tế',30,15,90,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(8,'SEC401','An ninh mạng',3,'Khoa An ninh',30,15,120,'active','2025-10-04 02:20:14','2025-10-04 02:20:14'),(9,'POL201','Lý luận chính trị',2,'Khoa Chính trị',24,6,90,'active','2025-10-04 02:20:14','2025-10-04 02:20:14');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teaching_custom_lecturers`
--

DROP TABLE IF EXISTS `teaching_custom_lecturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teaching_custom_lecturers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên hiển thị của giảng viên',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email liên hệ',
  `note` text COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú bổ sung',
  `anchor_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Khóa neo vào giảng viên khác',
  `created_by` int unsigned NOT NULL COMMENT 'Người tạo',
  `updated_by` int unsigned DEFAULT NULL COMMENT 'Người cập nhật cuối',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tcl_created_by` (`created_by`),
  KEY `fk_tcl_updated_by` (`updated_by`),
  KEY `idx_tcl_anchor` (`anchor_key`),
  CONSTRAINT `fk_tcl_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tcl_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Giảng viên tùy chỉnh cho lịch giảng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teaching_custom_lecturers`
--

LOCK TABLES `teaching_custom_lecturers` WRITE;
/*!40000 ALTER TABLE `teaching_custom_lecturers` DISABLE KEYS */;
INSERT INTO `teaching_custom_lecturers` VALUES (1,'dđ',NULL,NULL,'id:1',1,1,'2025-10-05 12:41:00','2025-10-05 12:41:00');
/*!40000 ALTER TABLE `teaching_custom_lecturers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teaching_schedules`
--

DROP TABLE IF EXISTS `teaching_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teaching_schedules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `lecturer_id` int unsigned NOT NULL,
  `course_id` int unsigned DEFAULT NULL,
  `class_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lesson` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `periods` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lecturer` (`lecturer_id`),
  KEY `idx_date` (`date`),
  KEY `idx_course` (`course_id`),
  CONSTRAINT `teaching_schedules_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teaching_schedules_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teaching_schedules`
--

LOCK TABLES `teaching_schedules` WRITE;
/*!40000 ALTER TABLE `teaching_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `teaching_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` mediumint unsigned NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_last_login` (`last_login`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@khoa-anninh.edu.vn','$2a$10$CZwv6RkqhI91hj3XNhBKpe94mE0598j2nPVxxihDpmYzpICnt4zAu','Quản trị viên',1,NULL,NULL,1,'2025-10-09 11:51:53',NULL,'2025-09-30 11:42:11','2025-10-09 04:51:53'),(2,'test_gv_001','test_gv_001@example.com','$2a$10$1GUpl2UnFAVoqYN4TRWh.etXqMhL1qXIi/KS15u6.bBVBnT9iVllW','Test GV 001',2,NULL,'0900000001',1,NULL,NULL,'2025-10-08 05:27:56','2025-10-08 05:27:56'),(3,'zxxzxz','vanloc9292@gmail.com','$2a$10$.LSaQplTY14wRDkY/wLl6.huI5N/rxjxvav1JiLP9GEMIqb6ZgW4m','xxxxxxxx',2,NULL,NULL,1,NULL,NULL,'2025-10-08 08:43:45','2025-10-08 08:43:45');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_users_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id,
        JSON_OBJECT('username', OLD.username, 'email', OLD.email, 'full_name', OLD.full_name),
        JSON_OBJECT('username', NEW.username, 'email', NEW.email, 'full_name', NEW.full_name));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `v_documents_full`
--

DROP TABLE IF EXISTS `v_documents_full`;
/*!50001 DROP VIEW IF EXISTS `v_documents_full`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_documents_full` AS SELECT 
 1 AS `id`,
 1 AS `document_number`,
 1 AS `title`,
 1 AS `document_type`,
 1 AS `direction`,
 1 AS `from_organization`,
 1 AS `to_organization`,
 1 AS `issue_date`,
 1 AS `received_date`,
 1 AS `priority`,
 1 AS `status`,
 1 AS `created_by_name`,
 1 AS `assigned_to_name`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_examination_sessions_with_grader`
--

DROP TABLE IF EXISTS `v_examination_sessions_with_grader`;
/*!50001 DROP VIEW IF EXISTS `v_examination_sessions_with_grader`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_examination_sessions_with_grader` AS SELECT 
 1 AS `id`,
 1 AS `period_id`,
 1 AS `subject_id`,
 1 AS `class_id`,
 1 AS `exam_code`,
 1 AS `exam_name`,
 1 AS `exam_date`,
 1 AS `exam_time`,
 1 AS `duration`,
 1 AS `room`,
 1 AS `building`,
 1 AS `student_count`,
 1 AS `expected_copies`,
 1 AS `actual_copies`,
 1 AS `grader_id`,
 1 AS `grading_deadline`,
 1 AS `reminder_sent`,
 1 AS `reminder_sent_at`,
 1 AS `link`,
 1 AS `exam_type`,
 1 AS `status`,
 1 AS `notes`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `period_name`,
 1 AS `subject_code`,
 1 AS `subject_name`,
 1 AS `class_code`,
 1 AS `class_name`,
 1 AS `grader_name`,
 1 AS `grader_email`,
 1 AS `days_until_deadline`,
 1 AS `deadline_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_legal_documents_full`
--

DROP TABLE IF EXISTS `v_legal_documents_full`;
/*!50001 DROP VIEW IF EXISTS `v_legal_documents_full`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_legal_documents_full` AS SELECT 
 1 AS `id`,
 1 AS `document_number`,
 1 AS `title`,
 1 AS `document_type`,
 1 AS `issuing_authority`,
 1 AS `issue_date`,
 1 AS `effective_date`,
 1 AS `expiry_date`,
 1 AS `status`,
 1 AS `subject`,
 1 AS `summary`,
 1 AS `keywords`,
 1 AS `replaced_by`,
 1 AS `related_documents`,
 1 AS `signer_name`,
 1 AS `signer_position`,
 1 AS `version`,
 1 AS `created_by`,
 1 AS `updated_by`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `created_by_username`,
 1 AS `updated_by_username`,
 1 AS `attachment_count`,
 1 AS `current_attachment_count`,
 1 AS `file_types`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_projects_full`
--

DROP TABLE IF EXISTS `v_projects_full`;
/*!50001 DROP VIEW IF EXISTS `v_projects_full`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_projects_full` AS SELECT 
 1 AS `id`,
 1 AS `project_code`,
 1 AS `title`,
 1 AS `category_name`,
 1 AS `leader_code`,
 1 AS `leader_name`,
 1 AS `start_date`,
 1 AS `end_date`,
 1 AS `budget`,
 1 AS `status`,
 1 AS `progress`,
 1 AS `team_size`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_staff_full`
--

DROP TABLE IF EXISTS `v_staff_full`;
/*!50001 DROP VIEW IF EXISTS `v_staff_full`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_staff_full` AS SELECT 
 1 AS `id`,
 1 AS `staff_code`,
 1 AS `full_name`,
 1 AS `email`,
 1 AS `phone`,
 1 AS `position_name`,
 1 AS `department_name`,
 1 AS `employment_type`,
 1 AS `hire_date`,
 1 AS `academic_rank`,
 1 AS `academic_degree`,
 1 AS `years_experience`,
 1 AS `publications_count`,
 1 AS `status`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `work_journal_days`
--

DROP TABLE IF EXISTS `work_journal_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_journal_days` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `journal_id` int unsigned NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `main_focus` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `progress` tinyint unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_journal_day` (`journal_id`,`day_of_week`),
  KEY `idx_journal` (`journal_id`),
  CONSTRAINT `work_journal_days_ibfk_1` FOREIGN KEY (`journal_id`) REFERENCES `work_journals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_journal_days`
--

LOCK TABLES `work_journal_days` WRITE;
/*!40000 ALTER TABLE `work_journal_days` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_journal_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_journal_tasks`
--

DROP TABLE IF EXISTS `work_journal_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_journal_tasks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `day_id` int unsigned NOT NULL,
  `task_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `order_index` tinyint unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_day` (`day_id`),
  CONSTRAINT `work_journal_tasks_ibfk_1` FOREIGN KEY (`day_id`) REFERENCES `work_journal_days` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_journal_tasks`
--

LOCK TABLES `work_journal_tasks` WRITE;
/*!40000 ALTER TABLE `work_journal_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_journal_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_journals`
--

DROP TABLE IF EXISTS `work_journals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_journals` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `week_start` date NOT NULL,
  `week_end` date NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weekly_report` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','reviewed','approved') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `reviewer_id` int unsigned DEFAULT NULL,
  `review_comment` text COLLATE utf8mb4_unicode_ci,
  `head_comment` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_week` (`user_id`,`week_start`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_week` (`week_start`),
  KEY `idx_status` (`status`),
  CONSTRAINT `work_journals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `work_journals_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_journals`
--

LOCK TABLES `work_journals` WRITE;
/*!40000 ALTER TABLE `work_journals` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_journals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_schedules`
--

DROP TABLE IF EXISTS `work_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_schedules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT 'Tiêu đề sự kiện',
  `description` text COMMENT 'Mô tả chi tiết',
  `event_type` enum('meeting','teaching','exam','admin','ceremony','training','other') DEFAULT 'other' COMMENT 'Loại sự kiện',
  `start_datetime` datetime NOT NULL COMMENT 'Thời gian bắt đầu',
  `end_datetime` datetime NOT NULL COMMENT 'Thời gian kết thúc',
  `is_all_day` tinyint(1) DEFAULT '0' COMMENT 'Sự kiện cả ngày',
  `timezone` varchar(50) DEFAULT 'Asia/Ho_Chi_Minh' COMMENT 'Múi giờ',
  `recurrence_rule` varchar(255) DEFAULT NULL COMMENT 'Quy tắc lặp lại (iCal RRULE)',
  `recurrence_end_date` date DEFAULT NULL COMMENT 'Ngày kết thúc lặp',
  `location` varchar(255) DEFAULT NULL COMMENT 'Địa điểm',
  `room` varchar(100) DEFAULT NULL COMMENT 'Phòng',
  `building` varchar(100) DEFAULT NULL COMMENT 'Tòa nhà',
  `online_meeting_url` varchar(500) DEFAULT NULL COMMENT 'Link họp online',
  `organizer_id` int unsigned NOT NULL COMMENT 'Người tổ chức',
  `status` enum('draft','confirmed','cancelled','completed','postponed') DEFAULT 'confirmed' COMMENT 'Trạng thái',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal' COMMENT 'Độ ưu tiên',
  `color` varchar(20) DEFAULT NULL COMMENT 'Màu sắc (hex)',
  `icon` varchar(50) DEFAULT NULL COMMENT 'Icon (FontAwesome class)',
  `tags` json DEFAULT NULL COMMENT 'Tags/Labels',
  `reminder_minutes` int DEFAULT '15' COMMENT 'Nhắc trước (phút)',
  `reminder_sent` tinyint(1) DEFAULT '0' COMMENT 'Đã gửi nhắc nhở',
  `reminder_sent_at` datetime DEFAULT NULL COMMENT 'Thời điểm gửi nhắc',
  `attachments` json DEFAULT NULL COMMENT 'File đính kèm',
  `notes` text COMMENT 'Ghi chú nội bộ',
  `public_notes` text COMMENT 'Ghi chú công khai',
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_datetime` (`start_datetime`,`end_datetime`),
  KEY `idx_type` (`event_type`),
  KEY `idx_status` (`status`),
  KEY `idx_organizer` (`organizer_id`),
  KEY `idx_date_range` (`start_datetime`,`end_datetime`,`status`),
  CONSTRAINT `work_schedules_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `work_schedules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch công tác';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_schedules`
--

LOCK TABLES `work_schedules` WRITE;
/*!40000 ALTER TABLE `work_schedules` DISABLE KEYS */;
INSERT INTO `work_schedules` VALUES (1,'Họp khoa đầu tuần','Họp tổng kết công việc tuần trước và kế hoạch tuần tới','meeting','2025-10-06 08:00:00','2025-10-06 10:00:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'Phòng họp A','A101','Nhà A',NULL,1,'confirmed','high','#3b82f6','fa-users',NULL,30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(2,'Kiểm tra giữa kỳ - Toán cao cấp','Kiểm tra 45 phút - Chương 1, 2, 3','exam','2025-10-08 13:30:00','2025-10-08 15:00:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'Gi강 đường B','B201','Nhà B',NULL,1,'confirmed','urgent','#ef4444','fa-file-alt',NULL,60,0,NULL,NULL,NULL,NULL,1,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(3,'Lễ khai giảng năm học mới','Lễ khai giảng và tổng kết năm học','ceremony','2025-10-10 07:30:00','2025-10-10 11:00:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'Hội trường lớn','Hội trường','Nhà C',NULL,1,'confirmed','high','#8b5cf6','fa-flag','[\"quan-trọng\", \"toàn-trường\"]',120,0,NULL,NULL,NULL,NULL,1,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(4,'Đào tạo sử dụng phần mềm quản lý','Hướng dẫn sử dụng hệ thống quản lý giáo vụ mới','training','2025-10-12 14:00:00','2025-10-12 17:00:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'Phòng máy','PM01','Nhà D','https://meet.google.com/abc-defg-hij',1,'confirmed','normal','#10b981','fa-laptop-code',NULL,45,0,NULL,NULL,NULL,NULL,1,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(5,'Họp Hội đồng khoa học','Xét duyệt đề tài nghiên cứu khoa học','admin','2025-10-15 09:00:00','2025-10-15 11:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'Phòng Hội đồng','A301','Nhà A',NULL,1,'confirmed','normal','#f59e0b','fa-briefcase',NULL,30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(6,'Dạy - Lập trình web','Buổi học JavaScript nâng cao','teaching','2025-10-07 13:30:00','2025-10-07 15:30:00',0,'Asia/Ho_Chi_Minh','FREQ=WEEKLY;BYDAY=MO,WE,FR','2025-12-31','Phòng học','C102','Nhà C',NULL,1,'confirmed','normal','#06b6d4','fa-chalkboard-teacher',NULL,15,0,NULL,NULL,NULL,NULL,1,'2025-10-05 05:44:37','2025-10-05 05:44:37'),(7,'aaa','aaaaaaaaa','meeting','2025-10-06 14:57:00','2025-10-06 16:57:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'a','',NULL,NULL,1,'confirmed','normal','',NULL,NULL,15,0,NULL,NULL,NULL,NULL,1,'2025-10-05 07:57:57','2025-10-05 07:58:22'),(8,'sâssss','aaaaa\nGiảng viên: sasa\nĐịa điểm: b10 - C - sss','teaching','2025-10-05 07:30:00','2025-10-05 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'sss','b10','C',NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"lecturer\": \"sasa\"}',30,0,NULL,NULL,'aaaaa',NULL,1,'2025-10-05 08:56:50','2025-10-05 08:56:50'),(9,'dđ','Lớp: đ\nGiảng viên: ddd\nĐịa điểm: 21 - d - đ','teaching','2025-10-03 07:30:00','2025-10-03 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'đ','21','d',NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"class\": \"đ\", \"lecturer\": \"ddd\"}',30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 09:41:15','2025-10-05 09:41:15'),(10,'dđ','Lớp: đ\nGiảng viên: ddd\nĐịa điểm: 21 - d - đ','teaching','2025-10-03 13:32:00','2025-10-03 18:42:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,'đ','21','d',NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"class\": \"đ\", \"lecturer\": \"ddd\"}',30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 09:41:15','2025-10-05 09:41:15'),(11,'ddddd','Lớp: dddd\nGiảng viên: Quản trị viên','teaching','2025-10-01 07:30:00','2025-10-01 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,NULL,NULL,NULL,NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"class\": \"dddd\", \"lecturer\": \"Quản trị viên\"}',30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 10:45:17','2025-10-05 10:45:17'),(12,'ddddddddd','Giảng viên: ddddddddd','teaching','2025-09-30 07:30:00','2025-09-30 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,NULL,NULL,NULL,NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"lecturer\": \"ddddddddd\"}',30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 10:45:32','2025-10-05 10:45:32'),(13,'dsdsdsd','Giảng viên: Quản trị viên\nĐịa điểm: dsd','teaching','2025-09-29 07:30:00','2025-09-29 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,NULL,'dsd',NULL,NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"lecturer\": \"Quản trị viên\"}',30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 10:45:44','2025-10-05 10:45:44'),(14,'dsđ','Giảng viên: Quản trị viên','teaching','2025-10-02 07:30:00','2025-10-02 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,NULL,NULL,NULL,NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"lecturer\": \"Quản trị viên\"}',30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 10:45:56','2025-10-05 10:45:56'),(15,'ssasas','Giảng viên: dsâsđ','teaching','2025-10-13 07:30:00','2025-10-13 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,NULL,NULL,NULL,NULL,1,'confirmed','normal','#06b6d4',NULL,'{\"lecturer\": \"dsâsđ\"}',30,0,NULL,NULL,NULL,NULL,1,'2025-10-05 12:44:48','2025-10-05 12:44:48');
/*!40000 ALTER TABLE `work_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workbook_entries`
--

DROP TABLE IF EXISTS `workbook_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workbook_entries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `workbook_id` int unsigned NOT NULL,
  `day_of_week` tinyint(1) NOT NULL COMMENT 'Thứ trong tuần: 1=Thứ 2, 2=Thứ 3, ..., 7=Chủ nhật',
  `main_focus` text COLLATE utf8mb4_unicode_ci COMMENT 'Mục tiêu chính trong ngày',
  `tasks` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Danh sách công việc cần làm',
  `notes` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú bổ sung',
  `progress` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Tiến độ hoàn thành (%): 0-100',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_workbook_day` (`workbook_id`,`day_of_week`),
  KEY `idx_day_of_week` (`day_of_week`),
  KEY `idx_progress` (`progress`),
  KEY `idx_workbook_entries_updated` (`updated_at`),
  CONSTRAINT `workbook_entries_ibfk_1` FOREIGN KEY (`workbook_id`) REFERENCES `workbooks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_day_of_week` CHECK ((`day_of_week` between 1 and 7)),
  CONSTRAINT `chk_progress_range` CHECK ((`progress` between 0 and 100))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết công việc từng ngày trong tuần';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workbook_entries`
--

LOCK TABLES `workbook_entries` WRITE;
/*!40000 ALTER TABLE `workbook_entries` DISABLE KEYS */;
INSERT INTO `workbook_entries` VALUES (1,41,2,'','[{\"text\":\"🟡 ffffffffffffffffff\",\"completed\":false}]','',0,'2025-10-03 16:25:30','2025-10-03 16:25:30'),(3,42,1,'','[{\"text\":\"ccccccccccccc\",\"completed\":false}]','',0,'2025-10-03 16:26:11','2025-10-03 16:26:11'),(7,46,1,'Tham dự các cuộc họp và thảo luận công việc','[\"ffffffffffffffff\"]','',0,'2025-10-03 16:39:21','2025-10-03 16:39:21'),(8,73,7,'Tham dự các cuộc họp và thảo luận công việc','[\"nbbbbbbbbbbbbbb\",\"jjjjjjjjjjjjjj\"]','',0,'2025-10-03 17:06:16','2025-10-03 17:06:16'),(9,73,1,'Giảng dạy','[\"jjjjjjjjjjjjjjj\"]','',0,'2025-10-03 17:07:04','2025-10-03 17:07:04'),(10,74,7,'Giảng dạy','[\"gggggggggg\"]','',0,'2025-10-03 17:14:00','2025-10-03 17:14:00'),(11,75,5,'Tham dự các cuộc họp và thảo luận công việc','[]','',0,'2025-10-03 17:15:12','2025-10-03 17:15:12'),(12,77,1,'Tham dự các cuộc họp và thảo luận công việc','[]','',0,'2025-10-03 17:20:45','2025-10-03 17:20:45'),(13,77,7,'Giảng sạy','[]','',0,'2025-10-03 17:21:07','2025-10-03 17:21:07'),(15,78,1,'Tham dự các cuộc họp và thảo luận công việc','[\"aaaaaaaaaa\"]','',0,'2025-10-03 17:29:36','2025-10-03 17:29:36'),(16,80,5,'Tham dự các cuộc họp và thảo luận công việc','[\"aaaaaaaaaa\"]','',0,'2025-10-03 17:33:45','2025-10-03 17:33:45'),(17,82,7,'Tham dự các cuộc họp và thảo luận công việc','[]','',0,'2025-10-04 02:24:58','2025-10-04 02:24:58'),(18,84,1,'','[{\"text\":\"🟡 ggggggggggggggg\",\"completed\":false}]','',0,'2025-10-04 02:27:35','2025-10-04 02:27:35'),(20,91,1,'','[{\"text\":\"🟡 ssssssssssss\",\"completed\":false}]','',0,'2025-10-04 11:30:17','2025-10-04 11:30:17'),(21,92,1,'','[{\"text\":\"aaaaaaaaaa\",\"completed\":false}]','',0,'2025-10-04 11:30:30','2025-10-04 11:30:30'),(22,95,1,'','[{\"text\":\"sâsa\",\"completed\":false}]','',0,'2025-10-04 12:51:04','2025-10-04 12:51:04'),(24,96,1,'','[{\"text\":\"🟡 ddddd\",\"completed\":false},{\"text\":\"ddddđ\",\"completed\":false}]','',0,'2025-10-04 13:04:09','2025-10-04 13:04:21'),(25,97,1,'','[{\"text\":\"ddddđ\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"ssssssss\",\"completed\":false,\"priority\":\"medium\"}]','',0,'2025-10-04 13:31:49','2025-10-04 14:45:40'),(26,97,2,'','[{\"text\":\"xzzzz\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"xxxxxxx\",\"completed\":false,\"priority\":\"medium\"}]','',0,'2025-10-04 15:05:12','2025-10-04 15:05:16'),(27,98,1,'','[{\"text\":\"mmmmmmmmmmm\",\"completed\":false,\"priority\":\"medium\"}]','',0,'2025-10-04 15:36:16','2025-10-04 15:36:16'),(28,81,7,'Tham dự các cuộc họp và thảo luận công việc','[\"Chuẩn bị tài liệu họp\",\"Tham dự họp ban lãnh đạo\",\"Ghi nhận các quyết định quan trọng\",\"Báo cáo tiến độ công việc\"]','',0,'2025-10-04 23:59:14','2025-10-04 23:59:14'),(29,97,7,'Giảng dạy và hướng dẫn sinh viên','[\"Chuẩn bị bài giảng\",\"Giảng dạy trên lớp\",\"Chấm bài tập/kiểm tra\",\"Tư vấn học tập cho sinh viên\"]','',0,'2025-10-05 00:01:49','2025-10-05 00:01:49');
/*!40000 ALTER TABLE `workbook_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workbooks`
--

DROP TABLE IF EXISTS `workbooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workbooks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `week_start` date NOT NULL COMMENT 'Ngày bắt đầu tuần (thứ 2)',
  `week_end` date NOT NULL COMMENT 'Ngày kết thúc tuần (chủ nhật)',
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'Trạng thái: bản nháp, đã gửi, đã duyệt, từ chối',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `quick_notes` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú nhanh cho tuần',
  PRIMARY KEY (`id`),
  KEY `idx_user_week` (`user_id`,`week_start`,`week_end`),
  KEY `idx_status` (`status`),
  KEY `idx_workbooks_date_range` (`week_start`,`week_end`),
  CONSTRAINT `workbooks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_week_dates` CHECK ((`week_end` >= `week_start`))
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sổ tay công tác theo tuần';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workbooks`
--

LOCK TABLES `workbooks` WRITE;
/*!40000 ALTER TABLE `workbooks` DISABLE KEYS */;
INSERT INTO `workbooks` VALUES (1,1,'2025-09-29','2025-10-05','draft','2025-10-02 14:14:15','2025-10-02 14:14:15',NULL),(2,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:12:01','2025-10-03 14:12:01',NULL),(3,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:12:03','2025-10-03 14:12:03',NULL),(4,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:12:04','2025-10-03 14:12:04',NULL),(5,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:12:39','2025-10-03 14:12:39',NULL),(6,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:12:44','2025-10-03 14:12:44',NULL),(7,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:13:01','2025-10-03 14:13:01',NULL),(8,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:13:03','2025-10-03 14:13:03',NULL),(9,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:14:33','2025-10-03 14:14:33',NULL),(10,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:14:36','2025-10-03 14:14:36',NULL),(11,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:18:37','2025-10-03 14:18:37',NULL),(12,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:18:38','2025-10-03 14:18:38',NULL),(13,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:18:39','2025-10-03 14:18:39',NULL),(14,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:18:40','2025-10-03 14:18:40',NULL),(15,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:18:41','2025-10-03 14:18:41',NULL),(16,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:18:58','2025-10-03 14:18:58',NULL),(17,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:19:00','2025-10-03 14:19:00',NULL),(18,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:19:01','2025-10-03 14:19:01',NULL),(19,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:19:02','2025-10-03 14:19:02',NULL),(20,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:19:05','2025-10-03 14:19:05',NULL),(21,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:23:17','2025-10-03 14:23:17',NULL),(22,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:28:58','2025-10-03 14:28:58',NULL),(23,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:32:56','2025-10-03 14:32:56',NULL),(24,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:35:24','2025-10-03 14:35:24',NULL),(25,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:37:44','2025-10-03 14:37:44',NULL),(26,1,'2025-09-29','2025-10-05','draft','2025-10-03 14:50:27','2025-10-03 14:50:27',NULL),(27,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:15:47','2025-10-03 15:15:47',NULL),(28,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:17:33','2025-10-03 15:17:33',NULL),(29,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:35:10','2025-10-03 15:35:10',NULL),(30,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:35:12','2025-10-03 15:35:12',NULL),(31,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:43:06','2025-10-03 15:43:06',NULL),(32,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:48:32','2025-10-03 15:48:32',NULL),(33,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:52:03','2025-10-03 15:52:03',NULL),(34,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:52:49','2025-10-03 15:52:49',NULL),(35,1,'2025-09-29','2025-10-05','draft','2025-10-03 15:52:58','2025-10-03 15:52:58',NULL),(36,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:01:54','2025-10-03 16:01:54',NULL),(37,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:09:42','2025-10-03 16:09:42',NULL),(38,1,'2025-10-10','2025-10-16','draft','2025-10-03 16:09:46','2025-10-03 16:09:46',NULL),(39,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:16:37','2025-10-03 16:16:37',NULL),(40,1,'2025-10-10','2025-10-16','draft','2025-10-03 16:16:42','2025-10-03 16:16:42',NULL),(41,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:25:20','2025-10-03 16:25:20',NULL),(42,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:25:55','2025-10-03 16:25:55',NULL),(43,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:38:23','2025-10-03 16:38:23',NULL),(44,1,'2025-10-12','2025-10-18','draft','2025-10-03 16:38:30','2025-10-03 16:38:30',NULL),(45,1,'2025-10-11','2025-10-17','draft','2025-10-03 16:38:35','2025-10-03 16:38:35',NULL),(46,1,'2025-10-10','2025-10-16','draft','2025-10-03 16:38:43','2025-10-03 16:38:43',NULL),(47,1,'2025-10-10','2025-10-16','draft','2025-10-03 16:40:16','2025-10-03 16:40:16',NULL),(48,1,'2025-10-09','2025-10-15','draft','2025-10-03 16:41:22','2025-10-03 16:41:22',NULL),(49,1,'2025-10-08','2025-10-14','draft','2025-10-03 16:41:26','2025-10-03 16:41:26',NULL),(50,1,'2025-10-07','2025-10-13','draft','2025-10-03 16:41:38','2025-10-03 16:41:38',NULL),(51,1,'2025-10-06','2025-10-12','draft','2025-10-03 16:41:48','2025-10-03 16:41:48',NULL),(52,1,'2025-10-05','2025-10-11','draft','2025-10-03 16:41:53','2025-10-03 16:41:53',NULL),(53,1,'2025-10-04','2025-10-10','draft','2025-10-03 16:42:04','2025-10-03 16:42:04',NULL),(54,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:45:06','2025-10-03 16:45:06',NULL),(55,1,'2025-10-12','2025-10-18','draft','2025-10-03 16:45:18','2025-10-03 16:45:18',NULL),(56,1,'2025-10-11','2025-10-17','draft','2025-10-03 16:45:24','2025-10-03 16:45:24',NULL),(57,1,'2025-10-10','2025-10-16','draft','2025-10-03 16:45:31','2025-10-03 16:45:31',NULL),(58,1,'2025-10-09','2025-10-15','draft','2025-10-03 16:45:38','2025-10-03 16:45:38',NULL),(59,1,'2025-10-10','2025-10-16','draft','2025-10-03 16:45:49','2025-10-03 16:45:49',NULL),(60,1,'2025-10-09','2025-10-15','draft','2025-10-03 16:45:56','2025-10-03 16:45:56',NULL),(61,1,'2025-10-22','2025-10-28','draft','2025-10-03 16:46:43','2025-10-03 16:46:43',NULL),(62,1,'2025-10-29','2025-11-04','draft','2025-10-03 16:54:34','2025-10-03 16:54:34',NULL),(63,1,'2025-10-22','2025-10-28','draft','2025-10-03 16:54:39','2025-10-03 16:54:39',NULL),(64,1,'2025-10-15','2025-10-21','draft','2025-10-03 16:54:44','2025-10-03 16:54:44',NULL),(65,1,'2025-10-08','2025-10-14','draft','2025-10-03 16:54:53','2025-10-03 16:54:53',NULL),(66,1,'2025-10-01','2025-10-07','draft','2025-10-03 16:54:58','2025-10-03 16:54:58',NULL),(67,1,'2025-10-08','2025-10-14','draft','2025-10-03 16:55:14','2025-10-03 16:55:14',NULL),(68,1,'2025-10-01','2025-10-07','draft','2025-10-03 16:55:27','2025-10-03 16:55:27',NULL),(69,1,'2025-09-24','2025-09-30','draft','2025-10-03 16:55:32','2025-10-03 16:55:32',NULL),(70,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:56:24','2025-10-03 16:56:24',NULL),(71,1,'2025-09-22','2025-09-28','draft','2025-10-03 16:56:37','2025-10-03 16:56:37',NULL),(72,1,'2025-09-29','2025-10-05','draft','2025-10-03 16:56:43','2025-10-03 16:56:43',NULL),(73,1,'2025-10-06','2025-10-12','draft','2025-10-03 16:56:48','2025-10-03 16:56:48',NULL),(74,1,'2025-09-28','2025-10-04','draft','2025-10-03 17:13:37','2025-10-03 17:13:37',NULL),(75,1,'2025-09-28','2025-10-04','draft','2025-10-03 17:14:01','2025-10-03 17:14:01',NULL),(76,1,'2025-09-28','2025-10-04','draft','2025-10-03 17:15:13','2025-10-03 17:15:13',NULL),(77,1,'2025-09-21','2025-09-27','draft','2025-10-03 17:20:22','2025-10-03 17:20:22',NULL),(78,1,'2025-09-28','2025-10-04','draft','2025-10-03 17:29:09','2025-10-03 17:29:09',NULL),(79,1,'2025-09-28','2025-10-04','draft','2025-10-03 17:29:37','2025-10-03 17:29:37',NULL),(80,1,'2025-09-28','2025-10-04','draft','2025-10-03 17:33:21','2025-10-03 17:33:21',NULL),(81,1,'2025-09-28','2025-10-04','draft','2025-10-03 17:33:46','2025-10-03 17:33:46',NULL),(82,1,'2025-09-29','2025-10-05','draft','2025-10-04 02:24:42','2025-10-04 02:24:42',NULL),(83,1,'2025-09-29','2025-10-05','draft','2025-10-04 02:24:59','2025-10-04 02:24:59',NULL),(84,1,'2025-09-29','2025-10-05','draft','2025-10-04 02:25:33','2025-10-04 02:25:33',NULL),(85,1,'2025-09-29','2025-10-05','draft','2025-10-04 02:27:39','2025-10-04 02:27:39',NULL),(86,1,'2025-09-29','2025-10-05','draft','2025-10-04 10:56:33','2025-10-04 10:56:33',NULL),(87,1,'2025-09-29','2025-10-05','draft','2025-10-04 10:59:07','2025-10-04 10:59:07',NULL),(88,1,'2025-09-29','2025-10-05','draft','2025-10-04 11:14:38','2025-10-04 11:14:38',NULL),(89,1,'2025-09-29','2025-10-05','draft','2025-10-04 11:23:56','2025-10-04 11:23:56','Test quick notes at 2025-10-04T11:23:56.977Z\n- Họp ban lãnh đạo sáng thứ 2\n- Chuẩn bị tài liệu giảng dạy\n- Viết báo cáo tuần'),(90,1,'2025-09-29','2025-10-05','draft','2025-10-04 11:25:43','2025-10-04 11:25:43','Test quick notes at 2025-10-04T11:25:43.085Z\n- Họp ban lãnh đạo sáng thứ 2\n- Chuẩn bị tài liệu giảng dạy\n- Viết báo cáo tuần'),(91,1,'2025-09-29','2025-10-05','draft','2025-10-04 11:30:12','2025-10-04 11:30:12',NULL),(92,1,'2025-09-29','2025-10-05','draft','2025-10-04 11:30:19','2025-10-04 11:30:19',NULL),(93,1,'2025-09-29','2025-10-05','draft','2025-10-04 11:30:32','2025-10-04 11:30:32',NULL),(94,1,'2025-09-29','2025-10-05','draft','2025-10-04 12:32:36','2025-10-04 12:32:36',NULL),(95,1,'2025-09-29','2025-10-05','draft','2025-10-04 12:50:55','2025-10-04 12:50:55',NULL),(96,1,'2025-09-29','2025-10-05','draft','2025-10-04 13:03:57','2025-10-04 13:03:57',NULL),(97,1,'2025-09-29','2025-10-05','draft','2025-10-04 13:04:56','2025-10-04 13:04:56',NULL),(98,1,'2025-09-15','2025-09-21','draft','2025-10-04 15:36:04','2025-10-04 15:36:04',NULL),(99,1,'2025-08-25','2025-08-31','draft','2025-10-04 15:36:31','2025-10-04 15:36:31',NULL);
/*!40000 ALTER TABLE `workbooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_documents_full`
--

/*!50001 DROP VIEW IF EXISTS `v_documents_full`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_documents_full` AS select `d`.`id` AS `id`,`d`.`document_number` AS `document_number`,`d`.`title` AS `title`,`dt`.`name` AS `document_type`,`d`.`direction` AS `direction`,`org_from`.`name` AS `from_organization`,`org_to`.`name` AS `to_organization`,`d`.`issue_date` AS `issue_date`,`d`.`received_date` AS `received_date`,`d`.`priority` AS `priority`,`d`.`status` AS `status`,`u_created`.`full_name` AS `created_by_name`,`u_assigned`.`full_name` AS `assigned_to_name`,`d`.`created_at` AS `created_at` from (((((`documents` `d` left join `document_types` `dt` on((`d`.`type_id` = `dt`.`id`))) left join `organizations` `org_from` on((`d`.`from_org_id` = `org_from`.`id`))) left join `organizations` `org_to` on((`d`.`to_org_id` = `org_to`.`id`))) left join `users` `u_created` on((`d`.`created_by` = `u_created`.`id`))) left join `users` `u_assigned` on((`d`.`assigned_to` = `u_assigned`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_examination_sessions_with_grader`
--

/*!50001 DROP VIEW IF EXISTS `v_examination_sessions_with_grader`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_examination_sessions_with_grader` AS select `es`.`id` AS `id`,`es`.`period_id` AS `period_id`,`es`.`subject_id` AS `subject_id`,`es`.`class_id` AS `class_id`,`es`.`exam_code` AS `exam_code`,`es`.`exam_name` AS `exam_name`,`es`.`exam_date` AS `exam_date`,`es`.`exam_time` AS `exam_time`,`es`.`duration` AS `duration`,`es`.`room` AS `room`,`es`.`building` AS `building`,`es`.`student_count` AS `student_count`,`es`.`expected_copies` AS `expected_copies`,`es`.`actual_copies` AS `actual_copies`,`es`.`grader_id` AS `grader_id`,`es`.`grading_deadline` AS `grading_deadline`,`es`.`reminder_sent` AS `reminder_sent`,`es`.`reminder_sent_at` AS `reminder_sent_at`,`es`.`link` AS `link`,`es`.`exam_type` AS `exam_type`,`es`.`status` AS `status`,`es`.`notes` AS `notes`,`es`.`created_at` AS `created_at`,`es`.`updated_at` AS `updated_at`,`ep`.`name` AS `period_name`,`s`.`code` AS `subject_code`,`s`.`name` AS `subject_name`,`c`.`code` AS `class_code`,`c`.`name` AS `class_name`,`u`.`full_name` AS `grader_name`,`u`.`email` AS `grader_email`,(to_days(`es`.`grading_deadline`) - to_days(curdate())) AS `days_until_deadline`,(case when (`es`.`grading_deadline` is null) then 'no_deadline' when (curdate() > `es`.`grading_deadline`) then 'overdue' when ((to_days(`es`.`grading_deadline`) - to_days(curdate())) <= 3) then 'urgent' when ((to_days(`es`.`grading_deadline`) - to_days(curdate())) <= 7) then 'soon' else 'normal' end) AS `deadline_status` from ((((`examination_sessions` `es` left join `examination_periods` `ep` on((`es`.`period_id` = `ep`.`id`))) left join `subjects` `s` on((`es`.`subject_id` = `s`.`id`))) left join `classes` `c` on((`es`.`class_id` = `c`.`id`))) left join `users` `u` on((`es`.`grader_id` = `u`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_legal_documents_full`
--

/*!50001 DROP VIEW IF EXISTS `v_legal_documents_full`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_legal_documents_full` AS select `ld`.`id` AS `id`,`ld`.`document_number` AS `document_number`,`ld`.`title` AS `title`,`ld`.`document_type` AS `document_type`,`ld`.`issuing_authority` AS `issuing_authority`,`ld`.`issue_date` AS `issue_date`,`ld`.`effective_date` AS `effective_date`,`ld`.`expiry_date` AS `expiry_date`,`ld`.`status` AS `status`,`ld`.`subject` AS `subject`,`ld`.`summary` AS `summary`,`ld`.`keywords` AS `keywords`,`ld`.`replaced_by` AS `replaced_by`,`ld`.`related_documents` AS `related_documents`,`ld`.`signer_name` AS `signer_name`,`ld`.`signer_position` AS `signer_position`,`ld`.`version` AS `version`,`ld`.`created_by` AS `created_by`,`ld`.`updated_by` AS `updated_by`,`ld`.`created_at` AS `created_at`,`ld`.`updated_at` AS `updated_at`,`u1`.`username` AS `created_by_username`,`u2`.`username` AS `updated_by_username`,count(distinct `lda`.`id`) AS `attachment_count`,sum((case when (`lda`.`is_current` = 1) then 1 else 0 end)) AS `current_attachment_count`,group_concat(distinct (case when (`lda`.`is_current` = 1) then `lda`.`mime_type` end) separator ',') AS `file_types` from (((`legal_documents` `ld` left join `users` `u1` on((`ld`.`created_by` = `u1`.`id`))) left join `users` `u2` on((`ld`.`updated_by` = `u2`.`id`))) left join `legal_document_attachments` `lda` on((`ld`.`id` = `lda`.`document_id`))) group by `ld`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_projects_full`
--

/*!50001 DROP VIEW IF EXISTS `v_projects_full`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_projects_full` AS select `p`.`id` AS `id`,`p`.`project_code` AS `project_code`,`p`.`title` AS `title`,`pc`.`name` AS `category_name`,`s`.`staff_code` AS `leader_code`,`u`.`full_name` AS `leader_name`,`p`.`start_date` AS `start_date`,`p`.`end_date` AS `end_date`,`p`.`budget` AS `budget`,`p`.`status` AS `status`,`p`.`progress` AS `progress`,count(`pm`.`staff_id`) AS `team_size` from ((((`projects` `p` left join `project_categories` `pc` on((`p`.`category_id` = `pc`.`id`))) left join `staff` `s` on((`p`.`leader_id` = `s`.`id`))) left join `users` `u` on((`s`.`user_id` = `u`.`id`))) left join `project_members` `pm` on((`p`.`id` = `pm`.`project_id`))) group by `p`.`id`,`p`.`project_code`,`p`.`title`,`pc`.`name`,`s`.`staff_code`,`u`.`full_name`,`p`.`start_date`,`p`.`end_date`,`p`.`budget`,`p`.`status`,`p`.`progress` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_staff_full`
--

/*!50001 DROP VIEW IF EXISTS `v_staff_full`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_staff_full` AS select `s`.`id` AS `id`,`s`.`staff_code` AS `staff_code`,`u`.`full_name` AS `full_name`,`u`.`email` AS `email`,`u`.`phone` AS `phone`,`p`.`name` AS `position_name`,`d`.`name` AS `department_name`,`s`.`employment_type` AS `employment_type`,`s`.`hire_date` AS `hire_date`,`s`.`academic_rank` AS `academic_rank`,`s`.`academic_degree` AS `academic_degree`,`s`.`years_experience` AS `years_experience`,`s`.`publications_count` AS `publications_count`,`s`.`status` AS `status`,`s`.`created_at` AS `created_at` from (((`staff` `s` left join `users` `u` on((`s`.`user_id` = `u`.`id`))) left join `positions` `p` on((`s`.`position_id` = `p`.`id`))) left join `departments` `d` on((`s`.`department_id` = `d`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 11:54:12
