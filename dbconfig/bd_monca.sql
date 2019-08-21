CREATE DATABASE IF NOT EXISTS easyvoto;
use easyvoto;

DROP TABLE IF EXISTS persona;
CREATE TABLE IF NOT EXISTS persona (
    id_persona INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    facultad VARCHAR(100) NOT NULL,
    nivel VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
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

DROP TABLE IF EXISTS proceso_elec;
CREATE TABLE IF NOT EXISTS proceso_elec (
    id_proceso INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo TINYINT NOT NULL,
    voto_date DATE NOT NULL,
    periodo TEXT NOT NULL,
    status TINYINT DEFAULT 1,
    id_admin INT NOT NULL,
    PRIMARY KEY (id_proceso),
    FOREIGN KEY fk_proc_adm(id_admin) REFERENCES admin(id_admin) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;


-- ALTER TABLE proceso_elec ALTER status SET DEFAULT 1;
-- ALTER TABLE proceso_elec ADD CONSTRAINT unique_proc UNIQUE (status);
-- DROP INDEX unique_proc ON proceso_elec

DROP TABLE IF EXISTS lista_electoral;
CREATE TABLE IF NOT EXISTS lista_electoral(
    id_lista_e INT AUTO_INCREMENT,
    id_proceso INT NOT NULL,
    nombre TEXT NOT NULL,
    eslogan TEXT NOT NULL,
    imagen TEXT,
    PRIMARY KEY (id_lista_e),
    FOREIGN KEY fk_lis_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
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

DROP TABLE IF EXISTS candidato;
CREATE TABLE IF NOT EXISTS candidato (
    id_candidato INT AUTO_INCREMENT,
    id_persona INT NOT NULL,
    id_lista_e INT NOT NULL,
    id_proceso INT NOT NULL,
    cargo VARCHAR(100),    
    PRIMARY KEY (id_candidato),
    FOREIGN KEY fk_can_pers(id_persona) REFERENCES persona(id_persona) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_can_lis(id_lista_e) REFERENCES lista_electoral(id_lista_e) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_can_pro(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;


DROP TABLE IF EXISTS voto;
CREATE TABLE IF NOT EXISTS voto(
    id_voto INT NOT NULL AUTO_INCREMENT,
    id_candidato INT NOT NULL,
    id_proceso INT NOT NULL,
    voto TINYINT NOT NULL,
    PRIMARY KEY (id_voto),
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

-- INSERTA EN PERSONA
INSERT INTO persona VALUES (1314675354,'Jonathan','Rivera','jrivera5354@utm.edu.ec',ENCRYPT('123'))
INSERT INTO persona VALUES (1315981030,'Moncayo','Ramirez','cmoncayo1997@gmail.com','123')
INSERT INTO persona VALUES (1315981031,'Moncayo','Ramirez','charlymoncayo@gmail.com','123')

INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981030,'Carlos', 'Moncayo','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981031,'Eleizer', 'Ramírez','Facultad de Ciencias Informáticas', 'Noveno','charlymoncayo@gmail.com','123');

--DATOS PARA LOS CANDIDATOS
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981032,'Adolf', 'Hitler','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981033,'Aquiles', 'Castro','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981034,'Pepito', 'Tiroides','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');

INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981035,'Elver', 'Gonsoso','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981036,'Maria', 'Antonieta','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981037,'Leo', 'Nardo','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');

INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981038,'David', 'Darian','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981039,'Goliat', 'Moran','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');
INSERT INTO persona (id_persona,nombres, apellidos, facultad, nivel, correo, password) VALUES (1315981040,'Jhon', 'Wick','Facultad de Ciencias Informáticas', 'Noveno','cmoncayo1997@gmail.com','123');

UPDATE persona SET contrasena = ENCRYPT('123') WHERE id_persona=1314675354;

-- Reinicia a NULL el IMEI 
UPDATE votante SET imei = NULL WHERE id_persona=1315981032;

UPDATE proceso_elec SET status = 1 WHERE id_proceso=1;

-- INSERTA EN ADMIN
INSERT INTO admin (id_persona) VALUES(1315981031);

-- CREAR PROCESO ELECTORAL
-- STATUS 
-- 1: ACTIVO 
-- 2: EN PROCESO 
-- 3: FINALIZADO
INSERT INTO proceso_elec (nombre, tipo, voto_date, periodo, status, id_admin) VALUES ('Eleccion de Reina','1','2019-08-30','2019-2020','1',1);

-- INGRESAR UNA LISTA ELECTORAL 
INSERT INTO lista_electoral (id_proceso, nombre, eslogan) VALUES (1,'EXU','Adelante Ecuador Adelante');
INSERT INTO lista_electoral (id_proceso, nombre, eslogan) VALUES (1,'ROCK','Escucha y disfruta');
INSERT INTO lista_electoral (id_proceso, nombre, eslogan) VALUES (1,'PHONE','El mundo en tus manos');

-- INGERSAR UN CANDIDATO
INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981032,4,1,'Presidente');
INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981033,4,1,'Vicepresidente');
INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981034,4,1,'Tesorero');

INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981035,5,1,'Presidente');
INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981036,5,1,'Vicepresidente');
INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981037,5,1,'Tesorero');

INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981038,6,1,'Presidente');
INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981039,6,1,'Vicepresidente');
INSERT INTO candidato (id_persona, id_lista_e, id_proceso, cargo) VALUES (1315981040,6,1,'Tesorero');


---------------------------------------------------------------------------------------------------------------

-- DROP TABLE IF EXISTS resultado;
-- CREATE TABLE IF NOT EXISTS resultado(
--     id_voto INT NOT NULL AUTO_INCREMENT,
--     id_candidato INT NOT NULL,
--     id_proceso INT NOT NULL,
--     tipo_voto TINYINT NOT NULL,
--     voto_date DATE NOT NULL,
--     PRIMARY KEY (id_voto),
--     FOREIGN KEY fk_voto_vot(id_votante) REFERENCES votante(id_votante) ON UPDATE CASCADE ON DELETE RESTRICT,
--     FOREIGN KEY fk_voto_cand(id_candidato) REFERENCES candidato(id_candidato) ON UPDATE CASCADE ON DELETE RESTRICT,
--     FOREIGN KEY fk_voto_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
-- )ENGINE=INNODB;

-- DROP TABLE IF EXISTS estadistica;
-- CREATE TABLE IF NOT EXISTS estadistica(
--     id_estad INT NOT NULL AUTO_INCREMENT,
--     id_voto INT NOT NULL,
--     id_proceso INT NOT NULL, 
--     cant_votantes INT NOT NULL,
--     cant_voto_blanco INT NOT NULL,
--     cant_voto_valid INT NOT NULL,
--     PRIMARY KEY (id_estad),
--     FOREIGN KEY fk_estad_voto(id_voto) REFERENCES voto(id_voto) ON UPDATE CASCADE ON DELETE RESTRICT,
--     FOREIGN KEY fk_estad_proc(id_proceso) REFERENCES proceso_elec(id_proceso) ON UPDATE CASCADE ON DELETE RESTRICT
-- )ENGINE=INNODB;


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
    WHERE NOT EXISTS  (SELECT NULL FROM candidato a1 WHERE a1.id_persona = p1.id_persona) 
    AND NOT EXISTS (SELECT NULL FROM admin a2 WHERE a2.id_persona = p1.id_persona)

SELECT p1.id_persona, nombres, apellidos FROM persona p1 
    WHERE NOT EXISTS (SELECT NULL FROM candidato a1, proceso_elec p2 WHERE a1.id_persona = p1.id_persona AND a1.id_proceso = p2.id_proceso AND p2.status= 1) 
    AND NOT EXISTS (SELECT NULL FROM admin a2 WHERE a2.id_persona = p1.id_persona);

SELECT can.id_candidato, vcp.id_persona,vcp.candidato, vcp.lista, vcp.cargo, COUNT(voto) 'c_voto'
FROM  voto vtp INNER JOIN candidato can ON vtp.id_candidato = can.id_candidato
	INNER JOIN view_candidato_proceso vcp ON vcp.id_persona = can.id_persona
    INNER JOIN proceso_elec pel ON pel.id_proceso =  vtp.id_proceso  AND   pel.id_proceso = 1
GROUP BY can.id_candidato,vcp.id_candidato  ;

SELECT 
    candidato.id_candidato,
    persona.id_persona,
    CONCAT(persona.apellidos, ' ', persona.nombres) AS candidato,
    lista_electoral.nombre AS lista,
    cargo
FROM
    candidato,
    proceso_elec,
    persona,
    lista_electoral
WHERE
    candidato.id_persona = persona.id_persona
        AND candidato.id_lista_e = lista_electoral.id_lista_e
        AND candidato.id_proceso = proceso_elec.id_proceso
        AND proceso_elec.status = 1 ORDER BY lista_electoral.nombre;



-- SELECTS FOR VIEWS ADMIN 

SELECT p.id_persona,p.nombres,p.apellidos,p.correo,p.contrasena 
    FROM persona as p, admin as a WHERE p.id_persona=a.id_persona ORDER BY p.nombres;

CREATE VIEW view_admin 
    AS SELECT p.id_persona,p.nombres,p.apellidos,p.correo,p.contrasena 
    FROM persona as p, admin as a WHERE p.id_persona=a.id_persona ORDER BY p.nombres;

SELECT * FROM view_admin WHERE correo = 'jrivera5354@utm.edu.ec';

SELECT nombres, apellidos FROM persona WHERE correo= 'cmoncayo1033@gmail.com' AND password = '123'
SELECT imei FROM votante WHERE id_persona = '1315981030'


