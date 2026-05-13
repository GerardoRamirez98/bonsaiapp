# Bonsai Care App

Bitácora inteligente para cuidar bonsáis desde Expo y React Native. La app permite registrar una colección de árboles, sincronizar datos con Firebase, dar seguimiento a riegos, fotos, salud, exposición solar y eventos importantes.

## Funciones principales

- Colección de bonsáis con estado, especie, fotos y actividad reciente.
- Sincronización en tiempo real con Firebase Auth y Firestore.
- Estructura Firestore por usuario: `users/{userId}/bonsais/{bonsaiId}`.
- Migración inicial de datos locales hacia Firebase cuando el usuario inicia sesión.
- Registro manual de riego con fecha, hora y notas.
- Galería de revisión para conservar, eliminar o marcar portada.
- Timeline centralizado para eventos de riego, fotos, sol, poda, trasplante y notas.
- Detección de especie por foto usando Plant.id.
- Clima local como contexto para recomendaciones de cuidado.

## Stack

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- TypeScript strict
- Firebase modular SDK
- Zustand como cache/UI state

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

3. Completa las variables Firebase y Plant.id.

## Scripts útiles

Expo Go:

```bash
npm run start:go
npm run start:go:lan
npm run start:go:tunnel
```

Development build:

```bash
npm run start:dev
npm run start:dev:lan
npm run start:dev:tunnel
```

Web:

```bash
npm run web
```

Validación:

```bash
npx tsc --noEmit
npm run lint
```

## Firebase

La app usa Firebase como fuente principal de datos persistentes. Los datos importantes se sincronizan desde Firestore y el store local mantiene cache y estado de UI.

Estructura base:

```text
users/{userId}
users/{userId}/bonsais/{bonsaiId}
users/{userId}/bonsais/{bonsaiId}/photos/{photoId}
```

## Notas de desarrollo

- No guardes secretos reales en Git. Usa `.env` local y conserva `.env.example` sin valores.
- Expo Go tiene limitaciones para notificaciones push en Android con SDK modernos; para funciones nativas completas usa development build.
- El timeline debe ser la fuente visual principal para calendario e historial.
