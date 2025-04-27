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

# Crear un nuevo recurso
nest g res --no-spec
```


# DTOs

Nos permiten crear clases para indicar la estructura de los datos que vamos a recibir. Para instalar los paquetes necesarios podemos ejecutar el siguiente comando:

```bash
yarn add class-validator class-transformer
```

Y teniendo todo esto listo, podemos hacer lo siguiente:

```typescript
// Agregar en main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);

// DTO de carros
import { IsString } from 'class-validator';

export  class  CreateCarDto {
  @IsString()
  public  readonly  brand: string;

  @IsString()
  public  readonly  model: string;
}
```

# Nest CLI Resource
Todo este proceso de crear DTOs y endpoints puede ser muy manual, pero Nest CLI Resource nos brinda unas ayudas enormes para hacer esto de forma más automática y rápida. Para crear los recursos podemos usar siguiente comando:

```bash
nest g res
```

Esto nos genera el módulo, componente, servicio, DTOs y entities para empezar con nuestro trabajo.

Luego si queremos usar servicios de otros módulos dentro de un módulo de algún recurso en especial, debemos tener en cuenta lo siguiente:

```typescript
// Módulo a exportar (importante el "exports")
import { Module } from '@nestjs/common';

import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  controllers: [BrandsController],
  exports: [BrandsService],
  providers: [BrandsService],
})

export  class  BrandsModule {}

// Módulo donde necesitamos importar (en este caso el servicio)
import { Module } from '@nestjs/common';

import { BrandsModule } from 'src/brands/brands.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  controllers: [SeedController],
  imports: [BrandsModule],
  providers: [SeedService],
})

export  class  SeedModule {}
```

