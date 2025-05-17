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
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
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


# Global prefix

Para colocar un prefix global a nuestra api, podemos modificar nuestro archivo `main.ts` y colocar las siguientes instrucciones:

```typescript
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await  NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```


# Paquetes para bases de datos

## MongoDB

```bash
yarn add @nestjs/mongoose mongoose
```

```typescript
// main.ts
import { join } from 'path';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';

import { PokemonModule } from './pokemon/pokemon.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
    PokemonModule,
  ],
})
export  class  AppModule {}
```


# Variables de entorno

Para poder usar nuestros archivos `.env` tendremos que indicarle a Nest de la existencia del mismo. Para poder hacer esto tendremos que instalar el siguiente paquete:

```bash
yarn add @nestjs/config
```

Hecho esto, tendremos que agregar en nuestro `app.module.ts` en los imports `ConfigModule.forRoot()`.

```typescript
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule.forRoot()],
})
export  class  AppModule {}
```


## Configuration loader

Para garantizar que los datos sean adecuados y no recibir un `undefined` de forma inesperada, podemos crear un configuration loader, para esto es típico usar archivos con nombre `app.config.ts` o `env.config.ts` y podemos crear un archivo con la siguiente sintaxis:

```typescript
export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB_URL,
  port: process.env.PORT || 3002,
  defaultLimit: +(process.env.DEFAULT_LIMIT || 7),
});
```

Y luego modificar nuestro `app.module.ts` para indicarle a Nest que debe usar ese archivo de configuración.

```typescript
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { EnvConfiguration } from './config/env.config';

@Module({
  imports: [ConfigModule.forRoot({
    load: [EnvConfiguration],
  })],
})
export  class  AppModule {}
```

## Configuration service

En el constructor de nuestro servicio podemos colocar un parámetro con tipado `ConfigService` para poder pasar nuestro objeto con todos los valores de las variables de entorno. También debemos agregar el `ConfigModule` en nuestros imports del módulo donde queremos usar estas variables de entorno.


## Validación de Schemas con joi

Lo primero que debemos hacer es instalar el paquete:

```bash
yarn add joi
```

Luego podemos crearnos un archivo `joi.validation.ts` con el siguiente contenido:

```typescript
import * as Joi from 'joi';

export const JoiValidationSchema  =  Joi.object({
  MONGODB_DATABASE: Joi.required(),
  MONGODB_URL: Joi.required(),
  PORT: Joi.number().default(3005),
  DEFAULT_LIMIT: Joi.number().default(6),
});
```

Y en nuestro `app.module.ts` colocar lo siguiente en los imports:

```typescript
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [ConfigModule.forRoot({
    load: [EnvConfiguration],
    validationSchema: JoiValidationSchema,
  })],
})
export  class  AppModule {}
```

