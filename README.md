Proyecto Backend 2 - CoderHouse

Este proyecto es una práctica de Backend donde se implementa un sistema de **usuarios con autenticación y autorización** usando **JWT y Passport**.  
La base del proyecto es un ecommerce, pero en esta entrega me enfoqué solamente en la parte de **usuarios y sesiones**.

---

Funcionalidades

- **Modelo de Usuario** con los campos:
  - first_name  
  - last_name  
  - email (único)  
  - age  
  - password (encriptada con bcrypt)  
  - cart (referencia, pendiente de usar más adelante)  
  - role (por defecto: "user")  

- **Registro y Login de usuarios**.  
- **Contraseña encriptada** con `bcrypt`.  
- **Generación de token JWT** al hacer login.  
- **Autenticación con Passport JWT**.  
- **Ruta /current** para ver los datos del usuario logueado.  
- **Middleware de autorización** para validar roles.

---
Estructura del proyecto

