CREATE DATABASE easyvoto;
use easyvoto;

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
    id_proceso INT NOT NULL,
    id_persona INT NOT NULL,
    id_lista_e INT,
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

DROP TABLE IF EXISTS voto_proceso;
CREATE TABLE IF NOT EXISTS voto_proceso(
    id_proceso INT NOT NULL,
    id_votante INT NOT NULL,    
    voto_date DATE NOT NULL,
    PRIMARY KEY (id_proceso,id_votante,voto_date),
    FOREIGN KEY fk_v_p_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_v_p_vot(id_votante) REFERENCES votante(id_votante) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;

DROP TABLE IF EXISTS resultado;
CREATE TABLE IF NOT EXISTS resultado(
    id_voto INT NOT NULL AUTO_INCREMENT,
    id_candidato INT NOT NULL,
    id_proceso INT NOT NULL,
    tipo_voto TINYINT NOT NULL,
    voto_date DATE NOT NULL,
    PRIMARY KEY (id_voto),
    FOREIGN KEY fk_voto_vot(id_votante) REFERENCES votante(id_votante) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_voto_cand(id_candidato) REFERENCES candidato(id_candidato) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_voto_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;

DROP TABLE IF EXISTS estadistica;
CREATE TABLE IF NOT EXISTS estadistica(
    id_estad INT NOT NULL AUTO_INCREMENT,
    id_voto INT NOT NULL,
    id_proceso INT NOT NULL, 
    cant_votantes INT NOT NULL,
    cant_voto_blanco INT NOT NULL,
    cant_voto_valid INT NOT NULL,
    PRIMARY KEY (id_estad),
    FOREIGN KEY fk_estad_voto(id_voto) REFERENCES voto(id_voto) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_estad_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;

CREATE VIEW view_admin 
    AS SELECT p.id_persona,p.nombres,p.apellidos,p.correo,p.password as contrasena 
    FROM persona as p, admin as a WHERE p.id_persona=a.id_persona ORDER BY p.nombres;

CREATE VIEW viwe_lista_activa
    AS SELECT l.id_lista_e as id_lista,l.nombre,l.numero,l.eslogan,l.imagen, pe.nombre AS proceso
    FROM lista_electoral as l, proceso_elec as pe WHERE l.id_proceso = pe.id_proceso AND pe.status = '1'  ORDER BY pe.nombre;

CREATE VIEW view_pers_cand 
    AS SELECT p1.id_persona, nombres, apellidos FROM persona p1 WHERE NOT EXISTS (SELECT NULL FROM candidato a1 WHERE a1.id_persona = p1.id_persona) AND NOT EXISTS (SELECT NULL FROM admin a2 WHERE a2.id_persona = p1.id_persona)

-- INSERTA EN PERSONA
INSERT INTO persona (id_persona,nombres,apellidos,correo,contrasena) VALUES (1314675354,'Jonathan','Rivera','jrivera5354@utm.edu.ec',ENCRYPT('123'))
INSERT INTO persona (id_persona,nombres,apellidos,correo,contrasena) VALUES (1314675350,'Carlos','Moncayo','cmoncayo@utm.edu.ec',ENCRYPT('123'))
INSERT INTO persona (id_persona,nombres,apellidos,correo,contrasena) VALUES (1314675351,'Daniel','Balladares','dballadares@utm.edu.ec',ENCRYPT('123'))
INSERT INTO persona (id_persona,nombres,apellidos,correo,contrasena) VALUES (1314675352,'Jose','Suarez','jsuarez@utm.edu.ec',ENCRYPT('123'))
INSERT INTO persona (id_persona,nombres,apellidos,correo,contrasena) VALUES (1314675353,'Cinthya','Briones','cbriones@utm.edu.ec',ENCRYPT('123'))

UPDATE persona SET contrasena = ENCRYPT('123') WHERE id_persona=1314675355;

-- INSERTA EN ADMIN
INSERT INTO admin (id_persona) VALUES(1314675354)

-- SELECTS FOR VIEWS ADMIN 

SELECT p.id_persona,p.nombres,p.apellidos,p.correo,p.contrasena 
    FROM persona as p, admin as a WHERE p.id_persona=a.id_persona ORDER BY p.nombres;

SELECT * FROM view_admin WHERE correo = 'jrivera5354@utm.edu.ec';

SELECT l.id_lista_e as id_lista,l.nombre,l.numero,l.eslogan,l.imagen, pe.nombre AS proceso
    FROM lista_electoral as l, proceso_elec as pe WHERE l.id_proceso = pe.id_proceso AND pe.status = '1'  ORDER BY pe.nombre;

SELECT persona.id_persona, persona.nombres, persona.apellidos 
    FROM persona, admin WHERE persona.id_persona != admin.id_persona

SELECT persona.id_persona, persona.nombres, persona.apellidos, candidato.cargo, lista_electoral.nombre, lista_electoral.numero, lista_electoral.eslogan 
    FROM candidato, persona, lista_electoral 
    WHERE candidato.id_persona = persona.id_persona 
    AND candidato.id_lista_e = lista_electoral.id_lista_e AND candidato.id_lista_e = 3 

SELECT p1.id_persona, nombres, apellidos
    FROM persona p1
    WHERE NOT EXISTS  (SELECT NULL FROM candidato a1 WHERE a1.id_persona = p1.id_persona) AND NOT EXISTS (SELECT NULL FROM admin a2 WHERE a2.id_persona = p1.id_persona)
