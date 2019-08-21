CREATE DATABASE easyvoto;
use easyvoto;

-- TABLAS

DROP TABLE IF EXISTS proceso_elec;
CREATE TABLE IF NOT EXISTS proceso_elec (
    id_proceso INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo TEXT NOT NULL,
    voto_date DATE NOT NULL,
    periodo TEXT NOT NULL,
    hora_incio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    status TINYINT DEFAULT 1,
    PRIMARY KEY (id_proceso)
)  ENGINE=INNODB;

DROP TABLE IF EXISTS lista_electoral;
CREATE TABLE IF NOT EXISTS lista_electoral(
    id_lista_e INT AUTO_INCREMENT,
    id_proceso INT NOT NULL,
    nombre TEXT NOT NULL,
    numero INT NOT NULL,
    eslogan TEXT,
    imagen TEXT,
    PRIMARY KEY (id_lista_e),
    FOREIGN KEY fk_lis_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;

DROP TABLE IF EXISTS persona;
CREATE TABLE IF NOT EXISTS persona (
    id_persona INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    facultad VARCHAR(100),
    nivel VARCHAR(100), 
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    imagen TEXT,
    PRIMARY KEY (id_persona)
)  ENGINE=INNODB;

DROP TABLE IF EXISTS admin;
CREATE TABLE IF NOT EXISTS admin (
    id_admin INT AUTO_INCREMENT,
    id_persona INT NOT NULL,
    PRIMARY KEY (id_admin),
    FOREIGN KEY fk_adm_pers(id_persona) REFERENCES persona(id_persona) ON UPDATE CASCADE ON DELETE RESTRICT
)  ENGINE=INNODB;


DROP TABLE IF EXISTS votante;
CREATE TABLE IF NOT EXISTS votante (
    id_votante INT AUTO_INCREMENT,
    id_persona INT NOT NULL,
    imei bigint(16) DEFAULT NULL,   
    PRIMARY KEY (id_votante),
    FOREIGN KEY fk_vot_pers(id_persona) REFERENCES persona(id_persona) ON UPDATE CASCADE ON DELETE RESTRICT
)  ENGINE=INNODB;

DROP TABLE IF EXISTS candidato;
CREATE TABLE IF NOT EXISTS candidato (
    id_candidato INT AUTO_INCREMENT,
    id_persona INT NOT NULL,
    id_lista_e INT,
    id_proceso INT NOT NULL,
    cargo VARCHAR(100),
    PRIMARY KEY (id_candidato),
    FOREIGN KEY fk_can_pers(id_persona) REFERENCES persona(id_persona) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY fk_can_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_can_lis(id_lista_e) REFERENCES lista_electoral(id_lista_e) ON UPDATE CASCADE ON DELETE RESTRICT
)  ENGINE=INNODB;

DROP TABLE IF EXISTS tokens;
CREATE TABLE IF NOT EXISTS tokens (
    id_tokens INT NOT NULL AUTO_INCREMENT,
    id_votante INT NOT NULL,
    tx_token VARCHAR(6) COLLATE utf8_unicode_ci NOT NULL,
    tx_date_cr datetime DEFAULT NULL,
    tx_date_ex datetime DEFAULT NULL,
    PRIMARY KEY (id_tokens),
    FOREIGN KEY fk_tok_vot(id_votante) REFERENCES votante(id_votante) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=INNODB;

DROP TABLE IF EXISTS voto;
CREATE TABLE IF NOT EXISTS voto(
    id_voto INT NOT NULL AUTO_INCREMENT,
    id_candidato INT,
    id_proceso INT NOT NULL,
    voto TINYINT NOT NULL,
    PRIMARY KEY (id_voto),
    FOREIGN KEY fk_voto_cand(id_candidato) REFERENCES candidato(id_candidato) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_voto_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;

DROP TABLE IF EXISTS estado_votante;
CREATE TABLE IF NOT EXISTS estado_votante(
    id_estado INT NOT NULL AUTO_INCREMENT,
    id_votante INT NOT NULL,
    id_proceso INT NOT NULL,
    estado TINYINT NOT NULL,
    voto_date DATE NOT NULL,
    PRIMARY KEY (id_estado),
    FOREIGN KEY fk_est_vot(id_votante) REFERENCES votante(id_votante) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_est_pro(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB; 

-- VISTAS 
CREATE VIEW view_admin 
    AS SELECT p.id_persona,p.nombres,p.apellidos,p.correo,p.password as contrasena 
    FROM persona as p, admin as a WHERE p.id_persona=a.id_persona ORDER BY p.nombres;

CREATE VIEW viwe_lista_activa
    AS SELECT l.id_lista_e as id_lista,l.nombre,l.numero,l.eslogan,l.imagen, pe.nombre AS proceso
    FROM lista_electoral as l, proceso_elec as pe WHERE l.id_proceso = pe.id_proceso AND pe.status = '1'  ORDER BY pe.nombre;

CREATE VIEW view_pers_cand 
    AS SELECT p1.id_persona, nombres, apellidos FROM persona p1 
    WHERE NOT EXISTS (SELECT NULL FROM candidato a1, proceso_elec p2 WHERE a1.id_persona = p1.id_persona AND a1.id_proceso = p2.id_proceso AND p2.status= 1) 
    AND NOT EXISTS (SELECT NULL FROM admin a2 WHERE a2.id_persona = p1.id_persona);

CREATE VIEW view_candidato_proceso
    AS SELECT  candidato.id_candidato, persona.id_persona, CONCAT(persona.apellidos, ' ', persona.nombres) AS candidato, lista_electoral.nombre AS lista, cargo
    FROM candidato, proceso_elec, persona, lista_electoral
    WHERE candidato.id_persona = persona.id_persona
        AND candidato.id_lista_e = lista_electoral.id_lista_e
        AND candidato.id_proceso = proceso_elec.id_proceso
        AND proceso_elec.status = 1 ORDER BY lista_electoral.nombre;
