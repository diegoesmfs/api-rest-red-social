# api-rest-red-social

Descripcion
ApiREST para una red social similar X (Proyecto personal)

Caracteristicas principales
Esta api esta diseñada en NodeJs para el registro de usuarios y su respectivo inicio de sesion utilizando tecnologias de validacion de datos como: validator, jwt-simple para la generacion de tokens.
los usuarios pueden cargar imagenes  y videos al momento de crear publicaciones en las cuales los usuarios pueden interactuar por medio de multer para cargar dichas imagenes y videos.
Los usuarios pueden seguirse unos a otros lo cual genera un feed unico para cada respectivo usuario de la plataforma.
En terminos de seguridad por medio de la dependencia bcrypt la contraseña del usuario es parseada para proteger su privacidad y por medio de validator se validan tanto sus datos al momento del registro como inicio.
Para la base de datos se utilizo MongoDb por su simplicidad y facil manejo como base de datos NoSQL.
Es un proyecto que estoy empezando recientemente al cual le faltan multiples caracteristicas que se iran implementando.
Los comentarios de este proyecto estan en ingles.

Dependencias utilizadas:

nodeJs v22.12.0
bcrypt v5.1.1
cors v2.8.5
express v4.21.2
jwt-simple v0.5.6
moment v2.30.1
mongoose v8.9.4
moongose-pagination v1.0.0
multer v1.4.5-lts.1
validator v13.12.0

Todas estas dependencias fueron descargadas por medio de npm v11.2.0