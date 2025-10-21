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
-- Current Database: `quan_ly_giao_vu`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `quan_ly_giao_vu` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `quan_ly_giao_vu`;

--
-- Table structure for table `academic_years`
--

DROP TABLE IF EXISTS `academic_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_years` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `year_code` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','inactive','planned') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `year_code` (`year_code`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_years`
--

LOCK TABLES `academic_years` WRITE;
/*!40000 ALTER TABLE `academic_years` DISABLE KEYS */;
INSERT INTO `academic_years` VALUES (1,'2025-2026','N─âm hß╗ìc 2025-2026','2025-08-31','2026-07-13','planned',NULL,'2025-10-13 15:13:30','2025-10-13 15:13:30');
/*!40000 ALTER TABLE `academic_years` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_categories`
--

LOCK TABLES `asset_categories` WRITE;
/*!40000 ALTER TABLE `asset_categories` DISABLE KEYS */;
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
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `staff` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,'IT-LAP-001','Laptop Dell Latitude 5420',NULL,NULL,'HP450G9-2024-002','Dell',NULL,'2025-10-13',23000000.00,12000000.00,'2025-10-07','Nguyß╗àn Thanh H├á',2,'available','good','M├íy mß╗¢i, hiß╗çu n─âng tß╗æt',1,'2025-10-15 14:52:23','2025-10-15 14:52:23');
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
  `code` varchar(50) NOT NULL COMMENT 'M├ú lß╗¢p',
  `name` varchar(255) NOT NULL COMMENT 'T├¬n lß╗¢p',
  `subject_id` int DEFAULT NULL COMMENT 'ID m├┤n hß╗ìc',
  `teacher_id` int DEFAULT NULL COMMENT 'ID giß║úng vi├¬n',
  `semester` varchar(50) DEFAULT NULL COMMENT 'Hß╗ìc kß╗│',
  `academic_year` varchar(20) DEFAULT NULL COMMENT 'N─âm hß╗ìc',
  `student_count` int DEFAULT '0' COMMENT 'Sß╗æ l╞░ß╗úng sinh vi├¬n',
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `subject_id` (`subject_id`),
  KEY `idx_code` (`code`),
  KEY `idx_semester` (`semester`,`academic_year`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lß╗¢p hß╗ìc';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'01A','Lß╗¢p 01',1,NULL,'HK I','2024-2025',120,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(2,'02A','Lß╗¢p 02',2,NULL,'HK I','2024-2025',75,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(3,'01B','Lß╗¢p 01',3,NULL,'HK I','2024-2025',110,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(4,'02B','Lß╗¢p 02',4,NULL,'HK I','2024-2025',95,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(5,'LTT14B','LTT14B',NULL,NULL,NULL,NULL,0,'active','2025-10-16 06:31:32','2025-10-16 06:31:32'),(6,'LT15B','LT15B',NULL,NULL,NULL,NULL,0,'active','2025-10-16 06:35:48','2025-10-16 06:35:48'),(7,'M├ú hoß║╖c t├¬n lß╗¢p. Hß╗ç ','M├ú hoß║╖c t├¬n lß╗¢p. Hß╗ç thß╗æng sß║╜ d├▓ t├¼m hoß║╖c tß║ío mß╗¢i.',NULL,NULL,NULL,NULL,0,'active','2025-10-18 13:13:40','2025-10-18 13:13:40');
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
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (2,'Khoa An ninh ─æiß╗üu tra','K7',NULL,NULL,NULL,1,'2025-10-14 08:12:14');
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
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` int unsigned NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_document` (`document_id`),
  CONSTRAINT `document_attachments_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_attachments`
--

LOCK TABLES `document_attachments` WRITE;
/*!40000 ALTER TABLE `document_attachments` DISABLE KEYS */;
INSERT INTO `document_attachments` VALUES (1,2,'doc_1760419878342-374687633_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','public/uploads/documents/doc_1760419878342-374687633_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx',23225,'application/vnd.openxmlformats-officedocument.wordprocessingml.document',3,'2025-10-14 05:31:18'),(2,4,'doc_1760420439685-614871127_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','public/uploads/documents/doc_1760420439685-614871127_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx',23225,'application/vnd.openxmlformats-officedocument.wordprocessingml.document',3,'2025-10-14 05:40:39'),(3,5,'doc_1760436455422-415770947_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','public/uploads/documents/doc_1760436455422-415770947_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx',23225,'application/vnd.openxmlformats-officedocument.wordprocessingml.document',1,'2025-10-14 10:07:35'),(4,6,'doc_1760436533502-242954019_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','public/uploads/documents/doc_1760436533502-242954019_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx',23225,'application/vnd.openxmlformats-officedocument.wordprocessingml.document',1,'2025-10-14 10:08:53'),(5,7,'doc_1760436594870-530646780_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','public/uploads/documents/doc_1760436594870-530646780_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx',23225,'application/vnd.openxmlformats-officedocument.wordprocessingml.document',1,'2025-10-14 10:09:54');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_directive_history`
--

LOCK TABLES `document_directive_history` WRITE;
/*!40000 ALTER TABLE `document_directive_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_directive_history` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_types`
--

LOCK TABLES `document_types` WRITE;
/*!40000 ALTER TABLE `document_types` DISABLE KEYS */;
INSERT INTO `document_types` VALUES (1,'c├┤ng v─ân','CONGVAN',NULL,1,'2025-10-14 05:40:39'),(2,'B├ío c├ío','BAOCAO',NULL,1,'2025-10-14 10:07:35'),(3,'aaaaa','AAAAA',NULL,1,'2025-10-14 10:09:54');
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
  `category` enum('administrative','party') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'administrative',
  `from_org_id` mediumint unsigned DEFAULT NULL,
  `to_org_id` mediumint unsigned DEFAULT NULL,
  `chi_dao` text COLLATE utf8mb4_unicode_ci,
  `issue_date` date NOT NULL,
  `received_date` date DEFAULT NULL,
  `processing_deadline` date DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('draft','pending','processing','completed','approved','archived','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
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
  KEY `idx_documents_category` (`category`),
  FULLTEXT KEY `idx_search` (`title`,`content_summary`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `document_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`from_org_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`to_org_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `documents_ibfk_5` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_6` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (2,'DSSS','SSSSSSSSSSSSSSSS',NULL,'incoming','administrative',NULL,NULL,'DDDDDD─É','2025-10-13',NULL,'2025-10-15','medium','pending','internal','DDDDDDDDDDDDDDDD',NULL,3,2,NULL,NULL,NULL,'2025-10-14 05:31:18','2025-10-14 05:31:18'),(3,'43','DDDDDDDDD─É',NULL,'incoming','administrative',NULL,NULL,'─ÉXX','2025-10-13',NULL,'2025-10-15','medium','pending','internal','DDDDDDD',NULL,3,3,NULL,NULL,NULL,'2025-10-14 05:32:48','2025-10-14 05:32:48'),(4,'111','hdjshdjhsjd',1,'incoming','administrative',1,NULL,'dddddddd','2025-10-03','2025-10-03','2025-10-13','medium','archived','internal','kkkkk',NULL,3,2,NULL,NULL,NULL,'2025-10-14 05:40:40','2025-10-14 12:45:54'),(5,'21','22222222',2,'incoming','administrative',1,NULL,'L├ám ngay','2025-10-04','2025-10-05','2025-10-10','medium','approved','internal','ddddddddd─æ',NULL,1,3,NULL,NULL,NULL,'2025-10-14 10:07:36','2025-10-14 14:05:31'),(6,'1','Trß║ú lß╗¥i c├┤ng v─ân sß╗æ 1',1,'outgoing','administrative',NULL,1,NULL,'2025-10-13',NULL,'2025-10-13','medium','pending','internal','Trß║ú lß╗¥i c├┤ng v─ân sß╗æ 1',NULL,1,2,NULL,NULL,NULL,'2025-10-14 10:08:54','2025-10-14 10:08:53'),(7,'12','aaaaaaaaa',3,'incoming','party',1,NULL,'aaaaaa','2025-10-03','2025-10-03','2025-10-10','medium','processing','internal','aaaa',NULL,1,2,NULL,NULL,NULL,'2025-10-14 10:09:55','2025-10-14 14:05:47');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

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
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` decimal(5,2) NOT NULL DEFAULT '0.00',
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_criteria`
--

LOCK TABLES `evaluation_criteria` WRITE;
/*!40000 ALTER TABLE `evaluation_criteria` DISABLE KEYS */;
INSERT INTO `evaluation_criteria` VALUES (1,'A114','l├ám viß╗çc chß║»m chß╗ë thß║¡t nhiß╗üu','mß╗ùi ng├áy l├ám 8 tiß║┐ng','other','boolean',NULL,NULL,'260 giß╗¥',0.00,0,1,999,'2025-10-15 13:20:13','2025-10-15 14:22:40'),(2,'A12','Giß╗» g├¼n vß╗ç sinh thß║¡t tß╗æt','ssssssss','other','boolean',NULL,NULL,NULL,0.00,0,1,999,'2025-10-15 13:53:39','2025-10-15 13:53:39'),(3,'A13','Giß╗» g├¼n vß╗ç sinh thß║¡t tß╗æt','s├ósasasas','teaching','boolean',NULL,NULL,'sß║ích',0.00,0,1,999,'2025-10-15 13:54:22','2025-10-15 13:54:22');
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
  `weight` decimal(5,2) NOT NULL DEFAULT '0.00',
  `target_value` decimal(10,2) DEFAULT NULL,
  `excellent_value` decimal(10,2) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period_criteria` (`period_id`,`criteria_id`),
  KEY `idx_period` (`period_id`),
  KEY `idx_criteria` (`criteria_id`),
  CONSTRAINT `fk_epc_criteria` FOREIGN KEY (`criteria_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_epc_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_period_criteria`
--

LOCK TABLES `evaluation_period_criteria` WRITE;
/*!40000 ALTER TABLE `evaluation_period_criteria` DISABLE KEYS */;
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` tinyint DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `evaluation_deadline` date DEFAULT NULL,
  `status` enum('draft','active','closed','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_year` (`academic_year`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_periods`
--

LOCK TABLES `evaluation_periods` WRITE;
/*!40000 ALTER TABLE `evaluation_periods` DISABLE KEYS */;
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
  `invigilator_id` int NOT NULL COMMENT 'ID ng╞░ß╗¥i coi thi',
  `check_in_time` timestamp NULL DEFAULT NULL COMMENT 'Giß╗¥ check-in',
  `check_out_time` timestamp NULL DEFAULT NULL COMMENT 'Giß╗¥ check-out',
  `status` enum('absent','present','late') DEFAULT 'present',
  `notes` text COMMENT 'Ghi ch├║',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invigilator_id` (`invigilator_id`),
  KEY `idx_session` (`session_id`),
  CONSTRAINT `examination_attendance_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_attendance_ibfk_2` FOREIGN KEY (`invigilator_id`) REFERENCES `examination_invigilators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='─Éiß╗âm danh coi thi';
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
  `file_name` varchar(255) NOT NULL COMMENT 'T├¬n file gß╗æc',
  `file_path` varchar(500) NOT NULL COMMENT '─É╞░ß╗¥ng dß║½n l╞░u file',
  `file_size` int DEFAULT NULL COMMENT 'K├¡ch th╞░ß╗¢c file (bytes)',
  `file_type` varchar(100) DEFAULT NULL COMMENT 'Loß║íi file (MIME type)',
  `file_extension` varchar(10) DEFAULT NULL COMMENT 'Phß║ºn mß╗ƒ rß╗Öng (.pdf, .docx)',
  `uploaded_by` int DEFAULT NULL COMMENT 'Ng╞░ß╗¥i upload',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_primary` tinyint(1) DEFAULT '0' COMMENT 'File ch├¡nh',
  `description` text COMMENT 'M├┤ tß║ú file',
  `download_count` int DEFAULT '0' COMMENT 'Sß╗æ lß║ºn tß║úi xuß╗æng',
  `status` enum('active','deleted') DEFAULT 'active',
  `metadata` json DEFAULT NULL COMMENT 'Metadata bß╗ò sung',
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_type` (`file_type`),
  KEY `idx_uploaded_at` (`uploaded_at`),
  KEY `idx_file_status` (`session_id`,`status`),
  KEY `idx_primary_file` (`session_id`,`is_primary`),
  CONSTRAINT `examination_files_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='File ─æ├¡nh k├¿m ca thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_files`
--

LOCK TABLES `examination_files` WRITE;
/*!40000 ALTER TABLE `examination_files` DISABLE KEYS */;
INSERT INTO `examination_files` VALUES (1,1,'Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx','D:/PHAN MEM/quan_ly_giao_vu_new/quan_ly_giao_vu_mvc/public/uploads/1760372850389-712598669_Dß╗▒ ├ín Web quß║ún l├╜ c├┤ng viß╗çc.docx',23225,'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.docx',1,'2025-10-13 16:27:30',1,'',1,'active',NULL);
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
  `staff_id` int NOT NULL COMMENT 'ID c├ín bß╗Ö',
  `role` enum('main','assistant','supervisor') DEFAULT 'main' COMMENT 'Vai tr├▓',
  `assigned_by` int DEFAULT NULL COMMENT 'Ng╞░ß╗¥i ph├ón c├┤ng',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed` tinyint(1) DEFAULT '0' COMMENT '─É├ú x├íc nhß║¡n',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `notes` text COMMENT 'Ghi ch├║',
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_staff` (`staff_id`),
  CONSTRAINT `examination_invigilators_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ph├ón c├┤ng coi thi';
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
  `paper_code` varchar(50) DEFAULT NULL COMMENT 'M├ú ─æß╗ü',
  `title` varchar(255) DEFAULT NULL COMMENT 'Ti├¬u ─æß╗ü ─æß╗ü thi',
  `file_path` varchar(500) DEFAULT NULL COMMENT '─É╞░ß╗¥ng dß║½n file',
  `file_name` varchar(255) DEFAULT NULL COMMENT 'T├¬n file',
  `file_size` bigint DEFAULT NULL COMMENT 'K├¡ch th╞░ß╗¢c file',
  `copies_needed` int DEFAULT NULL COMMENT 'Sß╗æ bß║ún cß║ºn in',
  `copies_printed` int DEFAULT '0' COMMENT 'Sß╗æ bß║ún ─æ├ú in',
  `created_by` int DEFAULT NULL COMMENT 'Ng╞░ß╗¥i tß║ío',
  `approved_by` int DEFAULT NULL COMMENT 'Ng╞░ß╗¥i duyß╗çt',
  `approved_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','pending','approved','rejected','printed') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `examination_papers_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='─Éß╗ü thi';
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
  `name` varchar(255) NOT NULL COMMENT 'T├¬n kß╗│ thi',
  `semester` varchar(50) DEFAULT NULL COMMENT 'Hß╗ìc kß╗│',
  `academic_year` varchar(20) DEFAULT NULL COMMENT 'N─âm hß╗ìc',
  `start_date` date DEFAULT NULL COMMENT 'Ng├áy bß║»t ─æß║ºu',
  `end_date` date DEFAULT NULL COMMENT 'Ng├áy kß║┐t th├║c',
  `status` enum('draft','active','completed','cancelled') DEFAULT 'draft' COMMENT 'Trß║íng th├íi',
  `description` text COMMENT 'M├┤ tß║ú',
  `created_by` int DEFAULT NULL COMMENT 'Ng╞░ß╗¥i tß║ío',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Kß╗│ thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_periods`
--

LOCK TABLES `examination_periods` WRITE;
/*!40000 ALTER TABLE `examination_periods` DISABLE KEYS */;
INSERT INTO `examination_periods` VALUES (1,'Thi kß║┐t th├║c hß╗ìc kß╗│ I','Hß╗ìc kß╗│ I','2024-2025','2024-12-15','2024-12-30','active',NULL,NULL,'2025-10-13 14:29:36','2025-10-13 14:29:36'),(2,'Thi giß╗»a kß╗│ I','Hß╗ìc kß╗│ I','2024-2025','2024-10-20','2024-10-27','completed',NULL,NULL,'2025-10-13 14:29:36','2025-10-13 14:29:36'),(3,'KTHP',NULL,NULL,NULL,NULL,'active',NULL,NULL,'2025-10-16 06:46:45','2025-10-16 06:46:45'),(4,'Hß╗ìc kß╗│ I 2025-2026',NULL,NULL,NULL,NULL,'active',NULL,NULL,'2025-10-18 13:13:40','2025-10-18 13:13:40'),(5,'T├¬n kß╗│ thi. Nß║┐u ch╞░a tß╗ôn tß║íi sß║╜ ─æ╞░ß╗úc tß║ío mß╗¢i.',NULL,NULL,NULL,NULL,'active',NULL,NULL,'2025-10-18 13:13:40','2025-10-18 13:13:40');
/*!40000 ALTER TABLE `examination_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examination_sessions`
--

DROP TABLE IF EXISTS `examination_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examination_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period_id` int NOT NULL COMMENT 'ID kß╗│ thi',
  `subject_id` int NOT NULL COMMENT 'ID m├┤n hß╗ìc',
  `class_id` int DEFAULT NULL COMMENT 'ID lß╗¢p hß╗ìc',
  `exam_code` varchar(50) DEFAULT NULL COMMENT 'M├ú ca thi',
  `exam_name` varchar(255) DEFAULT NULL COMMENT 'T├¬n b├ái thi',
  `exam_date` date NOT NULL COMMENT 'Ng├áy thi',
  `exam_time` time NOT NULL COMMENT 'Giß╗¥ thi',
  `duration` int DEFAULT '90' COMMENT 'Thß╗¥i l╞░ß╗úng (ph├║t)',
  `room` varchar(100) DEFAULT NULL COMMENT 'Ph├▓ng thi',
  `building` varchar(100) DEFAULT NULL COMMENT 'T├▓a nh├á',
  `student_count` int DEFAULT '0' COMMENT 'Sß╗æ l╞░ß╗úng sinh vi├¬n',
  `expected_copies` int DEFAULT NULL COMMENT 'Dß╗▒ kiß║┐n sß╗æ bß║ún cß║ºn in',
  `actual_copies` int DEFAULT NULL COMMENT 'Sß╗æ bß║ún thß╗▒c tß║┐',
  `grader_id` int unsigned DEFAULT NULL COMMENT 'ID c├ín bß╗Ö chß║Ñm thi',
  `grader_manual_name` varchar(120) DEFAULT NULL COMMENT 'T├¬n c├ín bß╗Ö chß║Ñm nhß║¡p tay',
  `grader2_id` int DEFAULT NULL COMMENT 'ID c├ín bß╗Ö chß║Ñm thi phß╗Ñ',
  `grader2_manual_name` varchar(120) DEFAULT NULL COMMENT 'T├¬n c├ín bß╗Ö chß║Ñm thi phß╗Ñ nhß║¡p tay',
  `grading_deadline` date DEFAULT NULL COMMENT 'Hß║ín chß║Ñm b├ái',
  `link` varchar(500) DEFAULT NULL COMMENT 'Link thi online',
  `exam_type` enum('online','offline','hybrid') DEFAULT 'offline' COMMENT 'H├¼nh thß╗⌐c thi',
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `notes` text COMMENT 'Ghi ch├║',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_code` (`exam_code`),
  KEY `subject_id` (`subject_id`),
  KEY `class_id` (`class_id`),
  KEY `grader_id` (`grader_id`),
  KEY `idx_exam_date` (`exam_date`),
  KEY `idx_grading_deadline` (`grading_deadline`),
  KEY `idx_status` (`status`),
  KEY `idx_period` (`period_id`),
  KEY `idx_grader2` (`grader2_id`),
  CONSTRAINT `examination_sessions_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `examination_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_sessions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `examination_sessions_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `examination_sessions_ibfk_4` FOREIGN KEY (`grader_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ca thi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examination_sessions`
--

LOCK TABLES `examination_sessions` WRITE;
/*!40000 ALTER TABLE `examination_sessions` DISABLE KEYS */;
INSERT INTO `examination_sessions` VALUES (1,1,3,6,'CTDT2','Lß╗Öc','2025-10-08','13:04:00',90,'B202','C',78,0,NULL,1,NULL,NULL,NULL,'2025-10-17','','offline','scheduled','','2025-10-13 16:01:36','2025-10-16 06:35:49'),(2,1,5,5,'AD','Qu├╜','2025-10-15','07:30:00',90,'B202','D',70,75,NULL,7,NULL,10,NULL,'2025-10-28','','offline','scheduled','l├ám gß║Ñp','2025-10-16 04:58:04','2025-10-16 06:45:03'),(3,3,5,3,'CTDT3','Ph╞░ß╗¢c','2025-10-20','13:30:00',90,'B202','D',0,75,NULL,6,NULL,NULL,'L├¬ Minh Tiß║┐n','2025-10-30',NULL,'offline','scheduled','ggggggggg','2025-10-16 06:46:45','2025-10-16 06:46:45'),(4,4,6,3,'CT-001','Ca thi ─Éiß╗üu tra c╞í bß║ún','2025-10-19','13:30:00',90,'P201','A2',45,50,NULL,NULL,'Nguyß╗àn V─ân A',NULL,'Trß║ºn Thß╗ï B','2025-10-24','https://exam.example.com','offline','scheduled','Chuß║⌐n bß╗ï ─æß╗ü dß╗▒ ph├▓ng','2025-10-20 04:00:58','2025-10-20 04:00:58');
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
  `student_id` int NOT NULL COMMENT 'ID sinh vi├¬n',
  `student_code` varchar(50) DEFAULT NULL COMMENT 'M├ú sinh vi├¬n',
  `student_name` varchar(255) DEFAULT NULL COMMENT 'T├¬n sinh vi├¬n',
  `registration_number` varchar(50) DEFAULT NULL COMMENT 'Sß╗æ b├ío danh',
  `seat_number` varchar(20) DEFAULT NULL COMMENT 'Sß╗æ b├ío danh',
  `status` enum('registered','present','absent','disqualified') DEFAULT 'registered',
  `checked_in_at` timestamp NULL DEFAULT NULL COMMENT 'Thß╗¥i gian check-in',
  `notes` text COMMENT 'Ghi ch├║',
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_student_code` (`student_code`),
  CONSTRAINT `examination_students_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `examination_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Sinh vi├¬n dß╗▒ thi';
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
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T├¬n file tr├¬n server',
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T├¬n file gß╗æc',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '─É╞░ß╗¥ng dß║½n file',
  `file_size` bigint DEFAULT NULL COMMENT 'K├¡ch th╞░ß╗¢c file (bytes)',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Loß║íi file',
  `version` int DEFAULT '1' COMMENT 'Phi├¬n bß║ún file',
  `is_current` tinyint(1) DEFAULT '1' COMMENT '1=phi├¬n bß║ún hiß╗çn tß║íi, 0=phi├¬n bß║ún c┼⌐',
  `replaced_by` int DEFAULT NULL COMMENT 'ID file thay thß║┐',
  `download_count` int DEFAULT '0' COMMENT 'Sß╗æ lß║ºn tß║úi xuß╗æng',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_version` (`document_id`,`version`),
  KEY `idx_is_current` (`is_current`),
  CONSTRAINT `fk_legal_attachments_document` FOREIGN KEY (`document_id`) REFERENCES `legal_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='File ─æ├¡nh k├¿m v─ân bß║ún ph├íp l├╜';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_document_attachments`
--

LOCK TABLES `legal_document_attachments` WRITE;
/*!40000 ALTER TABLE `legal_document_attachments` DISABLE KEYS */;
INSERT INTO `legal_document_attachments` VALUES (1,3,'doc_1760365308300-481933154_Bß╗Ö luß║¡t Tß╗æ Tß╗Ñng h├¼nh sß╗▒ 2015.pdf','Bß╗Ö luß║¡t Tß╗æ Tß╗Ñng h├¼nh sß╗▒ 2015.pdf','public/uploads/documents/doc_1760365308300-481933154_Bß╗Ö luß║¡t Tß╗æ Tß╗Ñng h├¼nh sß╗▒ 2015.pdf',17373164,'application/pdf',1,1,NULL,0,1,'2025-10-13 14:21:48');
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
  `action` enum('Tß║ío mß╗¢i','Cß║¡p nhß║¡t','X├│a','Tß║úi xuß╗æng','Xem','Upload file','X├│a file') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'T├¬n ng╞░ß╗¥i thß╗▒c hiß╗çn',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'Browser info',
  `old_values` text COLLATE utf8mb4_unicode_ci COMMENT 'Gi├í trß╗ï c┼⌐ (JSON)',
  `new_values` text COLLATE utf8mb4_unicode_ci COMMENT 'Gi├í trß╗ï mß╗¢i (JSON)',
  `details` text COLLATE utf8mb4_unicode_ci COMMENT 'Chi tiß║┐t thao t├íc',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_audit_document` FOREIGN KEY (`document_id`) REFERENCES `legal_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhß║¡t k├╜ hoß║ít ─æß╗Öng v─ân bß║ún ph├íp l├╜';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_document_audit_logs`
--

LOCK TABLES `legal_document_audit_logs` WRITE;
/*!40000 ALTER TABLE `legal_document_audit_logs` DISABLE KEYS */;
INSERT INTO `legal_document_audit_logs` VALUES (1,3,'Tß║ío mß╗¢i',1,'admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0','null','{\"document_number\":\"1232\",\"title\":\"2222222222\",\"document_type\":\"Luß║¡t\",\"issuing_authority\":\"Quß╗æc hß╗Öi\",\"issue_date\":\"2025-10-06\",\"effective_date\":\"2025-10-14\",\"expiry_date\":null,\"status\":\"C├▓n hiß╗çu lß╗▒c\",\"subject\":null,\"summary\":\"Bß╗Ö lu├ót TTHS\",\"keywords\":null,\"signer_name\":\"Nguyß╗àn V─ân A\",\"signer_position\":null,\"replaced_by\":null,\"related_documents\":null,\"version\":1,\"created_by\":1}','Tß║ío v─ân bß║ún 1232','2025-10-13 14:21:48'),(2,3,'Xem',1,'admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0','null','null','Xem v─ân bß║ún 1232','2025-10-13 14:21:48'),(3,3,'Xem',1,'admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0','null','null','Xem v─ân bß║ún 1232','2025-10-13 14:21:59'),(4,3,'Xem',1,'admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0','null','null','Xem v─ân bß║ún 1232','2025-10-14 14:27:16'),(5,3,'Xem',1,'admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0','null','null','Xem v─ân bß║ún 1232','2025-10-14 14:27:25'),(6,3,'Xem',1,'admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0','null','null','Xem v─ân bß║ún 1232','2025-10-14 14:27:36'),(7,1,'Xem',1,'admin','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0','null','null','Xem v─ân bß║ún QC-QLTL-2025','2025-10-14 14:28:19');
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
  `document_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sß╗æ v─ân bß║ún',
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ti├¬u ─æß╗ü/Tr├¡ch yß║┐u',
  `document_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loß║íi v─ân bß║ún: Luß║¡t, Nghß╗ï ─æß╗ïnh, Th├┤ng t╞░, Quyß║┐t ─æß╗ïnh, etc',
  `issuing_authority` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'C╞í quan ban h├ánh',
  `issue_date` date DEFAULT NULL COMMENT 'Ng├áy ban h├ánh',
  `effective_date` date DEFAULT NULL COMMENT 'Ng├áy c├│ hiß╗çu lß╗▒c',
  `expiry_date` date DEFAULT NULL COMMENT 'Ng├áy hß║┐t hiß╗çu lß╗▒c',
  `status` enum('Dß╗▒ thß║úo','C├▓n hiß╗çu lß╗▒c','Hß║┐t hiß╗çu lß╗▒c','Bß╗ï thay thß║┐','─É├ú hß╗ºy') COLLATE utf8mb4_unicode_ci DEFAULT 'Dß╗▒ thß║úo',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'L─⌐nh vß╗▒c',
  `summary` text COLLATE utf8mb4_unicode_ci COMMENT 'T├│m tß║»t nß╗Öi dung',
  `keywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tß╗½ kh├│a',
  `replaced_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'V─ân bß║ún thay thß║┐',
  `related_documents` text COLLATE utf8mb4_unicode_ci COMMENT 'V─ân bß║ún li├¬n quan',
  `signer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ng╞░ß╗¥i k├╜',
  `signer_position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Chß╗⌐c vß╗Ñ ng╞░ß╗¥i k├╜',
  `version` int DEFAULT '1' COMMENT 'Phi├¬n bß║ún v─ân bß║ún',
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quß║ún l├╜ v─ân bß║ún ph├íp l├╜';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_documents`
--

LOCK TABLES `legal_documents` WRITE;
/*!40000 ALTER TABLE `legal_documents` DISABLE KEYS */;
INSERT INTO `legal_documents` VALUES (1,'QC-QLTL-2025','Quy chß║┐ quß║ún l├╜ t├ái liß╗çu','Quy ─æß╗ïnh','Khoa ANDT','2025-03-11','2025-03-31',NULL,'Hß║┐t hiß╗çu lß╗▒c','Quß║ún l├╜ t├ái liß╗çu','Quy ─æß╗ïnh vß╗ü quy tr├¼nh quß║ún l├╜, l╞░u trß╗» v├á sß╗¡ dß╗Ñng t├ái liß╗çu trong khoa','quy chß║┐, t├ái liß╗çu, l╞░u trß╗»',NULL,NULL,NULL,NULL,1,1,1,'2025-10-13 13:37:50','2025-10-14 14:28:19'),(3,'1232','2222222222','Luß║¡t','Quß╗æc hß╗Öi','2025-10-04','2025-10-12',NULL,'C├▓n hiß╗çu lß╗▒c',NULL,'Bß╗Ö lu├ót TTHS',NULL,NULL,NULL,'Nguyß╗àn V─ân A',NULL,1,1,1,'2025-10-13 14:21:48','2025-10-14 14:27:36');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'P3','P3',NULL,NULL,NULL,1,'2025-10-14 05:40:39');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_categories`
--

LOCK TABLES `project_categories` WRITE;
/*!40000 ALTER TABLE `project_categories` DISABLE KEYS */;
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
  FULLTEXT KEY `idx_search` (`title`,`description`,`objectives`),
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
INSERT INTO `projects` VALUES (1,'S21','Kinh nghiß╗çm ─æiß╗üu tra vß╗Ñ ├ín x├óm phß║ím An ninh qG',NULL,5,'2025-10-14','2026-01-12',150000000.00,'planning',0,'jjasjkas kskasa sjaksjak jskjska sakskas','CCcjajdkjdks kdjkdjkaj\' ß╗ïdksjdksjd lsaassssssssss','dddd─æ ├ósasas s├ós',1,'2025-10-16 10:46:31','2025-10-20 15:08:32');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_schedules`
--

DROP TABLE IF EXISTS `report_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_schedules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` enum('weekly','monthly','quarterly','annual','custom') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `owner_unit_id` mediumint unsigned DEFAULT NULL,
  `owner_custom` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` text COLLATE utf8mb4_unicode_ci,
  `status` enum('planning','pending','in_progress','draft','on_hold') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planning',
  `progress` tinyint unsigned NOT NULL DEFAULT '0',
  `completion_rate` tinyint unsigned NOT NULL DEFAULT '0',
  `remind_before_hours` smallint unsigned NOT NULL DEFAULT '48',
  `next_due_date` date DEFAULT NULL,
  `due_label` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_schedules`
--

LOCK TABLES `report_schedules` WRITE;
/*!40000 ALTER TABLE `report_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_schedules` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','System Administrator','[\"all\"]',1,'2025-10-13 14:09:14'),(2,'staff','Staff Member','[\"read\", \"write_own\"]',1,'2025-10-13 14:09:14'),(3,'lecturer','Lecturer','[\"read\", \"write_own\", \"teach\"]',1,'2025-10-13 14:09:14'),(4,'viewer','Read Only','[\"read\"]',1,'2025-10-13 14:09:14'),(5,'guest','Guest account with limited permissions','[\"read\"]',1,'2025-10-13 14:09:14'),(6,'department_head','Tr╞░ß╗ƒng khoa','[\"read\", \"write_own\", \"approve_department\"]',1,'2025-10-13 14:09:14'),(7,'deputy_department_head','Ph├│ tr╞░ß╗ƒng khoa','[\"read\", \"write_own\", \"assist_department\"]',1,'2025-10-13 14:09:14'),(8,'board','Ban gi├ím hiß╗çu','[\"read\", \"write_own\", \"approve_all\"]',1,'2025-10-13 14:09:14');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
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
  `action` enum('created','updated','cancelled','rescheduled','deleted','status_changed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` int unsigned NOT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `change_summary` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_schedule` (`schedule_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`),
  KEY `fk_schedule_history_user` (`changed_by`),
  CONSTRAINT `fk_schedule_history_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedule_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_history`
--

LOCK TABLES `schedule_history` WRITE;
/*!40000 ALTER TABLE `schedule_history` DISABLE KEYS */;
INSERT INTO `schedule_history` VALUES (1,2,'created',1,NULL,'{\"room\": \"B202\", \"color\": \"#ef4444\", \"title\": \"ghghgh\", \"status\": \"confirmed\", \"location\": \"d\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"meeting\", \"is_all_day\": false, \"description\": \"klklk\", \"end_datetime\": \"2025-10-19T22:45\", \"organizer_id\": 7, \"start_datetime\": \"2025-10-19T20:45\", \"reminder_minutes\": 15}','Tß║ío lß╗ïch mß╗¢i','2025-10-17 13:46:02'),(2,2,'updated',1,'{\"id\": 2, \"icon\": null, \"room\": \"B202\", \"tags\": null, \"color\": \"#ef4444\", \"notes\": null, \"title\": \"ghghgh\", \"status\": \"confirmed\", \"type_id\": null, \"building\": null, \"location\": \"d\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_at\": \"2025-10-17T13:46:02.000Z\", \"created_by\": 1, \"event_type\": \"meeting\", \"is_all_day\": 0, \"updated_at\": \"2025-10-17T13:46:02.000Z\", \"attachments\": null, \"description\": \"klklk\", \"creator_name\": \"Administrator\", \"end_datetime\": \"2025-10-19T15:45:00.000Z\", \"is_recurring\": 0, \"organizer_id\": 7, \"participants\": [], \"public_notes\": null, \"organizer_name\": \"Nguyß╗àn Thanh H├á\", \"start_datetime\": \"2025-10-19T13:45:00.000Z\", \"organizer_email\": \"hak7@gmail.com\", \"recurrence_rule\": null, \"reminder_minutes\": 15, \"online_meeting_url\": null, \"recurrence_end_date\": null}','{\"room\": \"B202\", \"color\": \"#ef4444\", \"title\": \"ghghgh\", \"status\": \"confirmed\", \"location\": \"d\", \"priority\": \"normal\", \"event_type\": \"meeting\", \"description\": \"klklk\", \"end_datetime\": \"2025-10-19T22:45\", \"organizer_id\": 7, \"start_datetime\": \"2025-10-19T20:45\"}','Cß║¡p nhß║¡t lß╗ïch','2025-10-17 13:46:15'),(3,3,'created',1,NULL,'{\"room\": \"b\", \"color\": \"#ef4444\", \"title\": \"klklklk\", \"status\": \"confirmed\", \"location\": \"b29\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"meeting\", \"is_all_day\": false, \"description\": \"klklkk\", \"end_datetime\": \"2025-10-20T10:00\", \"organizer_id\": 7, \"start_datetime\": \"2025-10-20T09:00\", \"reminder_minutes\": 15}','Tß║ío lß╗ïch mß╗¢i','2025-10-17 13:47:52'),(4,4,'created',1,NULL,'{\"tags\": {\"lecturer\": \"Trß║ºn V─ân Lß╗Öc\"}, \"color\": \"#06b6d4\", \"title\": \"ssas\", \"status\": \"confirmed\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Giß║úng vi├¬n: Trß║ºn V─ân Lß╗Öc\", \"end_datetime\": \"2025-10-13T09:30\", \"organizer_id\": 1, \"start_datetime\": \"2025-10-13T07:30\", \"reminder_minutes\": 30}','Tß║ío lß╗ïch mß╗¢i','2025-10-17 13:49:58'),(5,5,'created',1,NULL,'{\"room\": \"D101\", \"tags\": {\"class\": \"LTTT13\", \"lecturer\": \"Lß╗Öc\"}, \"color\": \"#06b6d4\", \"title\": \"HCBC\", \"status\": \"confirmed\", \"building\": \"D\", \"location\": \"D\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Lß╗¢p: LTTT13\\nGiß║úng vi├¬n: Lß╗Öc\\n─Éß╗ïa ─æiß╗âm: D101 - D - D\", \"end_datetime\": \"2025-10-13T16:00\", \"organizer_id\": 11, \"start_datetime\": \"2025-10-13T07:30\", \"reminder_minutes\": 30}','Tß║ío lß╗ïch mß╗¢i','2025-10-17 13:55:57'),(6,6,'created',1,NULL,'{\"room\": \"D101\", \"tags\": {\"class\": \"LT_T13\", \"lecturer\": \"Nguyß╗àn Thanh H├á\"}, \"color\": \"#06b6d4\", \"title\": \"HCBC\", \"status\": \"confirmed\", \"building\": \"D\", \"location\": \"D\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": false, \"description\": \"Lß╗¢p: LT_T13\\nGiß║úng vi├¬n: Nguyß╗àn Thanh H├á\\n─Éß╗ïa ─æiß╗âm: D101 - D - D\", \"end_datetime\": \"2025-10-20T10:30\", \"organizer_id\": 2, \"start_datetime\": \"2025-10-20T07:30\", \"reminder_minutes\": 30}','Tß║ío lß╗ïch mß╗¢i','2025-10-20 06:45:43'),(7,5,'updated',7,'{\"id\": 5, \"icon\": null, \"room\": \"D101\", \"tags\": {\"class\": \"LTTT13\", \"lecturer\": \"Lß╗Öc\"}, \"color\": \"#06b6d4\", \"notes\": null, \"title\": \"HCBC\", \"status\": \"confirmed\", \"type_id\": null, \"building\": \"D\", \"location\": \"D\", \"priority\": \"normal\", \"timezone\": \"Asia/Ho_Chi_Minh\", \"created_at\": \"2025-10-17T13:55:57.000Z\", \"created_by\": 1, \"event_type\": \"teaching\", \"is_all_day\": 0, \"updated_at\": \"2025-10-17T13:55:57.000Z\", \"attachments\": null, \"description\": \"Lß╗¢p: LTTT13\\nGiß║úng vi├¬n: Lß╗Öc\\n─Éß╗ïa ─æiß╗âm: D101 - D - D\", \"creator_name\": \"Administrator\", \"end_datetime\": \"2025-10-13T09:00:00.000Z\", \"is_recurring\": 0, \"organizer_id\": 11, \"participants\": [], \"public_notes\": null, \"organizer_name\": \"Trß║ºn v─ân Lß╗Öc\", \"start_datetime\": \"2025-10-13T00:30:00.000Z\", \"organizer_email\": \"lock@gmail.com\", \"recurrence_rule\": null, \"reminder_minutes\": 30, \"online_meeting_url\": null, \"recurrence_end_date\": null}','{\"room\": \"D101\", \"color\": \"#06b6d4\", \"title\": \"HCBC\", \"status\": \"confirmed\", \"location\": \"D\", \"priority\": \"normal\", \"event_type\": \"teaching\", \"description\": \"Lß╗¢p: LTTT13\\nGiß║úng vi├¬n: Lß╗Öc\\n─Éß╗ïa ─æiß╗âm: D101 - D - D\", \"end_datetime\": \"2025-10-13T16:00\", \"organizer_id\": 2, \"start_datetime\": \"2025-10-13T07:30\"}','Cß║¡p nhß║¡t lß╗ïch','2025-10-20 14:29:01');
/*!40000 ALTER TABLE `schedule_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_participants`
--

DROP TABLE IF EXISTS `schedule_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_participants` (
  `schedule_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `response_at` timestamp NULL DEFAULT NULL,
  `notification_sent` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('pending','accepted','declined','tentative','no_response') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('organizer','required','optional','viewer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'required',
  `response` enum('pending','accepted','declined','tentative') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  PRIMARY KEY (`schedule_id`,`user_id`),
  KEY `idx_schedule` (`schedule_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `schedule_participants_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedule_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_participants`
--

LOCK TABLES `schedule_participants` WRITE;
/*!40000 ALTER TABLE `schedule_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_participants` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_types`
--

LOCK TABLES `schedule_types` WRITE;
/*!40000 ALTER TABLE `schedule_types` DISABLE KEYS */;
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
  `t04_start_date` date DEFAULT NULL,
  `faculty_start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F','O') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `salary` decimal(12,2) NOT NULL DEFAULT '0.00',
  `academic_rank` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_degree` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `years_experience` smallint unsigned NOT NULL DEFAULT '0',
  `language_skills` text COLLATE utf8mb4_unicode_ci,
  `it_skills` text COLLATE utf8mb4_unicode_ci,
  `party_card_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `party_join_date` date DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,6,'123',NULL,2,'full_time','2011-09-08','2016-09-08','2016-09-08',NULL,'1992-03-08','M','123456','Bi├¬n ho├á, ─Éß╗ông Nai',10000000.00,'Giß║úng vi├¬n','Thß║íc s─⌐',14,'[\"Chß╗⌐ng chß╗ë B tiß║┐ng Anh\"]','[\"Tin hß╗ìc c╞í bß║ún\"]','111','1111','2016-06-29',0,'active',NULL,'2025-10-15 08:34:24','2025-10-15 12:45:59'),(2,7,'501-303',NULL,2,'full_time','2010-01-12','2015-06-08','2014-06-09',NULL,'1989-02-13','M','23456789','Thß╗º ─Éß╗⌐c, th├ánh phß╗æ Hß╗ô Ch├¡ Minh',15000000.00,'Giß║úng vi├¬n','Thß║íc s─⌐',0,'[\"V─ân bß║▒ng 2 tiß║┐ng anh\"]','[\"Tin hß╗ìc n├óng cao\"]','123','2345','2014-06-17',0,'active','sssssssssssssss','2025-10-15 14:26:34','2025-10-15 14:27:15'),(3,8,'501-301',NULL,2,'full_time','2010-01-13','2015-06-09','2015-06-09',NULL,'1992-07-14','M','23456783','Ph╞░ß╗¥ng Thß╗º ─Éß╗⌐c, th├ánh phß╗æ Hß╗ô Ch├¡ Minh',14000000.00,'Giß║úng vi├¬n','Thß║íc s─⌐',15,'[\"V─ân bß║▒ng 2 tiß║┐ng anh\"]','[\"Tin hß╗ìc n├óng cao\"]','234','2346','2014-06-18',0,'active',NULL,'2025-10-15 14:33:08','2025-10-15 14:33:08'),(4,9,'501-305',NULL,2,'full_time','2010-01-13','2015-06-09','2015-06-09',NULL,'1992-07-07','M','23456783','Ph╞░ß╗¥ng Thß╗º ─Éß╗⌐c, th├ánh phß╗æ Hß╗ô Ch├¡ Minh',14000000.00,'Giß║úng vi├¬n','Thß║íc s─⌐',0,'[\"V─ân bß║▒ng 2 tiß║┐ng anh\"]','[\"Tin hß╗ìc n├óng cao\"]','234','2346','2014-06-18',0,'active',NULL,'2025-10-15 14:34:24','2025-10-15 14:34:24'),(5,10,'501-432',NULL,2,'full_time','2010-01-13','2015-06-09','2015-06-09',NULL,'1992-07-06','M','9087266','Ph╞░ß╗¥ng Thß╗º ─Éß╗⌐c, th├ánh phß╗æ Hß╗ô Ch├¡ Minh',14000000.00,'Giß║úng vi├¬n','Thß║íc s─⌐',15,'[\"V─ân bß║▒ng 2 tiß║┐ng anh\"]','[\"Tin hß╗ìc n├óng cao\"]','567','2389','2014-06-18',0,'active',NULL,'2025-10-15 14:47:37','2025-10-15 14:47:37');
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
-- Table structure for table `staff_documents`
--

DROP TABLE IF EXISTS `staff_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_documents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint unsigned NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_staff_documents_staff_id` (`staff_id`),
  CONSTRAINT `fk_staff_documents_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_documents`
--

LOCK TABLES `staff_documents` WRITE;
/*!40000 ALTER TABLE `staff_documents` DISABLE KEYS */;
INSERT INTO `staff_documents` VALUES (1,1,'T├ÇI LIß╗åU Lß╗ÜP C├öNG AN.pdf','doc_1760517264517-442536351_T├ÇI LIß╗åU Lß╗ÜP C├öNG AN.pdf','application/pdf',1944985,'/public/uploads/documents/doc_1760517264517-442536351_T├ÇI LIß╗åU Lß╗ÜP C├öNG AN.pdf','2025-10-15 08:34:24'),(2,2,'T├ÇI LIß╗åU Lß╗ÜP C├öNG AN.pdf','doc_1760538394720-330778216_T├ÇI LIß╗åU Lß╗ÜP C├öNG AN.pdf','application/pdf',1944985,'/public/uploads/documents/doc_1760538394720-330778216_T├ÇI LIß╗åU Lß╗ÜP C├öNG AN.pdf','2025-10-15 14:26:34');
/*!40000 ALTER TABLE `staff_documents` ENABLE KEYS */;
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
  `total_score` decimal(6,2) DEFAULT NULL,
  `final_grade` enum('excellent','good','average','poor','incomplete') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ranking_in_department` int DEFAULT NULL,
  `ranking_in_school` int DEFAULT NULL,
  `strengths` text COLLATE utf8mb4_unicode_ci,
  `weaknesses` text COLLATE utf8mb4_unicode_ci,
  `recommendations` text COLLATE utf8mb4_unicode_ci,
  `self_assessment_submitted` tinyint(1) DEFAULT '0',
  `manager_review_completed` tinyint(1) DEFAULT '0',
  `final_approved` tinyint(1) DEFAULT '0',
  `approved_by` int unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_summary` (`staff_id`,`period_id`),
  KEY `idx_summary_staff` (`staff_id`),
  KEY `idx_summary_period` (`period_id`),
  KEY `fk_ses_approved` (`approved_by`),
  CONSTRAINT `fk_ses_approved` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ses_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ses_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `self_assessment_value` decimal(10,2) DEFAULT NULL,
  `self_assessment_note` text COLLATE utf8mb4_unicode_ci,
  `self_assessment_date` datetime DEFAULT NULL,
  `manager_assessment_value` decimal(10,2) DEFAULT NULL,
  `manager_assessment_note` text COLLATE utf8mb4_unicode_ci,
  `manager_id` int unsigned DEFAULT NULL,
  `manager_assessment_date` datetime DEFAULT NULL,
  `final_value` decimal(10,2) DEFAULT NULL,
  `grade` enum('excellent','good','average','poor') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evidence_files` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_evaluation` (`staff_id`,`period_id`,`criteria_id`),
  KEY `idx_staff` (`staff_id`),
  KEY `idx_period` (`period_id`),
  KEY `idx_grade` (`grade`),
  KEY `fk_se_criteria` (`criteria_id`),
  KEY `fk_se_manager` (`manager_id`),
  CONSTRAINT `fk_se_criteria` FOREIGN KEY (`criteria_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_se_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_se_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_se_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
-- Table structure for table `student_research_outputs`
--

DROP TABLE IF EXISTS `student_research_outputs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_research_outputs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `publish_date` date DEFAULT NULL,
  `lead_author` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_student_research_outputs_project` (`project_id`),
  CONSTRAINT `fk_student_research_outputs_project` FOREIGN KEY (`project_id`) REFERENCES `student_research_projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_research_outputs`
--

LOCK TABLES `student_research_outputs` WRITE;
/*!40000 ALTER TABLE `student_research_outputs` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_research_outputs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_research_projects`
--

DROP TABLE IF EXISTS `student_research_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_research_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `supervisor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_student` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team_size` int DEFAULT '1',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'proposal',
  `progress` int DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `achievements` text COLLATE utf8mb4_unicode_ci,
  `reference_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_research_projects`
--

LOCK TABLES `student_research_projects` WRITE;
/*!40000 ALTER TABLE `student_research_projects` DISABLE KEYS */;
INSERT INTO `student_research_projects` VALUES (1,'SV1','hghgjkjkj bjkjkjk','C├┤ng nghß╗ç',NULL,'Trß║ºn Ph├║ Qu├╜','Khang',6,'in_progress',30,'2025-10-14','2025-11-18','jhhj kjkjkj lklkl','jhjh jkjklklk',NULL,'2025-10-16 12:53:57','2025-10-16 12:53:57');
/*!40000 ALTER TABLE `student_research_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT 'M├ú m├┤n hß╗ìc',
  `name` varchar(255) NOT NULL COMMENT 'T├¬n m├┤n hß╗ìc',
  `credits` int DEFAULT NULL COMMENT 'Sß╗æ t├¡n chß╗ë',
  `department` varchar(100) DEFAULT NULL COMMENT 'Khoa/Bß╗Ö m├┤n',
  `theory_hours` int DEFAULT NULL COMMENT 'Sß╗æ giß╗¥ l├╜ thuyß║┐t',
  `practice_hours` int DEFAULT NULL COMMENT 'Sß╗æ giß╗¥ thß╗▒c h├ánh',
  `exam_duration` int DEFAULT '90' COMMENT 'Thß╗¥i gian thi (ph├║t)',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='M├┤n hß╗ìc';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'LAW101','Ph├íp luß║¡t ─æß║íi c╞░╞íng',2,'Tß╗▒-nghi├¬n',NULL,NULL,120,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(2,'CS0001','T├ái ph╞░╞íng hß╗ìc',3,'PGS.Lan Hß║úi G',NULL,NULL,75,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(3,'ADM001','Luß║¡t h├ánh ch├¡nh',3,'Tß╗▒-Lan',NULL,NULL,110,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(4,'PROC10','Tß╗ò hß╗úp kinh tß║┐',3,'vß║ºu-─æß║¡p',NULL,NULL,95,'active','2025-10-13 14:29:36','2025-10-13 14:29:36'),(5,'CTDT1','CTDT1',2,NULL,NULL,NULL,90,'active','2025-10-16 04:58:04','2025-10-18 14:03:33'),(6,'AN101','─Éiß╗üu tra c╞í bß║ún',3,NULL,NULL,NULL,90,'active','2025-10-20 04:00:58','2025-10-20 04:00:58');
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
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T├¬n hiß╗ân thß╗ï cß╗ºa giß║úng vi├¬n',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email li├¬n hß╗ç',
  `note` text COLLATE utf8mb4_unicode_ci COMMENT 'Ghi ch├║ bß╗ò sung',
  `anchor_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kh├│a neo v├áo giß║úng vi├¬n kh├íc',
  `created_by` int unsigned NOT NULL COMMENT 'Ng╞░ß╗¥i tß║ío',
  `updated_by` int unsigned DEFAULT NULL COMMENT 'Ng╞░ß╗¥i cß║¡p nhß║¡t cuß╗æi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_teaching_custom_anchor` (`anchor_key`),
  CONSTRAINT `teaching_custom_lecturers_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teaching_custom_lecturers_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teaching_custom_lecturers`
--

LOCK TABLES `teaching_custom_lecturers` WRITE;
/*!40000 ALTER TABLE `teaching_custom_lecturers` DISABLE KEYS */;
INSERT INTO `teaching_custom_lecturers` VALUES (1,'Nguyß╗àn Thanh',NULL,NULL,NULL,1,1,'2025-10-13 14:25:29','2025-10-13 14:25:29');
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
  `approval_status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` int unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  KEY `idx_approval_status` (`approval_status`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `idx_last_login` (`last_login`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@example.com','$2a$10$GTDctdQmLyCYahTgulsmsu8pL9F9Kzy1QjF.R.3npotws5eC3Uioi','Administrator',1,NULL,NULL,1,'approved',NULL,'2025-10-13 21:11:08',NULL,'2025-10-21 11:20:43',NULL,'2025-10-13 14:11:08','2025-10-21 04:20:43'),(2,'dungk7','dung@gmail.com','$2a$10$MguEuJTCuogROjbNeqM.eusww7xc7Ek77Yx4/lTLEWRjWrWHc1miG','Nguyß╗àn Anh D┼⌐ng',7,NULL,NULL,1,'approved',1,'2025-10-13 21:16:23',NULL,'2025-10-17 17:59:32',NULL,'2025-10-13 14:16:23','2025-10-17 10:59:32'),(3,'hienk7','hien@gmail.com','$2a$10$phCHJi/scGQ9xf1jpvLLNee./qjodot4XQiqIuXQ0sqDC1o5mpbre','Th├íi Ch├¡ Hiß╗ün',7,NULL,NULL,1,'approved',1,'2025-10-13 22:02:24',NULL,'2025-10-14 13:48:35',NULL,'2025-10-13 15:02:09','2025-10-14 06:48:35'),(6,'123','vanloc9292@gmail.com','$2a$10$jyHImQzmbupx4JEBCeLaaO2tbm4zr5P8YSvmbL0BNQQiUDXREjohy','Trß║ºn V─ân Lß╗Öc',2,NULL,'+84962957392',1,'pending',NULL,NULL,NULL,NULL,NULL,'2025-10-15 08:34:24','2025-10-15 08:34:24'),(7,'501-303','hak7@gmail.com','$2a$10$8RPOtzUk/MS1DnCir3.52OKCKnVccx6wC/et/r.HeIV4u5nHjlpNO','Nguyß╗àn Thanh H├á',2,NULL,'0968123456',1,'approved',1,'2025-10-17 17:49:17',NULL,'2025-10-20 21:43:54',NULL,'2025-10-15 14:26:34','2025-10-20 14:43:54'),(8,'501-301','phuock7@gmail.com','$2a$10$Z7LgGjRTn6PcW7HX/0fET.SNtKLQlthoNb6RxRDs54YeupGiGVQuO','Trß║ºn Thanh Ph╞░ß╗¢c',2,NULL,'0968123457',0,'rejected',1,NULL,NULL,NULL,NULL,'2025-10-15 14:33:08','2025-10-16 14:18:41'),(9,'501-305','duongk7@gmail.com','$2a$10$XpTJIlNSBqXwmZG8CqHbR.6155/FzH5r0GmggMfBqOJjg0bKhq5hG','Trß╗ïch Ho├áng D╞░╞íng',3,NULL,'0968123476',1,'approved',1,'2025-10-16 21:00:00',NULL,NULL,NULL,'2025-10-15 14:34:24','2025-10-16 14:00:00'),(10,'501-432','Quyk7@gmail.com','$2a$10$rf/ZVS/BY2aKhOiq/pbdLeH8iQvk45fMTFdvtBhCbxoleED0xAReS','Trß║ºn Ph├║ Qu├╜',3,NULL,'098567894',1,'approved',1,'2025-10-16 20:49:55',NULL,NULL,NULL,'2025-10-15 14:47:37','2025-10-16 13:49:55'),(11,'Lock7','lock@gmail.com','$2a$10$W3CSiiMqxNiQFsB5UNGkpuwDgVJSX9wUKxdrOHJy3GG9H6Q5HfyM2','Trß║ºn v─ân Lß╗Öc',3,NULL,NULL,1,'approved',1,'2025-10-16 20:53:55',NULL,'2025-10-18 19:20:38',NULL,'2025-10-16 13:53:38','2025-10-18 12:20:38'),(12,'duongk7','hduongk7@gmail.com','$2a$10$jVj6CA8edAY6eJnz1OP6L.I8LGE6HoUaUgCB0mObcaoqYegQUwKsy','Trß╗ïnh Ho├áng D╞░╞íng',3,NULL,NULL,1,'approved',1,'2025-10-16 21:22:06',NULL,'2025-10-17 13:34:54',NULL,'2025-10-16 14:21:44','2025-10-17 06:34:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Table structure for table `work_schedules`
--

DROP TABLE IF EXISTS `work_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_schedules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#4e73df',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `reminder_minutes` smallint unsigned NOT NULL DEFAULT '15',
  `attachments` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `public_notes` text COLLATE utf8mb4_unicode_ci,
  `type_id` mediumint unsigned DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `is_all_day` tinyint(1) DEFAULT '0',
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `building` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `online_meeting_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organizer_id` int unsigned DEFAULT NULL,
  `status` enum('draft','confirmed','in_progress','completed','cancelled','postponed','scheduled','ongoing') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'confirmed',
  `priority` enum('low','normal','high','critical','urgent','medium') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurrence_rule` text COLLATE utf8mb4_unicode_ci,
  `recurrence_end_date` date DEFAULT NULL,
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_start` (`start_datetime`),
  KEY `idx_end` (`end_datetime`),
  KEY `idx_type` (`type_id`),
  KEY `idx_status` (`status`),
  KEY `idx_organizer` (`organizer_id`),
  CONSTRAINT `work_schedules_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `schedule_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `work_schedules_ibfk_2` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `work_schedules_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_schedules`
--

LOCK TABLES `work_schedules` WRITE;
/*!40000 ALTER TABLE `work_schedules` DISABLE KEYS */;
INSERT INTO `work_schedules` VALUES (1,'qqqqqqqqqqq','ssssss','meeting','#ef4444',NULL,NULL,15,NULL,NULL,NULL,NULL,'2025-10-20 20:41:00','2025-10-20 22:41:00',0,'Asia/Ho_Chi_Minh','d','B202',NULL,NULL,2,'confirmed','normal',0,NULL,NULL,1,'2025-10-17 13:42:08','2025-10-17 13:42:08'),(2,'ghghgh','klklk','meeting','#ef4444',NULL,NULL,15,NULL,NULL,NULL,NULL,'2025-10-19 20:45:00','2025-10-19 22:45:00',0,'Asia/Ho_Chi_Minh','d','B202',NULL,NULL,7,'confirmed','normal',0,NULL,NULL,1,'2025-10-17 13:46:02','2025-10-17 13:46:02'),(3,'klklklk','klklkk','meeting','#ef4444',NULL,NULL,15,NULL,NULL,NULL,NULL,'2025-10-20 09:00:00','2025-10-20 10:00:00',0,'Asia/Ho_Chi_Minh','b29','b',NULL,NULL,7,'confirmed','normal',0,NULL,NULL,1,'2025-10-17 13:47:52','2025-10-17 13:47:52'),(4,'ssas','Giß║úng vi├¬n: Trß║ºn V─ân Lß╗Öc','teaching','#06b6d4',NULL,'{\"lecturer\": \"Trß║ºn V─ân Lß╗Öc\"}',30,NULL,NULL,NULL,NULL,'2025-10-13 07:30:00','2025-10-13 09:30:00',0,'Asia/Ho_Chi_Minh',NULL,NULL,NULL,NULL,1,'confirmed','normal',0,NULL,NULL,1,'2025-10-17 13:49:58','2025-10-17 13:49:58'),(5,'HCBC','Lß╗¢p: LTTT13\nGiß║úng vi├¬n: Lß╗Öc\n─Éß╗ïa ─æiß╗âm: D101 - D - D','teaching','#06b6d4',NULL,'{\"class\": \"LTTT13\", \"lecturer\": \"Lß╗Öc\"}',30,NULL,NULL,NULL,NULL,'2025-10-13 07:30:00','2025-10-13 16:00:00',0,'Asia/Ho_Chi_Minh','D','D101','D',NULL,2,'confirmed','normal',0,NULL,NULL,1,'2025-10-17 13:55:57','2025-10-20 14:29:01'),(6,'HCBC','Lß╗¢p: LT_T13\nGiß║úng vi├¬n: Nguyß╗àn Thanh H├á\n─Éß╗ïa ─æiß╗âm: D101 - D - D','teaching','#06b6d4',NULL,'{\"class\": \"LT_T13\", \"lecturer\": \"Nguyß╗àn Thanh H├á\"}',30,NULL,NULL,NULL,NULL,'2025-10-20 07:30:00','2025-10-20 10:30:00',0,'Asia/Ho_Chi_Minh','D','D101','D',NULL,2,'confirmed','normal',0,NULL,NULL,1,'2025-10-20 06:45:43','2025-10-20 06:45:43'),(9,'Lß║¡p tr├¼nh web - Buß╗òi 1','├ön tß║¡p ES6 + Demo dß╗▒ ├ín\nLß╗¢p: VB2C-IT01\nGiß║úng vi├¬n: ThS. Nguyß╗àn V─ân A\n─Éß╗ïa ─æiß╗âm: C102 - T├▓a nh├á K - C╞í sß╗ƒ C','teaching',NULL,NULL,'{\"class\": \"VB2C-IT01\", \"lecturer\": \"ThS. Nguyß╗àn V─ân A\"}',30,'null','├ön tß║¡p ES6 + Demo dß╗▒ ├ín',NULL,NULL,'2025-10-06 13:30:00','2025-10-06 15:30:00',0,'Asia/Ho_Chi_Minh','C╞í sß╗ƒ C','C102','T├▓a nh├á K',NULL,1,'confirmed','normal',0,NULL,NULL,1,'2025-10-20 08:00:57','2025-10-20 08:00:57'),(10,'HCBC','├ön tß║¡p\nLß╗¢p: VB2D2C\nGiß║úng vi├¬n: Trß║ºn V─ân Lß╗Öc\n─Éß╗ïa ─æiß╗âm: D102 - D - C╞í sß╗ƒ D','teaching',NULL,NULL,'{\"class\": \"VB2D2C\", \"lecturer\": \"Trß║ºn V─ân Lß╗Öc\"}',30,'null','├ön tß║¡p',NULL,NULL,'2025-10-20 13:00:00','2025-10-20 15:30:00',0,'Asia/Ho_Chi_Minh','C╞í sß╗ƒ D','D102','D',NULL,1,'confirmed','normal',0,NULL,NULL,1,'2025-10-20 08:00:57','2025-10-20 08:00:57'),(11,'HCBC','├ön tß║¡p\nLß╗¢p: VB2D2C\nGiß║úng vi├¬n: Trß║ºn V─ân Lß╗Öc\n─Éß╗ïa ─æiß╗âm: D102 - D - C╞í sß╗ƒ D','teaching',NULL,NULL,'{\"class\": \"VB2D2C\", \"lecturer\": \"Trß║ºn V─ân Lß╗Öc\"}',30,'null','├ön tß║¡p',NULL,NULL,'2025-10-23 13:30:00','2025-10-23 15:30:00',0,'Asia/Ho_Chi_Minh','C╞í sß╗ƒ D','D102','D',NULL,1,'confirmed','normal',0,NULL,NULL,1,'2025-10-20 08:41:10','2025-10-20 08:41:10');
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
  `day_of_week` tinyint(1) NOT NULL COMMENT 'Thß╗⌐ trong tuß║ºn: 1=Thß╗⌐ 2, 2=Thß╗⌐ 3, ..., 7=Chß╗º nhß║¡t',
  `main_focus` text COLLATE utf8mb4_unicode_ci COMMENT 'Mß╗Ñc ti├¬u ch├¡nh trong ng├áy',
  `tasks` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Danh s├ích c├┤ng viß╗çc cß║ºn l├ám',
  `notes` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Ghi ch├║ bß╗ò sung',
  `progress` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Tiß║┐n ─æß╗Ö ho├án th├ánh (%): 0-100',
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiß║┐t c├┤ng viß╗çc tß╗½ng ng├áy trong tuß║ºn';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workbook_entries`
--

LOCK TABLES `workbook_entries` WRITE;
/*!40000 ALTER TABLE `workbook_entries` DISABLE KEYS */;
INSERT INTO `workbook_entries` VALUES (1,1,1,'wwwwww','[{\"text\":\"saaasss\",\"completed\":true,\"priority\":\"medium\"},{\"text\":\"asasa\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Xß╗¡ l├╜ c├┤ng v─ân\",\"completed\":true,\"priority\":\"medium\"}]','wwwwww',67,'2025-10-13 14:24:27','2025-10-17 10:27:03'),(2,3,1,'','[{\"text\":\"Chuß║⌐n bß╗ï t├ái liß╗çu hß╗ìp\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Hß╗ìp nh├│m dß╗▒ ├ín\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Ghi bi├¬n bß║ún v├á ph├ón c├┤ng\",\"completed\":false,\"priority\":\"medium\"}]','',0,'2025-10-13 17:05:52','2025-10-13 17:05:52'),(3,6,1,'daaaaaaaaaaaa','[{\"text\":\"s├ós\",\"completed\":true,\"priority\":\"medium\"},{\"text\":\"s├ós\",\"completed\":true,\"priority\":\"medium\"},{\"text\":\"Chuß║⌐n bß╗ï t├ái liß╗çu hß╗ìp\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Hß╗ìp nh├│m dß╗▒ ├ín\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Ghi bi├¬n bß║ún v├á ph├ón c├┤ng\",\"completed\":false,\"priority\":\"medium\"}]','dsdadasas',40,'2025-10-16 13:55:55','2025-10-16 13:56:26'),(4,6,2,'├ósassssss','[{\"text\":\"s├ósssssssss\",\"completed\":true,\"priority\":\"medium\"},{\"text\":\"├ósa\",\"completed\":true,\"priority\":\"medium\"},{\"text\":\"asa\",\"completed\":false,\"priority\":\"medium\"}]','├ósssssssssssssss',67,'2025-10-16 13:56:39','2025-10-16 13:58:50'),(5,7,1,'ddddd─æ','[{\"text\":\"dsdsd\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"dsdsd\",\"completed\":true,\"priority\":\"medium\"},{\"text\":\"dsdsdsd\",\"completed\":true,\"priority\":\"medium\"}]','sssssssssssssss',67,'2025-10-16 14:23:02','2025-10-16 14:23:25'),(6,7,2,'dsssssssssssss','[{\"text\":\"dsdsds\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Chuß║⌐n bß╗ï t├ái liß╗çu hß╗ìp\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Hß╗ìp nh├│m dß╗▒ ├ín\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Ghi bi├¬n bß║ún v├á ph├ón c├┤ng\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"dsdsd\",\"completed\":false,\"priority\":\"medium\"}]','dsssssssssssss',0,'2025-10-16 14:23:35','2025-10-16 14:23:45'),(7,12,1,'╞░asa','[{\"text\":\"ssasasas\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"s├ósasasa\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Chuß║⌐n bß╗ï t├ái liß╗çu hß╗ìp\",\"completed\":true,\"priority\":\"medium\"},{\"text\":\"Hß╗ìp nh├│m dß╗▒ ├ín\",\"completed\":false,\"priority\":\"medium\"},{\"text\":\"Ghi bi├¬n bß║ún v├á ph├ón c├┤ng\",\"completed\":false,\"priority\":\"medium\"}]','s├ósa',20,'2025-10-20 14:58:05','2025-10-20 14:58:24');
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
  `approver_id` int unsigned DEFAULT NULL COMMENT 'Ng╞░ß╗¥i duyß╗çt ─æ╞░ß╗úc chß╗ë ─æß╗ïnh',
  `week_start` date NOT NULL COMMENT 'Ng├áy bß║»t ─æß║ºu tuß║ºn (thß╗⌐ 2)',
  `week_end` date NOT NULL COMMENT 'Ng├áy kß║┐t th├║c tuß║ºn (chß╗º nhß║¡t)',
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'Trß║íng th├íi: bß║ún nh├íp, ─æ├ú gß╗¡i, ─æ├ú duyß╗çt, tß╗½ chß╗æi',
  `quick_notes` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Ghi ch├║ nhanh cho tuß║ºn',
  `approval_requested_at` datetime DEFAULT NULL COMMENT 'Thß╗¥i ─æiß╗âm gß╗¡i duyß╗çt',
  `approval_decision_at` datetime DEFAULT NULL COMMENT 'Thß╗¥i ─æiß╗âm ng╞░ß╗¥i duyß╗çt ra quyß║┐t ─æß╗ïnh',
  `approval_note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhß║¡n x├⌐t cß╗ºa ng╞░ß╗¥i duyß╗çt',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_week` (`user_id`,`week_start`,`week_end`),
  KEY `idx_status` (`status`),
  KEY `idx_approver` (`approver_id`),
  KEY `idx_workbooks_date_range` (`week_start`,`week_end`),
  KEY `idx_workbooks_approver` (`approver_id`),
  CONSTRAINT `fk_workbooks_approver` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `workbooks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workbooks_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_week_dates` CHECK ((`week_end` >= `week_start`))
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sß╗ò tay c├┤ng t├íc theo tuß║ºn';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workbooks`
--

LOCK TABLES `workbooks` WRITE;
/*!40000 ALTER TABLE `workbooks` DISABLE KEYS */;
INSERT INTO `workbooks` VALUES (1,1,NULL,'2025-10-13','2025-10-19','draft','dadsda',NULL,NULL,NULL,'2025-10-13 14:24:15','2025-10-17 10:27:34'),(2,3,NULL,'2025-10-13','2025-10-19','draft',NULL,NULL,NULL,NULL,'2025-10-13 15:03:02','2025-10-13 15:03:02'),(3,1,NULL,'2025-10-12','2025-10-18','draft',NULL,NULL,NULL,NULL,'2025-10-13 17:05:31','2025-10-13 17:05:31'),(4,1,NULL,'2025-10-06','2025-10-12','draft',NULL,NULL,NULL,NULL,'2025-10-16 06:51:08','2025-10-16 06:51:08'),(5,2,NULL,'2025-10-13','2025-10-19','draft',NULL,NULL,NULL,NULL,'2025-10-16 13:38:53','2025-10-16 13:38:53'),(6,11,2,'2025-10-13','2025-10-19','submitted',NULL,'2025-10-16 20:57:30',NULL,NULL,'2025-10-16 13:55:16','2025-10-16 13:57:30'),(7,12,2,'2025-10-13','2025-10-19','approved',NULL,'2025-10-16 21:24:02','2025-10-16 21:37:13',NULL,'2025-10-16 14:22:46','2025-10-16 14:37:12'),(8,12,NULL,'2025-10-06','2025-10-12','draft',NULL,NULL,NULL,NULL,'2025-10-16 14:39:45','2025-10-16 14:39:45'),(9,12,NULL,'2025-09-29','2025-10-05','draft',NULL,NULL,NULL,NULL,'2025-10-16 14:41:21','2025-10-16 14:41:21'),(10,12,NULL,'2025-09-22','2025-09-28','draft',NULL,NULL,NULL,NULL,'2025-10-16 14:43:05','2025-10-16 14:43:05'),(11,1,NULL,'2025-09-29','2025-10-05','draft',NULL,NULL,NULL,NULL,'2025-10-17 08:01:17','2025-10-17 08:01:17'),(12,1,NULL,'2025-10-20','2025-10-26','draft',NULL,NULL,NULL,NULL,'2025-10-17 08:42:20','2025-10-17 08:42:20'),(13,1,NULL,'2025-09-22','2025-09-28','draft',NULL,NULL,NULL,NULL,'2025-10-17 10:24:26','2025-10-17 10:24:26'),(14,7,NULL,'2025-10-13','2025-10-19','draft',NULL,NULL,NULL,NULL,'2025-10-17 11:16:21','2025-10-17 11:16:21'),(15,1,NULL,'2025-10-27','2025-11-02','draft',NULL,NULL,NULL,NULL,'2025-10-20 14:20:07','2025-10-20 14:20:07'),(16,1,NULL,'2025-08-04','2025-08-10','draft',NULL,NULL,NULL,NULL,'2025-10-20 14:59:08','2025-10-20 14:59:08'),(17,1,NULL,'2025-08-11','2025-08-17','draft',NULL,NULL,NULL,NULL,'2025-10-20 15:00:02','2025-10-20 15:00:02');
/*!40000 ALTER TABLE `workbooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `quan_ly_giao_vu`
--

USE `quan_ly_giao_vu`;

--
-- Final view structure for view `v_legal_documents_full`
--

/*!50001 DROP VIEW IF EXISTS `v_legal_documents_full`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_legal_documents_full` AS select `ld`.`id` AS `id`,`ld`.`document_number` AS `document_number`,`ld`.`title` AS `title`,`ld`.`document_type` AS `document_type`,`ld`.`issuing_authority` AS `issuing_authority`,`ld`.`issue_date` AS `issue_date`,`ld`.`effective_date` AS `effective_date`,`ld`.`expiry_date` AS `expiry_date`,`ld`.`status` AS `status`,`ld`.`subject` AS `subject`,`ld`.`summary` AS `summary`,`ld`.`keywords` AS `keywords`,`ld`.`replaced_by` AS `replaced_by`,`ld`.`related_documents` AS `related_documents`,`ld`.`signer_name` AS `signer_name`,`ld`.`signer_position` AS `signer_position`,`ld`.`version` AS `version`,`ld`.`created_by` AS `created_by`,`ld`.`updated_by` AS `updated_by`,`ld`.`created_at` AS `created_at`,`ld`.`updated_at` AS `updated_at`,`u1`.`username` AS `created_by_username`,`u2`.`username` AS `updated_by_username`,count(distinct `lda`.`id`) AS `attachment_count`,sum((case when (`lda`.`is_current` = 1) then 1 else 0 end)) AS `current_attachment_count`,group_concat(distinct (case when (`lda`.`is_current` = 1) then `lda`.`mime_type` end) separator ',') AS `file_types` from (((`legal_documents` `ld` left join `users` `u1` on((`ld`.`created_by` = `u1`.`id`))) left join `users` `u2` on((`ld`.`updated_by` = `u2`.`id`))) left join `legal_document_attachments` `lda` on((`ld`.`id` = `lda`.`document_id`))) group by `ld`.`id` */;
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

-- Dump completed on 2025-10-21 11:41:13
