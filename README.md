# Crear proyecto de NestJS

Recordemos que lo usual es usar TypeScript con NestJS, y para crear un proyecto desde 0 podemos ejecutar el siguiente comando:

```bash
# Instalar nest
npm i -g @nestjs/cli

nest new nombre-projecto
```


## Solucionar problemas de permisos

```bash
sudo chmod 777 -R path/
```


## Comandos útiles

```bash
# Crear nuevo módulo
nest g mo nombre-modulo

# Crear nuevo componente
nest g co nombre-componente

# Crear un nuevo servicio (--no-spec no crea el archivo de pruebas)
nest g s nombre-servicio --no-spec
```


