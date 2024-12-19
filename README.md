# 🚀 Proyecto: Ejemplo de Realidad Aumentada con Three.js y WebXR

Este proyecto es un ejemplo didáctico de cómo implementar una experiencia de Realidad Aumentada (AR) en un entorno web utilizando **Three.js** y **WebXR**. El objetivo principal es:

- 🕵️‍♂️ **Detectar superficies** del mundo real donde colocar objetos 3D.
- 👆 **Interactuar** con la escena tocando la pantalla para ubicar nuevos elementos.
- 🎨 Añadir un elemento **artístico animado** para realzar la experiencia visual.

<img src="./demo.gif" width="120">

## 📋 Requisitos Previos

- Conocimientos básicos de **HTML**, **CSS** y **JavaScript**.
- Familiaridad con la librería **Three.js**.
- Un dispositivo móvil o navegador compatible con **WebXR** (generalmente Chrome en Android).

## 🛠 Tecnologías Utilizadas

- **Three.js**: Para la creación y manipulación de la escena 3D, geometrías, materiales y renderizado.
- **WebXR**: Para habilitar la detección del entorno real y la colocación de objetos en el espacio.
- **ARButton** (de los ejemplos de Three.js): Para integrar el botón de activación del modo AR.

## 🗂 Estructura del Código

El código principal se encuentra en un único fichero HTML que, además de la estructura base, incluye todo el JavaScript para:

- Configurar la escena, la cámara y el renderizado.
- Crear las luces, objetos iniciales y el elemento artístico.
- Solicitar y manejar las fuentes de _hit-test_.
- Añadir la lógica de interacción con el usuario para colocar objetos.

## 🔍 Puntos Clave del Código

### Inicialización de la Escena y el Renderizador

Se configura el renderizador, se crea la cámara, se inicializa la escena y se habilita el modo XR:

```javascript
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.xr.enabled = true;
```

### Activación del Modo AR

Se añade un botón AR a la interfaz. Este botón es necesario para que el usuario inicie la sesión AR en su dispositivo:

```javascript
document.body.appendChild(
  ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"],
  })
);
```

### Detección de Superficies (_Hit-Test_)

La función `initializeHitTestSource()` solicita al dispositivo una fuente de hit-test para detectar la superficie:

```javascript
const viewerSpace = await session.requestReferenceSpace("viewer");
hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
localSpace = await session.requestReferenceSpace("local");
```

En el bucle de renderizado, se obtienen los resultados de hit-test para posicionar un retículo (_target_) indicando dónde se puede colocar un objeto.

### Creación del Target (Retícula)

Se crea una geometría en forma de anillo que se utiliza como referencia visual:

```javascript
const geometry = new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(
  -Math.PI / 2
);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
target = new THREE.Mesh(geometry, material);
```

El _target_ se vuelve visible sólo cuando el hit-test detecta una superficie adecuada.

### Interacción con el Usuario

Se utiliza un controlador XR para escuchar el evento `select`, que se lanza cuando el usuario toca la pantalla en modo AR:

```javascript
var controller = renderer.xr.getController(0);
controller.addEventListener("select", onSelect);
```

En la función `onSelect()`, se añade un objeto en la posición del _target_.

### Elemento Artístico Animado

Además de los objetos colocados por el usuario, se añade una esfera artística que modifica su escala y color con el tiempo:

```javascript
const scale = 0.2 + 0.05 * Math.sin(timestamp / 500);
artisticSphere.scale.set(scale, scale, scale);

hue += 0.001;
artisticSphere.material.color.setHSL(hue, 1.0, 0.5);
```

Esta lógica se ejecuta en cada frame, logrando una animación fluida y permanente.

## 🎓 Conceptos Didácticos Aplicados

- **Referencias de Espacio XR**: Uso de _viewer_ y _local reference spaces_ para ubicar objetos 3D en relación al dispositivo del usuario.
- **Hit-Test**: Cómo encontrar la posición de una superficie real para colocar contenido virtual.
- **Materiales y Geometrías 3D**: Uso de cilindros, esferas y torus knot, variando su color, forma y ubicación.
- **Animación**: Uso de `setAnimationLoop()` y cálculos por frame para animar propiedades de los objetos.
- **Interacción Multiplataforma**: Habilitar interacciones táctiles en móviles en lugar de teclado o mouse.
