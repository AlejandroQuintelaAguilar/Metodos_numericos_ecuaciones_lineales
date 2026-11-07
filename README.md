# 🐾 Simulador EDO: Dinámica de Adopción y Estabilización Poblacional en Refugios de Animales

[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Métodos](https://img.shields.io/badge/M%C3%A9todos-Anal%C3%ADtico%20%7C%20Heun%20(RK2)%20%7C%20RK4-blue.svg)]()
[![Tecnologías](https://img.shields.io/badge/Stack-HTML5%20%7C%20Tailwind%20%7C%20Chart.js-teal.svg)]()

> **Proyecto:** Desafío Individual de Modelado con Ecuaciones Diferenciales Ordinarias (EDO) de Primer Orden  
> **Materia:** Métodos Numéricos  

---

## 📋 1. Descripción del Problema y Contexto Comunitario

* **Nombre del Desafío:** *«Huellitas Seguras: Dinámica de Adopción Comunitaria y Capacidad de Acogida»*.
* **Comunidad Beneficiaria:** Albergues de bienestar animal, redes comunitarias de rescate y familias adoptantes.
* **Problema Específico:** El abandono y sobrepoblación de animales callejeros satura la capacidad logística y financiera de los refugios. Las campañas de adopción crecen aceleradamente al principio gracias a las redes sociales y el boca a boca, pero eventualmente se desaceleran a medida que se agota el número de familias comunitarias con disponibilidad y condiciones para adoptar responsablemente.
* **Pregunta Concreta del Desafío:**  
  > *¿En cuántas semanas la campaña de rescate y adopción alcanzará el **80% de la capacidad de acogida comunitaria** ($160$ mascotas adoptadas), partiendo de $y_0 = 20$ animales reubicados en la semana cero, con un techo sostenible de $K = 200$ hogares y una tasa de difusión comunitaria $r = 0.25\text{ semana}^{-1}$?*

---

## 📐 2. Modelo Matemático

El fenómeno se modela mediante la **Ecuación Diferencial Logística de Verhulst**:

$$\frac{dy}{dt} = r \cdot y \left(1 - \frac{y}{K}\right), \quad \text{con condición inicial } y(0) = y_0$$

### Definición de Variables y Parámetros

| Variable / Parámetro | Símbolo | Tipo | Unidades | Valor Base | Interpretación Física / Comunitaria |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Tiempo** | $t$ | Independiente | semanas | $[0, 25]$ | Tiempo transcurrido desde el inicio de la campaña |
| **Adopciones Acumuladas** | $y(t)$ | Dependiente | animales | $y(0) = 20$ | Total de animales adoptados hasta la semana $t$ |
| **Capacidad de Carga** | $K$ | Parámetro | animales | $200$ | Techo máximo de adoptantes calificados en la zona |
| **Tasa Intrínseca de Difusión** | $r$ | Parámetro | $\text{semana}^{-1}$ | $0.25$ | Velocidad de propagación del mensaje y adopción |

### Supuestos del Modelo
1. El techo de familias adoptantes responsables ($K$) se mantiene constante durante el periodo analizado.
2. La tasa de abandono o reingreso al refugio es despreciable durante la campaña evaluada.
3. El ritmo de adopción responde tanto a la visibilidad acumulada ($y$) como al espacio de acogida restante $\left(1 - \frac{y}{K}\right)$.

---

## 🔍 3. Solución Analítica y Demostración por Sustitución

### A. Deducción por Separación de Variables
Separando variables e integrando mediante fracciones parciales:

$$\frac{dy}{y(K - y)} = \frac{r}{K} dt \implies \left[\frac{1}{y} + \frac{1}{K - y}\right] dy = r \, dt$$

Integrando ambos miembros:
$$\ln\left|\frac{y}{K - y}\right| = rt + C_1 \implies \frac{y}{K - y} = C e^{rt}$$

Aplicando la condición inicial $y(0) = y_0$:
$$C = \frac{y_0}{K - y_0}$$

Despejando $y(t)$ obtenemos la **solución analítica exacta**:
$$y(t) = \frac{K}{1 + \left(\frac{K - y_0}{y_0}\right) e^{-rt}}$$

### B. Comprobación Rigurosa por Sustitución
1. **Condición Inicial:**
   $$y(0) = \frac{K}{1 + \frac{K - y_0}{y_0}} = \frac{K}{\frac{K}{y_0}} = y_0 \quad \checkmark$$
2. **Sustitución en la EDO:**  
   Definiendo $A = \frac{K - y_0}{y_0}$, derivamos respecto a $t$:
   $$\frac{dy}{dt} = \frac{r K A e^{-rt}}{(1 + A e^{-rt})^2}$$
   Evaluando el miembro derecho:
   $$r y \left(1 - \frac{y}{K}\right) = r \left[\frac{K}{1 + A e^{-rt}}\right] \left[\frac{A e^{-rt}}{1 + A e^{-rt}}\right] = \frac{r K A e^{-rt}}{(1 + A e^{-rt})^2} \equiv \frac{dy}{dt} \quad \checkmark$$

### C. Respuesta Exacta a la Pregunta del Desafío
Para $y(t^*) = 0.80 K = 160$ animales con $A = \frac{200 - 20}{20} = 9$:
$$0.80 = \frac{1}{1 + 9 e^{-0.25 t^*}} \implies 9 e^{-0.25 t^*} = 0.25 \implies e^{-0.25 t^*} = \frac{1}{36}$$
$$t^* = \frac{\ln(36)}{0.25} = 4 \cdot \ln(36) \approx \mathbf{14.334 \text{ semanas}} \quad (\approx 14 \text{ semanas y } 2 \text{ días})$$

---

## 💻 4. Métodos Numéricos Implementados

### 1. Método de Heun (Runge-Kutta de 2.° Orden / Predictor-Corrector)
* **Predictor (Euler):** $y_{i+1}^* = y_i + h \cdot f(t_i, y_i)$
* **Corrector (Trapecio):** $y_{i+1} = y_i + \frac{h}{2} \left[ f(t_i, y_i) + f(t_i + h, y_{i+1}^*) \right]$
* **Orden de error:** $\mathcal{O}(h^2)$

### 2. Runge-Kutta Clásico de 4.° Orden (RK4)
* $k_1 = f(t_i, y_i)$
* $k_2 = f\left(t_i + \frac{h}{2}, y_i + \frac{h}{2} k_1\right)$
* $k_3 = f\left(t_i + \frac{h}{2}, y_i + \frac{h}{2} k_2\right)$
* $k_4 = f(t_i + h, y_i + h k_3)$
* $y_{i+1} = y_i + \frac{h}{6} (k_1 + 2k_2 + 2k_3 + k_4)$
* **Orden de error:** $\mathcal{O}(h^4)$

---

## 📊 5. Análisis Comparativo de Errores y Convergencia

### Tabla Comparativa de Rendimiento ($t \in [0, 15]$ semanas)

#### Paso Estándar: $h = 1.0\text{ semanas}$
| $t$ (sem) | $y_{\text{exacto}}$ | $y_{\text{Heun}}$ | $E_{\text{rel}}$ Heun (%) | $y_{\text{RK4}}$ | $E_{\text{rel}}$ RK4 (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **0.0** | 20.0000 | 20.0000 | 0.0000% | 20.0000 | 0.000000% |
| **2.0** | 30.9656 | 30.8877 | 0.2515% | 30.9654 | 0.000604% |
| **5.0** | 55.8887 | 55.6320 | 0.4592% | 55.8881 | 0.001006% |
| **10.0** | 115.0242 | 114.5380 | 0.4227% | 115.0233 | 0.000762% |
| **14.0** | 157.2603 | 156.7823 | 0.3040% | 157.2595 | 0.000505% |
| **15.0** | 165.0628 | 164.6060 | 0.2768% | 165.0621 | 0.000467% |

#### Paso Fino: $h = 0.5\text{ semanas}$
| $t$ (sem) | $y_{\text{exacto}}$ | $y_{\text{Heun}}$ | $E_{\text{rel}}$ Heun (%) | $y_{\text{RK4}}$ | $E_{\text{rel}}$ RK4 (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **0.0** | 20.0000 | 20.0000 | 0.0000% | 20.0000 | 0.000000% |
| **2.0** | 30.9656 | 30.9445 | 0.0681% | 30.9656 | 0.000041% |
| **5.0** | 55.8887 | 55.8195 | 0.1237% | 55.8886 | 0.000067% |
| **10.0** | 115.0242 | 114.8953 | 0.1120% | 115.0241 | 0.000050% |
| **14.0** | 157.2603 | 157.1378 | 0.0779% | 157.2603 | 0.000033% |
| **15.0** | 165.0628 | 164.9469 | 0.0702% | 165.0628 | 0.000030% |

### Conclusiones de Precisión Numérica
1. **Verificación de Órdenes Teóricos:** Al reducir el tamaño de paso a la mitad ($h: 1.0 \to 0.5$), el error de Heun disminuye en un factor aproximado de $4 = 2^2$ (de $0.459\%$ a $0.124\%$), confirmando $\mathcal{O}(h^2)$. Para RK4, el error disminuye en un factor aproximado de $15 \approx 2^4$ (de $0.001006\%$ a $0.000067\%$), confirmando $\mathcal{O}(h^4)$.
2. **Dominancia de RK4:** RK4 demostró ser entre **450 y 1,800 veces más preciso** que Heun para un mismo costo computacional mínimo.

---

## 🚀 6. Instrucciones de Ejecución Local y Despliegue

### Ejecución Local
No requiere instalación de librerías ni dependencias pesadas:
1. Clona o descarga este repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/simulador-edo-adopciones.git
   cd simulador-edo-adopciones
   ```
2. Opción A: Haz doble clic directamente en el archivo `index.html` para abrirlo en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).
3. Opción B: Si deseas levantarlo mediante un servidor local:
   ```bash
   # Con Python:
   python -m http.server 3000
   # Abrir en el navegador: http://localhost:3000
   ```

### Despliegue en GitHub Pages (Gratis y en 1 minuto)
1. Sube este repositorio a tu cuenta de GitHub.
2. En GitHub, ve a **Settings** > pestaña **Pages**.
3. En **Branch**, selecciona `main` (o `master`) y carpeta `/ (root)`.
4. Haz clic en **Save**. En 1 o 2 minutos tendrás tu URL pública del tipo:
   `https://TU_USUARIO.github.io/simulador-edo-adopciones/`

---

## 🎬 7. Estructura del Video Explicativo (1 Minuto)

| Segundo | Contenido / Pantalla | Diálogo sugerido |
| :---: | :--- | :--- |
| **00 - 10 s** | Portada y Contexto | *"Hola, en este proyecto de Métodos Numéricos modelamos la dinámica de adopción de un refugio comunitario animal mediante una EDO logística de primer orden con condición inicial."* |
| **11 - 25 s** | EDO y Solución Analítica | *"Formulamos la ecuación dy/dt = r*y*(1 - y/K) con y(0)=20. Resolviendo analíticamente por fracciones parciales demostramos que la meta del 80% (160 animales) se alcanza exactamente a las 14.33 semanas."* |
| **26 - 45 s** | Métodos Numéricos y Demo App | *"Implementamos los métodos de Heun (RK2) y Runge-Kutta 4 en esta aplicación interactiva. Al comparar con h=1.0 y h=0.5, RK4 alcanza una precisión hasta 1,800 veces superior a Heun, validando experimentalmente sus órdenes de convergencia O(h²) y O(h⁴)."* |
| **46 - 60 s** | Conclusión Comunitaria | *"La simulación permite a la comunidad planificar sus campañas de difusión antes de la semana 12 para evitar la saturación. Todo el código y la app están disponibles en GitHub."* |

---

## 📂 8. Estructura de Archivos

```
├── index.html                           # Aplicación web interactiva SPA
├── app.js                               # Motores de cálculo (EDO, Analítica, Heun, RK4) e interactividad
├── styles.css                           # Estilos visuales y adaptaciones responsivas
├── Desafio_EDO_Metodos_Numericos.docx   # Documento oficial de especificaciones
└── README.md                            # Documentación técnica completa y reporte
```
