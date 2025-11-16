# Sistema de Parqueaderos — Aplicación de Escritorio (Electron + React + Vite)

## Descripción general del proyecto
El Sistema de Parqueaderos es una aplicación de escritorio que centraliza la operación diaria de un parqueadero: registro de entradas y salidas de vehículos, administración de tarifas, gestión de placas, control de caja del día e impresión de recibos. Está construida con **Electron** (proceso principal y canal IPC), **React** (interfaz de usuario), **Vite** (bundling y desarrollo rápido) y **Node.js** (runtime y utilidades).

La aplicación resuelve la problemática de registros manuales dispersos y cálculos poco confiables, ofreciendo una solución integral, moderna y segura. Funciona de forma local, con persistencia en el equipo del cliente, y permite imprimir recibos mediante un canal **IPC** hacia el proceso principal, que controla la comunicación con la impresora. Su interfaz es intuitiva, con flujos claros para operadores y administradores.

## Tecnologías utilizadas
- **Electron**: framework para construir aplicaciones de escritorio con tecnologías web. Orquesta el **proceso principal**, **proceso de render** y el **canal IPC** para comunicación segura.
- **React**: biblioteca para construir interfaces de usuario modernas, reactivas y componibles.
- **Vite**: herramienta de desarrollo y bundling de alto rendimiento con HMR.
- **Node.js**: runtime de JavaScript que habilita utilidades del sistema, acceso a archivos y librerías del ecosistema.
- **TypeScript**: tipado estático para mejorar la mantenibilidad y la calidad del código.
- **IPC (Inter-Process Communication)**: canal seguro entre el render y el proceso principal para tareas como impresión y acceso al sistema.
- **Persistencia local**: almacenamiento de datos en el equipo (por ejemplo, archivos estructurados o base local), diseñado para funcionar offline.

## Características principales
- **Registro de vehículos**: entradas y salidas con fecha/hora, operador y observaciones.
- **Cálculo automático de tarifas**: reglas configurables por tipo de vehículo, tiempo y políticas del negocio.
- **Administración de placas**: normalización de formato, búsqueda rápida y listas frecuentes.
- **Caja del día**: resumen de ingresos/egresos, cortes, arqueos y reporte de cierre.
- **Impresión de recibos**: emisión y reimpresión con plantillas, vía IPC desde el proceso principal.
- **Persistencia local**: almacenamiento confiable, backups y recuperación ante fallos.
- **Interfaz moderna e intuitiva**: diseño enfocado en productividad, accesos directos y estados claros.
- **Filtros y reportes**: búsqueda por placa, rango de tiempo, tipo de vehículo y estado.

## Instalación y ejecución

### Requisitos previos
- **Node.js** 18 LTS o superior
- **Git**
- Gestor de paquetes: **npm** (o **pnpm/yarn**, según preferencia)

### Clonar el repositorio
```bash
git clone https://github.com/<organizacion>/<repositorio>.git
cd <repositorio>
```

### Instalar dependencias
```bash
npm install
```

### Desarrollo
Existen distintas configuraciones posibles. En la mayoría de los entornos Electron + Vite se utiliza uno de los siguientes flujos:

1) **Un solo comando** (si el `package.json` lo orquesta):
```bash
npm run dev
```
Esto levanta el render con Vite y ejecuta Electron apuntando al servidor de desarrollo.

2) **Dos terminales** (renderer y main por separado):
```bash
# Terminal A: render (React + Vite)
npm run dev

# Terminal B: proceso principal (Electron)
npm exec electron .
```

### Build / Instalador
Dependiendo de la herramienta usada para empaquetar (por ejemplo **electron-builder** o **Electron Forge**), utilice alguno de estos comandos estándar:

- Con electron-builder:
```bash
npm run build       # build del frontend (Vite)
npm run dist        # genera instaladores / binarios
```

- Con Electron Forge:
```bash
npm run build       # build del frontend (Vite)
npm run make        # genera instaladores / binarios
```

Revise el `package.json` del proyecto para confirmar los scripts disponibles y adaptarlos a su entorno.

## Estructura del proyecto
La estructura puede variar según la configuración, pero típicamente:

```
.
├─ electron/           # Proceso principal de Electron (main.ts), preload, IPC
├─ src/                # Interfaz (React): componentes, páginas, hooks, estado
├─ public/             # Recursos estáticos (iconos, fuentes)
├─ dist/               # Build del frontend generado por Vite
├─ release/            # Artefactos de empaquetado (instaladores/binaries)
├─ types/              # Tipos compartidos (TypeScript)
├─ scripts/            # Scripts auxiliares (automatización)
├─ package.json        # Scripts, dependencias y metadatos
├─ tsconfig*.json      # Configuración de TypeScript
└─ README.md           # Documentación del proyecto
```

## Autores
- **Elkin Mendoza López** – U00182176
- **Juan Camilo Caballero López** – U00181396
- **Juan Sebastián Suárez Pava** – U00182794

## Licencia
Este proyecto se distribuye bajo la licencia **MIT** (recomendada para proyectos abiertos y colaborativos). Puede adaptar a otra licencia estándar según necesidades específicas.
