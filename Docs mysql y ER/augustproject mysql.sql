-- Creamos la base de datos
CREATE DATABASE augustproject;

-- La seleccionamos
USE augustproject;

-- Creamos la tabla users
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password CHAR(60) NOT NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  avatar VARCHAR(255) NULL,
  PRIMARY KEY (id)
);

-- Creamos la tabla recommendations. Tiene una clave foránea hacia users.id
CREATE TABLE recommendations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  place VARCHAR(255) NOT NULL,
  intro VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  photo VARCHAR(255) NOT NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id)
  REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

-- Creamos la tabla comments. Tiene dos claves foráneas, una hacia uses.id y otra hacia recommendations.id
CREATE TABLE comments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  content VARCHAR(3000) NOT NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT UNSIGNED NOT NULL,
  recommendation_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id)
  REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  FOREIGN KEY (recommendation_id)
  REFERENCES recommendations (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

-- Creamos la tabla likes que tiene dos claves primarias formadas por user_id y recommendation_id que a su vez son claves foráneas hacia users.id y recommendations.id
CREATE TABLE likes (
  user_id INT UNSIGNED NOT NULL,
  recommendation_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, recommendation_id),
  FOREIGN KEY (user_id)
  REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  FOREIGN KEY (recommendation_id)
  REFERENCES recommendations (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);






