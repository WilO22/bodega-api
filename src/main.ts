import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Lee el puerto desde las variables de entorno
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // 2. Prefijo global: todas las rutas empiezan con /api
  app.setGlobalPrefix('api');

  // 3. Helmet: agrega headers HTTP de seguridad
  app.use(helmet());

  // 4. CORS: permite que Angular (puerto 4200) se conecte
  app.enableCors({
    // 1. Define quién tiene permitido entrar
    origin: ['http://localhost:4200'],

    // 2. Define qué acciones pueden realizar
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],

    // 3. Define qué metadatos o cabeceras adicionales tiene permitido enviar el frontend
    // - Content-Type: Permite enviar datos en formatos específicos (como JSON)
    // - Accept: Permite que el cliente declare qué tipo de respuesta espera recibir
    // - Authorization: Permite el envío de tokens de seguridad (como JWT) para validar al usuario
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],

    // 4. Permite el envío de credenciales y cookies
    credentials: true,
  });

  // 5. ValidationPipe global: valida TODOS los DTOs automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina del objeto recibido cualquier propiedad que no esté definida en el DTO
      whitelist: true,
      // Si el cliente envía propiedades no permitidas, rechaza la petición con un error 400
      forbidNonWhitelisted: true,
      // Convierte automáticamente los tipos de datos de la red (como texto) al tipo real del DTO
      transform: true,
    }),
  );

  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}/api`);
}
bootstrap();
