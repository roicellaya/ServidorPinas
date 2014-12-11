# Distribuidora de frutas (Servidor intermedio de frutas)

En el texto a continuaci�n se describen algunos pasos necesarios para poder ejecutar la aplicaci�n:

#### Ejecuci�n de la aplicaci�n:

Para ejecutar correctamente la aplicaci�n es necesario cambiar algunos par�metros de configuraci�n.

En el archivo /server.js se configura el puerto en el que se ejecuta el servidor. El puerto por defecto es 3000. Cambiar al puerto deseado.

En el archivo /models/pina.js se consultan servicios definidos en el servidor maestro (el distribuidor), all� se debe cambiar la direcci�n ip y el puerto, a los correspondientes en el que se ejecute el servidor maestro.

Para iniciar el servidor se debe ejecutar el siguiente comando en la ra�z del proyecto:

```
- node server.js
```

Luego de ejecutar el comando el servidor estar� esperando por consultas a los servicios que ofrece.