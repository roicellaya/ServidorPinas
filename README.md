# Distribuidora de frutas (Servidor intermedio de frutas)

En el texto a continuación se describen algunos pasos necesarios para poder ejecutar la aplicación:

#### Ejecución de la aplicación:

Para ejecutar correctamente la aplicación es necesario cambiar algunos parámetros de configuración.

En el archivo /server.js se configura el puerto en el que se ejecuta el servidor. El puerto por defecto es 3000. Cambiar al puerto deseado.

En el archivo /models/pina.js se consultan servicios definidos en el servidor maestro (el distribuidor), allí se debe cambiar la dirección ip y el puerto, a los correspondientes en el que se ejecute el servidor maestro.

Para iniciar el servidor se debe ejecutar el siguiente comando en la raíz del proyecto:

```
- node server.js
```

Luego de ejecutar el comando el servidor estará esperando por consultas a los servicios que ofrece.