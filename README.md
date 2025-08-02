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


## PostgreSQL

```bash
yarn add @nestjs/typeorm typeorm pg
```

```typescript
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, // Usualmente falso en producción
    }),
  ],
})

export class AppModule {}
```

### TypeORM
En el ejemplo estamos usando TypeORM, para ello en nuestro nuevo recurso debemos hacer la siguiente configuración:

```typescript
// product.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export  class  Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;
  
  @OneToMany(()  =>  ProductImage, (productImage)  =>  productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];
}

// products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [TypeOrmModule.forFeature([Product])],
})
export  class  ProductsModule {}
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


# Dockerizar aplicación de NestJS

```docker
# Install dependencies only when needed
FROM node:18-alpine3.15 AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the app with cache dependencies
FROM node:18-alpine3.15 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production image, copy all the files and run next
FROM node:18-alpine3.15 AS runner

# Set working directory
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --prod
COPY --from=builder /app/dist ./dist

# # Copiar el directorio y su contenido
# RUN mkdir -p ./pokedex
# COPY --from=builder ./app/dist/ ./app
# COPY ./.env ./app/.env

# # Dar permiso para ejecutar la applicación
# RUN adduser --disabled-password pokeuser
# RUN chown -R pokeuser:pokeuser ./pokedex
# USER pokeuser

# EXPOSE 3000

CMD ["node","dist/main"]
```

O en su forma simple:

```docker
FROM node:18-alpine3.15

# Set working directory
RUN mkdir -p /var/www/pokedex
WORKDIR /var/www/pokedex

# Copiar el directorio y su contenido
COPY . ./var/www/pokedex
COPY package.json tsconfig.json tsconfig.build.json /var/www/pokedex/
RUN yarn install --prod

RUN yarn build

# Dar permiso para ejecutar la applicación
RUN adduser --disabled-password pokeuser
RUN chown -R pokeuser:pokeuser /var/www/pokedex
USER pokeuser

# Limpiar el caché
RUN yarn cache clean --force

EXPOSE 3000

CMD [ "yarn","start" ]
```

Y para nuestro `docker-compose.yaml`:

```yaml
version: '3'

services:
  pokedexapp:
    depends_on:
      - db
    build: 
      context: .
      dockerfile: Dockerfile
    image: pokedex-docker
    container_name: pokedexapp
    restart: always # reiniciar el contenedor si se detiene
    ports:
      - "${PORT}:${PORT}"
    # working_dir: /var/www/pokedex
    environment:
      MONGODB: ${MONGODB}
      PORT: ${PORT}
      DEFAULT_LIMIT: ${DEFAULT_LIMIT}
    # volumes:
    #   - ./:/var/www/pokedex

  db:
    image: mongo:5
    container_name: mongo-poke
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGODB_DATABASE: nest-pokemon
    # volumes:
    #   - ./mongo:/data/db
```


# Carga de archivos

Primero necesitaremos crear un recurso REST API para poder agregar nuestro endpoint:

```bash
nest g res files --no-spec
```

Luego modificamos y agregamos nuestro endpoint en nuestro nuevo controlador y servicio, hecho esto instalamos el siguiente paquete de definición:

```bash
npm i -D @types/multer
```

Hecho todo esto podemos crear nuestros validadores, recibir nuestros archivos y demás, para ver el ejemplo completo podemos acceder al proyecto 04.


## Nota

Importante tener en cuenta que si queremos servir archivos estáticos tendremos que realizar otra instalación:

```bash
npm i @nestjs/serve-static
```


# Autenticación

## Encriptación de contraseñas

Para encriptar contraseñas podemos usar la librería `bcrypt`, y podemos ejecutar la siguiente instrucción:

```typescript
import * as bcrypt from 'bcrypt';

const hashedPassword: string = bcrypt.hashSync('youPassword', 10);
```

Y para validar 2 contraseñas (sabiendo que la encriptación es en una sola vía) podemos ejecutar la siguiente línea de código:

```typescript
const passwordMatches: boolean = bcrypt.compareSync(password, user.password);
```


## JWT

Para basar nuestra autenticación en JWTs podemos hacer uso de la siguiente [referencia](https://docs.nestjs.com/security/authentication#jwt-functionality) de la documentación de NestJS.

Como requerimiento tendremos que agregar los siguientes paquetes:

```bash
yarn add @nestjs/passport passport

yarn add @nestjs/jwt passport-jwt

yarn add -D @types/passport-jwt
```

Teniendo ya instalado todo esto, para indicar que vamos a usar JWT, tendremos que modificar nuestro módulo de autenticación de la siguiente manera:

```typescript
import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from './entities/user.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.register({
      // secret: process.env.JWT_SECRET,
      // signOptions: {
        // expiresIn: '2h',
      // },
    // }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService)  => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
  ],
  exports: [JwtModule, JwtStrategy, PassportModule, TypeOrmModule],
})
export class AuthModule {}
```

Como podemos ver usamos registerAsync y no register, esto es porque así podemos hacer la inyección de dependencias del configService y adicional podemos esperar a que las variables de entorno ya estén cargadas para ser leídas en el código.

En nuestro JwtStrategy indicamos toda la validación y demás que queremos aplicar para la autenticación de nuestros endpoints:

```typescript
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from  '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../entities/user.entity';

@Injectable()
export  class  JwtStrategy  extends  PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private  readonly  userRepository: Repository<User>,

    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async  validate(payload: JwtPayload): Promise<User> {
    const { email } = payload;

    const user = await this.userRepository.findOneBy({ email });

    if (!user) throw new UnauthorizedException('Token not valid');

    if (!user.isActive) throw new UnauthorizedException('User is inactive');

    return  user;
  }
}
```

Y ya para usar todo lo que creamos para generar nuestro JWT, podemos hacer algo como lo siguiente:

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}


  private  login(payload: JwtPayload) {
    return {
      token: this.getJwt({ email: user.email }), // Podemos usar el campo que queramos para nuestro payload
    };
  }

  private  getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }
}
```


## Custom guards

Para proteger nuestras rutas y hacerlas privadas, la forma recomendada es tener nuestros propios Guards, para ello primero debemos generar un nuevo Guard para nuestra autenticación:

```bash
nest g gu auth/guards/userRole --no-spec
```

Y también tendremos que generar un decorador para controlar el manejo de nuestros datos (en este caso los roles del usuario):

```bash
nest g d auth/decorators/roleProtected --no-spec
```


## Composición de decoradores

Si queremos tener un decorador personalizado que junte varios decoradores podemos hacer algo como lo siguiente:

```typescript
// Decorador nuevo
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';
import { ValidRoles } from '../interfaces';
  
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}

// Nuestro endpoint en el controlador
@Get('private3')
@Auth(ValidRoles.admin, ValidRoles.superUser)
privateRoute3(@GetUser() user: User) {
  return {
    ok: true,
    user,
  };
}
```


## Usar nuestro nuevo decorador en otro módulo

Para usar nuestro decorador de Auth en otro módulo, podemos hacer lo siguiente en el módulo que estamos actualizando:

```typescript
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [AuthModule, ProductsModule],
})
export  class  SeedModule {}
```

Si queremos que todos los endpoints de nuestro controlador requieran autenticación podemos hacer esto:

```typescript
@Controller('products')
@Auth()
export class ProductsController {
  // Nuestro constructor y endpoints
}
```

