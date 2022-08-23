# AugustProject

Viajes recomendados.

## DESCRIPCIÓN

Implementar una API que permita gestionar un portal donde los usuarios puedan publicar recomendaciones de viaje de sitios o experiencias poco conocidas.

## ANÓNIMO:

- Buscar recomendaciones por lugar, categoría ✔️
- Poder ordenar los resultados de búsqueda por votos ✔️
- Ver detalle de una recomendación ✔️
- Login (con email y password) ✔️
- Registro (nombre, email y password) ✔️

## USUARIOS REGISTRADOS:

- Publicar recomendaciones (título, categoría, lugar, entradilla, texto, foto) ✔️
- Votar recomendaciones de otros usuarios ✔️
- Opcional:
  - Gestión del perfil (con posibilidad de añadir a los campos de registro una foto de perfil) ✔️
  - Borrar sus recomendaciones ✔️
  - Publicar comentarios en las recomendaciones ✔️

## EXTRAS NO SOLICITADOS:

- Iniciar BBDD con datos aleatorios ✔️
- Enviar emails mediante Mailgun al dar de alta una cuenta (creamos la cuenta augustproject@yopmail.com para hacer pruebas) ✔️
- Paginación de los resultados de las búsquedas ✔️
- Crear en Postman las variables host, port y accessToken, esta última introduciendo en el Post de Crear Cuenta, en la pestaña Tests la siguiente linea: pm.environment.set("accessToken", pm.response.json().accessToken); ✔️
