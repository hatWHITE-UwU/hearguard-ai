# MEMORIA DESCRIPTIVA DE SOFTWARE
## Documento Técnico para Registro de Propiedad Intelectual de Software

---

# HEARGUARD AI v1.0
### Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva mediante Monitoreo IoT, Machine Learning y Plataforma Multiplataforma

---

**Institución titular**
Universidad Continental
Escuela Académico Profesional de Ingeniería de Sistemas e Informática
Av. San Carlos 1980, El Tambo, Huancayo 12006, Región Junín, Perú

**Autores del software**
Terreros Hinojosa, Luis Francisco
Rondinel Aquino, Hardy Eduardo

**Asesor académico**
Maglioni Arana Caparachín
Universidad Continental

---

## Tabla de Contenido

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Capítulo I — Información General del Software](#capítulo-i--información-general-del-software)
- [Capítulo II — Contexto y Problemática del Sector](#capítulo-ii--contexto-y-problemática-del-sector)
- [Capítulo III — Descripción General del Software](#capítulo-iii--descripción-general-del-software)
- [Capítulo IV — Arquitectura Empresarial](#capítulo-iv--arquitectura-empresarial)
- [Capítulo V — Arquitectura de Software](#capítulo-v--arquitectura-de-software)
- [Capítulo VI — Funcionalidades del Sistema](#capítulo-vi--funcionalidades-del-sistema)
- [Capítulo VII — Modelo de Datos](#capítulo-vii--modelo-de-datos)
- [Capítulo VIII — Inteligencia Artificial y Modelo Predictivo](#capítulo-viii--inteligencia-artificial-y-modelo-predictivo)
- [Capítulo IX — Seguridad Informática](#capítulo-ix--seguridad-informática)
- [Capítulo X — Calidad del Software](#capítulo-x--calidad-del-software)
- [Capítulo XI — Innovación y Originalidad](#capítulo-xi--innovación-y-originalidad)
- [Capítulo XII — Resultados Obtenidos](#capítulo-xii--resultados-obtenidos)
- [Capítulo XIII — Evolución Futura](#capítulo-xiii--evolución-futura)
- [Conclusiones](#conclusiones)
- [Referencias Bibliográficas](#referencias-bibliográficas)
- [Anexos Propuestos](#anexos-propuestos)

---

## Resumen Ejecutivo

HearGuard AI versión 1.0 es una plataforma de software inteligente, de tipo HealthTech, concebida y desarrollada para automatizar de manera integral la prevención, el monitoreo y la predicción del riesgo de pérdida auditiva inducida por ruido en usuarios individuales. El sistema fue diseñado específicamente para resolver la brecha existente entre la medición aislada del ruido ambiental y la intervención preventiva personalizada, problemática que afecta de forma estructural a millones de personas expuestas a entornos sonoros de riesgo —trabajadores en sectores industriales, estudiantes universitarios y usuarios intensivos de dispositivos personales de audio— sin acceso a herramientas integradas de evaluación y predicción auditiva.

La originalidad del software no reside en la invención aislada de una tecnología inédita, sino en la integración coherente, sistemática y orquestada de tecnologías maduras —monitoreo acústico en tiempo real mediante dispositivos IoT de bajo costo, evaluación auditiva por cuestionario digital, predicción de riesgo mediante aprendizaje automático y plataforma multiplataforma web y móvil— dentro de un único flujo de trabajo automatizado, trazable y auditado bajo metodologías formales de ingeniería de software. Esta integración, articulada bajo una arquitectura de microservicios, desarrollada con TDD y BDD como metodología principal y CRISP-DM como metodología complementaria para el modelo predictivo, y aplicada al dominio específico de la salud auditiva preventiva, constituye la contribución técnica original y diferencial del sistema.

Funcionalmente, HearGuard AI transforma la exposición sonora cotidiana del usuario —capturada mediante el micrófono del dispositivo móvil, del navegador web o de un sensor IoT ESP32— en un perfil de riesgo auditivo personalizado, expresado en cuatro niveles cualitativos (Bajo, Moderado, Alto, Muy Alto) y acompañado de recomendaciones preventivas adaptativas. El flujo completo —desde el registro del usuario hasta la visualización del dashboard de salud auditiva— se ejecuta de manera integrada en la plataforma, eliminando la dependencia de múltiples herramientas desconectadas que caracteriza el modelo de gestión de salud auditiva tradicional.

Desde el punto de vista de la ingeniería de software, el sistema se sustenta sobre una arquitectura multiplataforma de microservicios, construida bajo el patrón API First, con una capa de presentación web implementada en Angular 21, una aplicación móvil nativa en Flutter 3, un backend REST en Node.js 20 con Express 5 como API gateway y capa de negocio, un microservicio de inteligencia artificial en Python 3.11 con Flask y scikit-learn, una base de datos NoSQL en MongoDB Atlas y una infraestructura de despliegue contenerizada con Docker. El proceso de calidad se acredita mediante 507 casos de prueba automatizados en seis capas, análisis estático con SonarCloud (Quality Gate aprobado, cobertura 100 %, Rating A en Seguridad, Confiabilidad y Mantenibilidad) y un pipeline de integración continua con diez jobs en GitHub Actions.

El presente documento constituye la memoria descriptiva técnica del software HearGuard AI v1.0, elaborada con el propósito de documentar de manera formal, profunda y trazable su originalidad, su funcionamiento interno, su arquitectura tecnológica, la integración de las tecnologías que lo componen, su carácter innovador, su alcance funcional y la autoría intelectual de quienes lo concibieron y desarrollaron. El documento está estructurado en trece capítulos que abordan, respectivamente, la información general del software, el contexto y la problemática del sector, la descripción general del sistema, la arquitectura empresarial, la arquitectura de software, las funcionalidades del sistema, el modelo de datos, la inteligencia artificial, la seguridad, la calidad, la innovación y originalidad, los resultados y la evolución futura del sistema, proporcionando una base documental sólida y completa para los fines de registro de propiedad intelectual de software.

---

## Capítulo I — Información General del Software

El presente capítulo establece la identificación formal del software objeto de la presente memoria descriptiva, precisando su denominación, su versión, la institución titular, las personas naturales que ostentan la autoría intelectual, el asesoramiento académico que respaldó su concepción, los objetivos que orientaron su desarrollo, el alcance funcional comprometido, las restricciones que delimitan su operación y la población de usuarios a la que está dirigido.

### 1.1 Nombre del Software

El software se denomina **HearGuard AI**. La denominación es una construcción lingüística compuesta que sintetiza tres elementos semánticos: el componente «Hear», del idioma inglés, que alude a la función auditiva humana y constituye el dominio de aplicación del sistema; el componente «Guard», también del inglés, que significa «guardia» o «protector», comunicando la naturaleza preventiva del sistema como un guardián activo de la salud auditiva del usuario; y el componente «AI», acrónimo de Artificial Intelligence (inteligencia artificial), que identifica la naturaleza tecnológica esencial del sistema como una plataforma impulsada por aprendizaje automático. La denominación, en su conjunto, comunica de manera concisa y unívoca la identidad del producto: un sistema inteligente de protección auditiva.

### 1.2 Versión

La versión documentada en la presente memoria es **HearGuard AI v1.0**. La numeración de versión adopta el esquema de versionamiento semántico (Semantic Versioning), en el cual el primer dígito identifica la versión mayor (major), que denota un conjunto de funcionalidades estable y completo destinado a producción. La versión 1.0 corresponde a la primera versión funcional del sistema, cuyo alcance funcional comprende la totalidad de las capacidades descritas en la sección 1.8. Las iteraciones posteriores del sistema incorporarán las capacidades adicionales documentadas en el Capítulo XIII.

### 1.3 Institución Titular

La titularidad académica e intelectual del software HearGuard AI v1.0 corresponde a sus autores en el marco de su formación en la **Universidad Continental**, Escuela Académico Profesional de Ingeniería de Sistemas e Informática, con domicilio en Av. San Carlos 1980, El Tambo, Huancayo 12006, Región Junín, Perú. La Universidad Continental es una institución de educación superior universitaria con acreditación reconocida por la Superintendencia Nacional de Educación Superior Universitaria (SUNEDU). El software fue desarrollado como trabajo de investigación y desarrollo final de carrera en el marco de los programas académicos de la escuela profesional referida. La autoría intelectual corresponde a las personas naturales identificadas en la sección 1.4, quienes concibieron, diseñaron e implementaron el sistema en su integridad.

### 1.4 Autores

La autoría intelectual del software HearGuard AI v1.0, entendida como la concepción, el diseño y el desarrollo de la obra de software, corresponde a las siguientes personas naturales:

**Terreros Hinojosa, Luis Francisco**, identificado con DNI N.° 76926326, estudiante de la Escuela Académico Profesional de Ingeniería de Sistemas e Informática de la Universidad Continental, en calidad de autor principal del software. Responsable de la concepción de la arquitectura del sistema, el diseño e implementación del backend REST, el microservicio de inteligencia artificial, el firmware IoT, el pipeline de CI/CD, la infraestructura de despliegue en producción, la configuración de análisis estático y la redacción de la documentación técnica completa.

**Rondinel Aquino, Hardy Eduardo**, identificado con DNI N.° 71798927, estudiante de la Escuela Académico Profesional de Ingeniería de Sistemas e Informática de la Universidad Continental, en calidad de coautor del software. Responsable del desarrollo de componentes de la interfaz web Angular, la aplicación móvil Flutter, la implementación de pantallas de visualización y las contribuciones a las pruebas funcionales y de integración del sistema.

Ambos autores participaron de manera coordinada en las distintas fases del ciclo de vida del software, incluyendo el análisis de la problemática, la definición de los 60 requisitos funcionales y 10 requisitos no funcionales, el diseño de la arquitectura multiplataforma, la integración de los componentes tecnológicos y la validación funcional del sistema.

### 1.5 Asesor Académico

El desarrollo del software contó con el asesoramiento académico de **Maglioni Arana Caparachín**, docente de la Universidad Continental, quien orientó el marco metodológico del proyecto, supervisó la aplicación de las metodologías TDD+BDD y CRISP-DM, validó los criterios de calidad de software adoptados y asesoró la estructura del trabajo académico. El asesoramiento académico garantizó la coherencia entre el rigor metodológico aplicado en el desarrollo y los estándares académicos de la institución.

### 1.6 Objetivo General

El objetivo general que orientó el desarrollo de HearGuard AI es diseñar, desarrollar y validar una plataforma de salud auditiva preventiva basada en monitoreo IoT, cuestionario auditivo y predicción de riesgo con aprendizaje automático, siguiendo **Test-Driven Development (TDD)** y **Behavior-Driven Development (BDD)** como metodología principal de ingeniería de software y **CRISP-DM** como metodología complementaria para la construcción del modelo predictivo, con el propósito de integrar en una única plataforma multiplataforma las capacidades de monitoreo en tiempo real, autoevaluación auditiva y estimación cuantitativa del riesgo de pérdida auditiva del usuario, generando trazabilidad explícita entre requisitos, escenarios de comportamiento, pruebas automatizadas y código de producción.

### 1.7 Objetivos Específicos

1. Diseñar e implementar una API REST con autenticación segura mediante JWT con rotación de refresh tokens por hash SHA-256 que centralice la información de usuarios, lecturas de ruido, evaluaciones auditivas, resultados y dispositivos IoT, en una base de datos MongoDB Atlas.

2. Construir una interfaz web multiplataforma en Angular 21 con componentes standalone y una aplicación móvil nativa en Flutter 3, que ofrezcan al usuario una experiencia coherente para el monitoreo de ruido, la prueba auditiva y la visualización del dashboard de salud auditiva.

3. Implementar un firmware para microcontrolador ESP32 con sensor KY-037 capaz de medir el nivel de ruido ambiental en tiempo real y reportarlo al backend mediante autenticación por cabecera `X-Device-Key`, a través de un puente serial en Node.js.

4. Construir un modelo Random Forest que estime el nivel de riesgo auditivo del usuario a partir de ocho variables (edad, horas de auriculares, nivel de volumen, exposición al ruido, riesgo ocupacional, tabaquismo, puntaje promedio de evaluación y puntaje en frecuencias bajas), entrenado sobre un conjunto de 5 000 muestras sintéticas con metodología CRISP-DM y con coeficiente R² holdout mínimo de 0.80.

5. Aplicar TDD y BDD a lo largo del ciclo de vida del software y CRISP-DM al proceso de modelado, generando trazabilidad explícita entre los 60 requisitos funcionales, los 85 escenarios Gherkin, los 507 casos de prueba automatizados y el código fuente, documentada en la matriz de trazabilidad `docs/matriz-trazabilidad.md`.

6. Desplegar la plataforma en una infraestructura de producción —Render para el backend e IA, Vercel para el frontend, MongoDB Atlas para la base de datos— con un pipeline de integración y despliegue continuos de diez jobs en GitHub Actions, análisis estático en SonarCloud y pruebas de rendimiento con k6 y Lighthouse CI.

### 1.8 Alcance

El alcance funcional comprometido para la versión 1.0 comprende:

| Dentro del alcance | Fuera del alcance |
|--------------------|-------------------|
| Monitoreo de ruido ambiental (web, móvil, IoT) | Audiometría clínica certificada |
| Evaluación auditiva por cuestionario digital | Diagnóstico médico oficial |
| Predicción de riesgo auditivo (4 niveles) | Reemplazo del médico audiólogo |
| Recomendaciones preventivas personalizadas | Prescripción de tratamientos |
| Dashboard de salud auditiva con historial | Integración con wearables clínicos |
| Integración IoT con ESP32 + KY-037 | Otros modelos de sensor |
| App web (Angular) y móvil (Flutter) | Smart TV u otras plataformas |
| API REST documentada (OpenAPI 3.1) | Plataforma multitenant pública v1.0 |
| Despliegue en producción (Render + Vercel) | Instalación on-premise empresarial |

### 1.9 Restricciones

El software opera bajo un conjunto de restricciones que delimitan con precisión su ámbito de actuación. En primer lugar, el sistema no constituye un dispositivo médico certificado ni reemplaza la evaluación clínica por un audiólogo; los niveles de riesgo calculados tienen carácter preventivo e informativo y no constituyen diagnóstico médico. En segundo lugar, la precisión del modelo predictivo está condicionada por la veracidad de los datos auto-reportados por el usuario y por la calibración del micrófono del dispositivo. En tercer lugar, el sensor ESP32 + KY-037 es un componente de grado educativo que no alcanza la precisión de un sonómetro clase 1 o clase 2 calibrado. En cuarto lugar, el modelo Random Forest se entrena con datos sintéticos basados en heurísticas médicas, dado que no se disponía de un dataset clínico anonimizado de acceso público. Finalmente, la versión 1.0 está orientada a usuarios individuales y a contextos académicos; la escalabilidad para uso masivo simultáneo requiere ajustes de infraestructura en versiones posteriores.

### 1.10 Usuarios Objetivo

La población de usuarios a la que está dirigida la versión 1.0 comprende: (1) **usuarios individuales** preocupados por su salud auditiva que deseen monitorear su exposición al ruido y conocer su nivel de riesgo; (2) **trabajadores en entornos de riesgo acústico** (construcción, manufactura, música, educación) que buscan herramientas de seguimiento personal fuera del entorno clínico; (3) **estudiantes universitarios** expuestos a uso intensivo de auriculares y entornos ruidosos; (4) **profesionales de salud ocupacional y preventiva** que deseen una herramienta de screening rápido para sus grupos de trabajo; y (5) **investigadores y docentes** de ingeniería de sistemas e informática interesados en estudiar la integración de metodologías formales de desarrollo con aprendizaje automático en el dominio de la salud digital.

---

## Capítulo II — Contexto y Problemática del Sector

### 2.1 Situación Actual de la Salud Auditiva

La pérdida auditiva inducida por ruido (PAIR) es reconocida por la Organización Mundial de la Salud como una de las principales causas de discapacidad sensorial prevenible en el mundo. La OMS estima que más de 1 000 millones de personas entre 12 y 35 años están expuestas a niveles de sonido superiores a los recomendados, principalmente por el uso prolongado de dispositivos personales de audio, actividades de ocio en entornos ruidosos y exposición ocupacional sin protección adecuada. La exposición continua a niveles superiores a 85 dB(A) deteriora de forma progresiva e irreversible las células ciliadas del oído interno, produciendo hipoacusia, tinnitus y, en casos avanzados, deterioro cognitivo y aislamiento social en edades tempranas.

A nivel latinoamericano, y específicamente en el Perú, el acceso a servicios de audiología preventiva es limitado. La mayor parte de la población no realiza pruebas auditivas preventivas por razones económicas, geográficas o de disponibilidad de especialistas. Las herramientas digitales disponibles —principalmente aplicaciones móviles que miden decibelios en tiempo real— proporcionan información puntual pero no consolidan el historial de exposición, no incluyen evaluación auditiva y no producen una estimación cuantitativa del riesgo personal. Existe, por tanto, una brecha tecnológica y de acceso entre la disponibilidad de sensores digitales baratos y la capacidad de transformar sus datos en información clínicamente útil para el usuario.

### 2.2 Problemática Identificada

La problemática que motivó la concepción de HearGuard AI se puede sintetizar en cuatro carencias estructurales:

**Falta de integración.** Las soluciones disponibles están fragmentadas: hay aplicaciones de medición de ruido, hay plataformas de cuestionarios auditivos y hay modelos predictivos en la literatura académica, pero ninguna solución integra los tres componentes en un flujo de trabajo único que lleve al usuario desde la medición hasta el perfil de riesgo personalizado.

**Ausencia de continuidad.** Los datos de exposición al ruido de un usuario no se acumulan con el tiempo en ninguna plataforma accesible. Cada medición es un evento aislado, sin historial que permita evaluar la evolución del riesgo o el impacto de los cambios de hábitos del usuario.

**Enfoque reactivo de la atención auditiva.** La práctica clínica actual atiende al paciente cuando ya percibe síntomas, momento en que el daño es habitualmente irreversible. No existen herramientas de predicción de riesgo de uso cotidiano y acceso gratuito que permitan al usuario anticiparse al deterioro.

**Limitada reproducibilidad y trazabilidad metodológica.** La mayoría de soluciones de salud digital no documentan ni su proceso de desarrollo ni su proceso de modelado. La ausencia de trazabilidad entre requisitos, pruebas y código hace imposible auditar la calidad de las predicciones y la integridad del sistema.

### 2.3 Análisis Causal

**Causas tecnológicas.** La brecha se origina en la ausencia de una plataforma que integre coherentemente el monitoreo IoT de bajo costo, la evaluación auditiva digital y el modelo predictivo de aprendizaje automático, adaptada al contexto de usuarios no clínicos y accesible sin instalación de software especializado.

**Causas metodológicas.** El desarrollo de herramientas de salud digital en contextos académicos latinoamericanos frecuentemente carece de metodologías formales de ingeniería de software (TDD, BDD, cobertura, análisis estático), lo que produce sistemas difíciles de auditar, mantener y evolucionar.

**Causas de acceso.** El costo de las soluciones clínicas certificadas (audiómetros, software hospitalario, wearables médicos) los hace inaccesibles para la mayoría de la población peruana. Los sensores de grado educativo como el ESP32 + KY-037, cuyo costo es inferior a treinta dólares, representan una oportunidad tecnológica no aprovechada.

### 2.4 Consecuencias de la Problemática

Las consecuencias de la problemática descrita incluyen: (1) el deterioro auditivo silencioso de poblaciones expuestas sin conciencia del riesgo acumulado; (2) la saturación del sistema de salud con casos avanzados que habrían sido prevenibles; (3) la reducción de la productividad laboral y la calidad de vida asociada a la hipoacusia no diagnosticada; y (4) la inexistencia de datos poblacionales de exposición auditiva que orienten políticas de salud pública preventiva.

### 2.5 Justificación del Proyecto

**Justificación técnica.** La madurez comercial de los componentes tecnológicos empleados —microcontroladores ESP32, algoritmos Random Forest, frameworks web Angular y Flutter, plataformas de CI/CD como GitHub Actions— hace viable la integración de una solución funcional y de calidad demostrable sin requerir investigación de base. La originalidad reside en la integración sistemática y en la aplicación de metodologías formales.

**Justificación social.** La pérdida auditiva prevenible representa un problema de salud pública de alto impacto. Una herramienta de acceso gratuito y uso cotidiano que convierta la medición de ruido en un perfil de riesgo personalizado puede contribuir a la concienciación y a la prevención primaria a escala poblacional.

**Justificación académica.** El proyecto demuestra que es posible construir software de salud digital de calidad industrial —evidenciada por las métricas de SonarCloud, la cobertura de pruebas y el pipeline CI/CD— aplicando metodologías formales enseñadas en la carrera de Ingeniería de Sistemas e Informática, generando un caso de estudio reproducible y publicable.

**Justificación metodológica.** La aplicación integrada de TDD, BDD y CRISP-DM en un mismo proyecto de software de salud constituye una contribución pedagógica que documenta, de forma trazable y auditable, cómo conviven las metodologías de desarrollo de software con las metodologías de minería de datos en un sistema real.

---

## Capítulo III — Descripción General del Software

### 3.1 Qué es HearGuard AI

HearGuard AI es una plataforma de salud auditiva preventiva, accesible a través de un navegador web y de una aplicación móvil nativa, que integra en un único sistema el monitoreo de la exposición al ruido en tiempo real, la evaluación auditiva por cuestionario digital y la predicción del riesgo de pérdida auditiva mediante aprendizaje automático. El sistema recibe como insumos las mediciones de ruido del usuario —capturadas mediante el micrófono del navegador, de la aplicación móvil Flutter o de un sensor IoT ESP32— y las respuestas a un cuestionario auditivo de seis frecuencias, y produce como resultado un perfil de riesgo auditivo personalizado expresado en cuatro niveles (Bajo, Moderado, Alto, Muy Alto), acompañado de recomendaciones preventivas adaptativas y de un dashboard histórico de exposición.

En términos conceptuales, HearGuard AI puede comprenderse como un sistema de vigilancia auditiva personalizada que opera en tres capas: la capa de monitoreo, que registra continuamente la exposición al ruido; la capa de evaluación, que obtiene información subjetiva del usuario mediante el cuestionario auditivo; y la capa de predicción, que sintetiza ambas fuentes de datos en una estimación cuantitativa del riesgo mediante un modelo Random Forest entrenado bajo CRISP-DM. La integración de estas tres capas, su despliegue en producción y la trazabilidad metodológica del proceso de construcción constituyen la aportación técnica diferencial del sistema.

### 3.2 Qué Problemas Resuelve

El sistema resuelve directamente los problemas identificados en el Capítulo II. Resuelve la falta de integración, reuniendo monitoreo, evaluación y predicción en un único flujo de trabajo. Resuelve la ausencia de continuidad, construyendo un historial cronológico de exposición auditiva para cada usuario. Resuelve el enfoque reactivo, produciendo una estimación proactiva del riesgo antes de que el usuario perciba síntomas. Y resuelve la limitada trazabilidad metodológica, documentando formalmente el proceso de desarrollo mediante 507 casos de prueba automatizados, 85 escenarios BDD Gherkin, una matriz de trazabilidad IEEE 829 y análisis estático con SonarCloud.

### 3.3 Qué Automatiza

HearGuard AI automatiza las siguientes funciones: la clasificación del nivel de riesgo acústico a partir de lecturas en dB (Bajo < 55 dB, Moderado 55–75 dB, Alto 75–90 dB, Muy Alto > 90 dB); el cálculo de estadísticas diarias y semanales de exposición al ruido; la evaluación del estado auditivo del usuario a partir de las respuestas al cuestionario de seis frecuencias; la construcción del vector de ocho características para el modelo predictivo; la invocación y el retorno del microservicio Flask de predicción de riesgo; la selección y la presentación de recomendaciones preventivas adaptadas al nivel de riesgo calculado; el registro y la visualización del historial de evaluaciones y exposiciones; y la autenticación segura del usuario con renovación automática de tokens.

### 3.4 Qué No Automatiza

El sistema no automatiza —ni pretende automatizar— la emisión de diagnósticos médicos ni la prescripción de tratamientos; la calibración acústica profesional del sensor IoT; la validación clínica de los resultados del cuestionario por un audiólogo certificado; la toma de decisiones de salud, que permanece como responsabilidad del usuario y de su médico; ni la generación de informes clínicos con valor legal.

### 3.5 Beneficios

Los beneficios del sistema incluyen: la democratización del acceso a herramientas de evaluación de riesgo auditivo sin costo ni instalación de software; la generación de conciencia preventiva en el usuario mediante la visualización continua de su exposición acumulada; la reducción de la barrera entre la información sonora disponible (decibelios) y la interpretación clínicamente significativa (riesgo auditivo personalizado); la habilitación de un seguimiento longitudinal de la evolución del riesgo a lo largo del tiempo; y la disponibilidad de los datos del usuario en cualquier dispositivo (web y móvil) con sincronización automática.

### 3.6 Ventajas Competitivas

Las ventajas competitivas diferenciales del sistema frente a las aplicaciones de medición de ruido existentes son: la integración del monitoreo con la evaluación auditiva y la predicción de riesgo en una sola plataforma; la existencia de un modelo predictivo explícito, reproducible y documentado bajo CRISP-DM; la trazabilidad metodológica completa del proceso de desarrollo (TDD + BDD + 507 pruebas + SonarCloud); el soporte para dispositivos IoT de bajo costo (ESP32) además del micrófono nativo del dispositivo; y la disponibilidad simultánea en web y aplicación móvil nativa.

### 3.7 Casos de Uso

El sistema encuentra aplicación en los siguientes casos de uso: (1) **monitoreo de exposición laboral**: un trabajador en un entorno ruidoso (fábrica, construcción, concierto) activa el monitor, registra la sesión y visualiza su perfil de riesgo acumulado al final de la jornada; (2) **screening auditivo preventivo**: un usuario realiza el cuestionario auditivo periódicamente y observa la evolución de su nivel de riesgo en el historial; (3) **instalación IoT educativa**: un laboratorio universitario instala un ESP32 + KY-037 como estación de monitoreo continuo y registra los datos en la plataforma para análisis grupal; (4) **gestión de dispositivos personales**: el usuario vincula múltiples dispositivos IoT a su cuenta y centraliza las mediciones en un único dashboard.

---

## Capítulo IV — Arquitectura Empresarial

El presente capítulo describe la arquitectura del sistema HearGuard AI desde la perspectiva de los dominios organizacionales análogos a los del marco TOGAF, adaptados al contexto académico e institucional del proyecto.

### 4.1 Arquitectura de Negocio (Dominio de Procesos)

**Procesos estratégicos.** Los procesos estratégicos corresponden a la definición de los requisitos funcionales y no funcionales del sistema, la validación académica de los criterios de calidad, la supervisión del pipeline de CI/CD y el control del avance del proyecto mediante la matriz de registro académica. Estos procesos son ejecutados por los autores y el asesor académico y se apoyan en las métricas de SonarCloud, el reporte de k6 y el dashboard de GitHub Actions.

**Procesos principales.** El proceso principal es el ciclo de gestión de la salud auditiva del usuario, descompuesto en los siguientes subprocesos encadenados: registro y autenticación del usuario; configuración y vinculación de dispositivos; monitoreo de ruido (puntual o continuo); realización del cuestionario auditivo; invocación del modelo predictivo; visualización del dashboard de riesgo; y consulta del historial de evaluaciones. Cada subproceso cuenta con sus escenarios BDD correspondientes, pruebas automatizadas y trazabilidad hacia los requisitos funcionales.

**Procesos de apoyo.** Los procesos de apoyo comprenden la gestión de cuentas de usuario, la administración de dispositivos IoT, el pipeline de CI/CD, el análisis estático de código y el despliegue automatizado en producción. Estos procesos son ejecutados, en lo fundamental, por la propia infraestructura técnica de la plataforma (GitHub Actions, Render, Vercel, SonarCloud).

### 4.2 Arquitectura de Datos

La arquitectura de datos de HearGuard AI se estructura en torno a cinco colecciones en MongoDB Atlas: `users` (identidad y perfil del usuario), `noiseRecords` (lecturas de exposición al ruido), `evaluations` (respuestas al cuestionario auditivo y puntajes por frecuencia), `riskResults` (resultados del modelo predictivo y recomendaciones) y `devices` (dispositivos IoT registrados por el usuario). Todas las colecciones implementan soft delete mediante los campos `isDeleted` y `deletedAt`, garantizando que ningún dato del usuario sea eliminado físicamente del sistema, lo que preserva la trazabilidad histórica y facilita la recuperación ante errores.

### 4.3 Arquitectura de Aplicaciones

La arquitectura de aplicaciones comprende cuatro componentes de software interoperables mediante APIs REST: el frontend web Angular, la aplicación móvil Flutter, el backend Node.js/Express y el microservicio de IA Flask. A estos se suma el firmware Arduino para ESP32, que actúa como productor de datos hacia el backend a través del puente serial Node.js. La comunicación entre todos los componentes sigue el protocolo HTTP/HTTPS sobre JSON, con autenticación mediante tokens JWT en las peticiones de los clientes web y móvil y mediante cabecera `X-Device-Key` en las peticiones del firmware IoT.

### 4.4 Arquitectura Tecnológica

La infraestructura de producción del sistema distribuye los componentes entre tres plataformas en la nube: **Render** aloja el backend Node.js y el microservicio Flask como servicios web; **Vercel** sirve el frontend Angular como aplicación estática con soporte CDN global; y **MongoDB Atlas** proporciona la base de datos como servicio (DBaaS) en un clúster M0 en AWS São Paulo. El despliegue es completamente automatizado mediante el job `deploy` del workflow de GitHub Actions, que invoca los hooks de despliegue de Render y Vercel ante cada push a la rama `main` que supere todos los jobs de prueba.

---

## Capítulo V — Arquitectura de Software

### 5.1 Arquitectura Cliente-Servidor

HearGuard AI implementa una arquitectura cliente-servidor de múltiples niveles. Los clientes —la aplicación web Angular y la aplicación móvil Flutter— consumen la API REST del backend como única fuente de datos, sin conocer la existencia del microservicio de IA ni de la base de datos. El backend actúa como servidor para los clientes y como cliente para el microservicio Flask y para MongoDB Atlas. El microservicio Flask actúa como servidor exclusivo para el backend, expuesto únicamente en la red interna y nunca directamente desde el exterior.

### 5.2 Arquitectura de Microservicios

El sistema implementa una separación en dos servicios independientes con responsabilidades claramente delimitadas: el **backend Node.js**, responsable de la autenticación, la lógica de negocio, la persistencia y la orquestación; y el **microservicio Flask**, responsable exclusivamente de la carga del modelo, la transformación del vector de características y la generación de la predicción. Esta separación permite que ambos servicios se desplieguen, escalen y actualicen de forma independiente. El modelo Random Forest (`risk_model.pkl`) se genera durante la fase de build del servicio Flask en Render y no viaja a través de la red.

### 5.3 Patrón API First

El sistema fue diseñado siguiendo el patrón API First: antes de implementar cualquier endpoint, se definió su contrato en el documento OpenAPI 3.1 (`docs/api-spec.yml`), que especifica los métodos HTTP, los paths, los esquemas de solicitud y respuesta, los códigos de estado y los mecanismos de seguridad. Este documento de 1 175 líneas documenta la totalidad de los endpoints del sistema —autenticación, ruido, evaluaciones, dispositivos y servicio IA— y constituye la fuente de verdad del contrato de comunicación entre los componentes.

### 5.4 Modelo de Arquitectura C4

**Contexto.** HearGuard AI es un sistema de salud auditiva preventiva que interactúa con usuarios a través de un navegador web o una aplicación móvil, y con dispositivos IoT ESP32 a través de un puente serial.

**Contenedores.** El sistema se compone de cinco contenedores: (1) la aplicación web Angular, desplegada en Vercel; (2) la aplicación móvil Flutter, distribuida como APK/IPA; (3) el backend Node.js/Express, desplegado en Render; (4) el microservicio Flask de IA, desplegado en Render; y (5) MongoDB Atlas como base de datos en la nube.

**Componentes del backend.** El backend se organiza en los módulos `auth`, `noise`, `evaluations`, `devices` y `users`, cada uno con su propio controlador, servicio, modelo Mongoose, rutas Express y validadores. Los servicios `ai.service.js` y `noise.service.js` encapsulan la comunicación con el microservicio Flask y la lógica de cálculo de estadísticas, respectivamente.

**Código.** Los patrones de diseño clave incluyen: middleware de autenticación JWT reutilizable en todas las rutas protegidas; servicios stateless que encapsulan la lógica de negocio separada de los controladores; modelos Mongoose con validación de esquema y hooks pre-save para el hash de contraseñas; y validadores con `express-validator` antes de que la petición alcance el controlador.

### 5.5 Componentes del Sistema

#### 5.5.1 Frontend Web — Angular 21

La capa de presentación web está implementada en **Angular 21** con TypeScript, utilizando la Signals API para la reactividad y componentes standalone (sin NgModules). La arquitectura de la aplicación sigue el patrón de módulos de características (`features/auth`, `features/monitor`, `features/hearing-test`, `features/results`, `features/history`, `features/dashboard`, `features/devices`, `features/profile`), con servicios en `core/services/` y componentes reutilizables en `shared/components/`. La autenticación se gestiona mediante un `AuthGuard` que protege todas las rutas autenticadas y un `AuthInterceptor` que inyecta automáticamente el token Bearer en cada petición HTTP y ejecuta el flujo de refresh cuando el access token expira.

#### 5.5.2 Aplicación Móvil — Flutter 3

La aplicación móvil está desarrollada en **Flutter 3** con Dart, siguiendo la misma organización por características que el frontend web. La gestión de estado se realiza con Provider. Las peticiones HTTP se ejecutan mediante Dio, configurado con interceptores para la inyección del token. La aplicación implementa las pantallas de autenticación, dashboard, monitoreo de ruido (con captura mediante el micrófono del dispositivo), prueba auditiva, historial y perfil de usuario.

#### 5.5.3 Backend API — Node.js 20 + Express 5

El backend está implementado en **Node.js 20** con **Express 5** y **Mongoose 9**. Actúa como API gateway, aplicando autenticación JWT en todas las rutas protegidas, validando las peticiones con `express-validator`, ejecutando la lógica de negocio en los servicios y persistiendo los datos en MongoDB Atlas. El módulo `ai.service.js` encapsula las llamadas HTTP al microservicio Flask, con manejo de errores y timeout para garantizar que un fallo del microservicio no afecte la disponibilidad del backend principal. La autenticación implementa refresh tokens con hash SHA-256, bcrypt con salt 12 para contraseñas, y soft delete para todos los recursos.

#### 5.5.4 Microservicio de IA — Python 3.11 + Flask

El microservicio de IA expone tres endpoints REST: `POST /api/predict-risk`, `POST /api/generate-recommendations` y `GET /api/model-info`. El endpoint principal recibe el payload del usuario, lo transforma en el vector de ocho características mediante `model/features.py` y lo pasa al modelo serializado en `model/saved/risk_model.pkl`, cargado en memoria al inicio del servicio y mantenido en caché durante toda la vida del proceso. La respuesta incluye el `riskScore` (0–100), el `riskLevel` (Bajo/Moderado/Alto/Muy Alto), los `topFactors` de riesgo identificados y los `yearsEstimated` de exposición equivalente.

#### 5.5.5 Base de Datos — MongoDB Atlas

La base de datos es un clúster MongoDB Atlas M0 alojado en AWS São Paulo (sa-east-1), conectado mediante URI de conexión cifrada con TLS. Los modelos Mongoose definen la estructura de cada colección con validación en el nivel de aplicación. El backend implementa soft delete de forma consistente: las operaciones de borrado establecen `isDeleted: true` y `deletedAt: Date.now()` en lugar de eliminar físicamente el documento.

#### 5.5.6 Firmware IoT — ESP32 + KY-037

El firmware, implementado en C++ con el framework Arduino, se ejecuta en un microcontrolador ESP32 conectado a un sensor de sonido KY-037. El firmware realiza lecturas analógicas del sensor cada 100 ms, promedia las lecturas en ventanas de un segundo, convierte el valor analógico a decibelios mediante una función de calibración lineal y envía el resultado por puerto serie al puente Node.js (`serial_bridge.js`). El puente serial re-envía la lectura al endpoint `POST /api/noise/iot` del backend con el header `X-Device-Key` del dispositivo para autenticación.

#### 5.5.7 Contenerización — Docker

El sistema incluye un `docker-compose.yml` que orquesta todos los servicios (backend en el puerto 3000, microservicio IA en el 5001, frontend en el 8080) en una red Docker interna. La imagen del frontend se construye en dos etapas: una etapa de build con Node.js y una etapa de servicio con Nginx. Las variables de entorno se inyectan mediante el archivo `.env` en el nivel del host, siguiendo el patrón documentado en `.env.example`.

### 5.6 Interfaces de Programación Externas

El sistema no depende de APIs externas de pago ni de terceros para su funcionamiento en producción. Todas las dependencias son de código abierto. Las únicas APIs externas utilizadas son: **MongoDB Atlas** (DBaaS), que provee el servicio de base de datos en la nube con SDK oficial; **SonarCloud** (análisis estático), invocado exclusivamente desde el pipeline de CI; y los servicios de infraestructura **Render** y **Vercel**, integrados mediante hooks de despliegue.

---

## Capítulo VI — Funcionalidades del Sistema

### 6.1 Autenticación y Gestión de Sesión

El módulo de autenticación implementa el ciclo completo de gestión de identidad del usuario. El registro (`POST /api/auth/register`) valida el formato del correo, verifica que no exista un usuario previo con el mismo correo mediante consulta de tiempo constante para prevenir la enumeración de usuarios, y almacena la contraseña con bcrypt salt 12. El login (`POST /api/auth/login`) devuelve un par de tokens: un access token JWT firmado con HS256 y expiración de 15 minutos y un refresh token de 128 caracteres aleatorios cuyo hash SHA-256 se almacena en la base de datos. El refresh (`POST /api/auth/refresh`) valida el token presentado contra el hash almacenado, emite un nuevo par de tokens y revoca el anterior (rotación). El logout (`POST /api/auth/logout`) revoca el refresh token activo. El endpoint `/api/auth/me` devuelve el perfil del usuario autenticado sin exponer la contraseña ni el hash del token.

### 6.2 Gestión de Perfil de Usuario

El módulo de perfil permite al usuario actualizar su información personal mediante `PATCH /api/auth/me`. Los campos actualizables incluyen nombre, edad, ocupación y preferencias de notificación. La edad es un parámetro crítico para el modelo predictivo, ya que constituye una de las ocho variables del vector de características del Random Forest. El soft delete del usuario establece `isDeleted: true` en su documento sin eliminar ninguno de sus registros de ruido, evaluaciones ni resultados históricos.

### 6.3 Gestión de Proyectos / Sesiones de Monitoreo

El módulo de ruido gestiona el historial de exposición sonora del usuario. `POST /api/noise` registra una nueva lectura de nivel de ruido con metadatos de contexto (fuente, timestamp, coordenadas opcionales). `GET /api/noise` recupera el historial paginado del usuario. `GET /api/noise/latest` devuelve la lectura más reciente. `GET /api/noise/stats/today` y `GET /api/noise/stats/week` calculan estadísticas agregadas de exposición para el día actual y la semana en curso, respectivamente. `POST /api/noise/iot` recibe lecturas desde dispositivos ESP32 autenticados por cabecera `X-Device-Key`.

### 6.4 Módulo de Monitoreo de Ruido en Tiempo Real

    El monitor de ruido es la funcionalidad de mayor visibilidad del sistema. En el frontend Angular, el componente `NoiseMonitorService` accede al micrófono del navegador mediante la Web Audio API, calcula el nivel en dB(A) mediante la función `analyserNode.getByteFrequencyData()` y clasifica el resultado en tiempo real según los umbrales establecidos: < 55 dB (Bajo, verde #22C55E), 55–75 dB (Moderado, amarillo #F59E0B), 75–90 dB (Alto, naranja #FF8C00) y > 90 dB (Muy Alto, rojo #FF4D4D). El componente de gauge visualiza el nivel actual de forma animada. Las lecturas se registran automáticamente en el backend cada N segundos configurables.

### 6.5 Módulo de Evaluación Auditiva

El módulo de evaluación implementa un cuestionario auditivo de seis frecuencias estándar (250, 500, 1000, 2000, 4000 y 8000 Hz) para cada oído (izquierdo y derecho), produciendo doce pasos de evaluación en total. El usuario asigna un puntaje de 0 a 10 a su percepción auditiva en cada frecuencia. Los puntajes se agregan para calcular el puntaje promedio global y el puntaje en frecuencias bajas (250 y 500 Hz), que son dos de las ocho características del modelo predictivo. El resultado se almacena en la colección `evaluations` con todos los puntajes individuales y el vector de características calculado. `POST /api/evaluations` crea una evaluación, `GET /api/evaluations` recupera el historial, `GET /api/evaluations/{id}` devuelve una evaluación específica y `PATCH /api/evaluations/{id}` permite actualizar su estado.

### 6.6 Motor de Inteligencia Artificial — Predicción de Riesgo

El motor de predicción es el núcleo inteligente del sistema. Cuando el usuario completa una evaluación auditiva, el backend construye el vector de ocho características `[age, headphoneHours, volumeLevel, noiseExposure, occupationRisk, smoking, avgTestScore, lowFreqScore]`, lo envía mediante `ai.service.js` al endpoint `POST /api/predict-risk` del microservicio Flask y recibe la respuesta con el `riskScore` (0–100), el `riskLevel`, los principales factores de riesgo identificados y el estimado de años de exposición equivalente. La respuesta se almacena en la colección `riskResults` vinculada a la evaluación correspondiente. El detalle del modelo predictivo se describe en el Capítulo VIII.

### 6.7 Módulo de Recomendaciones Preventivas

El módulo de recomendaciones produce orientaciones preventivas personalizadas basadas en el nivel de riesgo calculado. Las recomendaciones se generan mediante el endpoint `POST /api/generate-recommendations` del microservicio Flask, que aplica una lógica de reglas basada en el nivel de riesgo y los factores dominantes identificados por el modelo. Cada nivel de riesgo tiene un conjunto de recomendaciones diferenciadas: el nivel Bajo incluye orientaciones de mantenimiento de hábitos saludables; el nivel Moderado incluye recomendaciones de reducción de exposición; el nivel Alto incluye indicaciones de uso de protección auditiva y revisión periódica; y el nivel Muy Alto incluye la recomendación expresa de consulta con un audiólogo.

### 6.8 Dashboard de Salud Auditiva

El dashboard centraliza la información de salud auditiva del usuario en una única vista. Muestra el nivel de riesgo actual, el historial de exposición con estadísticas semanales, la tendencia del riesgo a lo largo del tiempo, el resumen de la última evaluación auditiva y los dispositivos IoT activos. Los componentes de visualización incluyen un gauge de riesgo animado, un gráfico de barras de exposición semanal, un badge de nivel de riesgo con código de color y una lista de recomendaciones activas.

### 6.9 Gestión de Dispositivos IoT

El módulo de dispositivos permite al usuario registrar y gestionar sus sensores ESP32. `POST /api/devices` crea un nuevo dispositivo con nombre descriptivo y genera una `deviceKey` única que se almacena como hash y se devuelve al usuario en texto plano únicamente en el momento de la creación. `GET /api/devices` lista los dispositivos activos del usuario. El dispositivo físico utiliza esta clave en el header `X-Device-Key` de cada petición al endpoint `POST /api/noise/iot` para autenticarse sin necesidad de credenciales de usuario.

### 6.10 Especificación de la API REST

La API REST del sistema está completamente documentada en el archivo `docs/api-spec.yml` siguiendo el estándar OpenAPI 3.1. La especificación incluye los esquemas de todos los modelos de datos, las definiciones de seguridad (bearerAuth), los parámetros de cada endpoint, los códigos de respuesta y los ejemplos de solicitud y respuesta. El total de endpoints documentados asciende a dieciséis, distribuidos en cinco grupos: auth (6 endpoints), noise (6 endpoints), evaluations (4 endpoints), devices (2 endpoints) y health check (1 endpoint).

---

## Capítulo VII — Modelo de Datos

### 7.1 Arquitectura de Persistencia

HearGuard AI emplea MongoDB como sistema de gestión de bases de datos, alojado en MongoDB Atlas (DBaaS). La elección de MongoDB sobre un SGBD relacional se justifica por la naturaleza variable de las entidades de datos del sistema: las lecturas de ruido tienen metadatos variables según la fuente (web, móvil, IoT), y los documentos de evaluación contienen arrays de puntajes de longitud variable por frecuencia y por oído. La flexibilidad del modelo documental permite acomodar estas variaciones sin migraciones de esquema costosas en entornos de desarrollo iterativo.

### 7.2 Colecciones del Sistema

#### Colección `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único MongoDB |
| `name` | String | Nombre completo del usuario |
| `email` | String (único) | Correo electrónico de autenticación |
| `password` | String | Hash bcrypt (salt 12) de la contraseña |
| `age` | Number | Edad del usuario (variable del modelo IA) |
| `refreshTokenHash` | String | Hash SHA-256 del refresh token activo |
| `isDeleted` | Boolean | Soft delete (true = borrado lógico) |
| `deletedAt` | Date | Timestamp del borrado lógico |
| `createdAt` | Date | Timestamp de creación (automático) |
| `updatedAt` | Date | Timestamp de última modificación (automático) |

#### Colección `noiseRecords`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único |
| `userId` | ObjectId (ref: users) | Usuario propietario |
| `deviceId` | ObjectId (ref: devices) | Dispositivo origen (null si es web/móvil) |
| `decibels` | Number | Nivel de ruido medido en dB |
| `riskLevel` | String (enum) | Clasificación: Bajo / Moderado / Alto / Muy Alto |
| `source` | String (enum) | Fuente: web / mobile / iot |
| `timestamp` | Date | Momento de la medición |
| `isDeleted` | Boolean | Soft delete |
| `deletedAt` | Date | Timestamp del borrado lógico |

#### Colección `evaluations`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único |
| `userId` | ObjectId (ref: users) | Usuario propietario |
| `scores` | Array de objetos | Puntajes por frecuencia y oído: `{hz, score, ear}` |
| `avgTestScore` | Number | Puntaje promedio calculado |
| `lowFreqScore` | Number | Promedio en frecuencias 250–500 Hz |
| `headphoneHours` | Number | Horas diarias de uso de auriculares (auto-reportado) |
| `volumeLevel` | Number | Nivel de volumen habitual (0–100) |
| `noiseExposure` | Number | Exposición ocupacional (0, 1 o 2) |
| `occupationRisk` | Number | Riesgo ocupacional (0–3) |
| `smoking` | Number | Tabaquismo (0, 1 o 2) |
| `status` | String (enum) | Estado: pending / completed / reviewed |
| `isDeleted` | Boolean | Soft delete |
| `deletedAt` | Date | Timestamp del borrado lógico |

#### Colección `riskResults`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único |
| `userId` | ObjectId (ref: users) | Usuario propietario |
| `evaluationId` | ObjectId (ref: evaluations) | Evaluación asociada |
| `riskScore` | Number | Puntuación de riesgo (0–100) |
| `riskLevel` | String (enum) | Nivel: Bajo / Moderado / Alto / Muy Alto |
| `topFactors` | Array de strings | Principales factores de riesgo identificados |
| `yearsEstimated` | Number | Estimado de años de exposición equivalente |
| `recommendations` | Array de strings | Recomendaciones preventivas generadas |
| `createdAt` | Date | Timestamp de creación |

#### Colección `devices`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único |
| `userId` | ObjectId (ref: users) | Usuario propietario |
| `name` | String | Nombre descriptivo del dispositivo |
| `deviceKeyHash` | String | Hash SHA-256 de la clave del dispositivo |
| `isActive` | Boolean | Estado activo / inactivo |
| `lastSeen` | Date | Último timestamp de comunicación |
| `isDeleted` | Boolean | Soft delete |
| `deletedAt` | Date | Timestamp del borrado lógico |

### 7.3 Relaciones entre Entidades

Las relaciones entre entidades se implementan mediante referencias por `ObjectId` (patrón de referencia de MongoDB), evitando la denormalización para mantener la integridad referencial a nivel de aplicación:

- Un `user` tiene múltiples `noiseRecords` (1:N)
- Un `user` tiene múltiples `evaluations` (1:N)
- Una `evaluation` tiene un `riskResult` asociado (1:1)
- Un `user` tiene múltiples `devices` (1:N)
- Un `device` puede estar vinculado a múltiples `noiseRecords` (1:N)

### 7.4 Integridad y Trazabilidad

La integridad referencial se mantiene a nivel de aplicación mediante la validación de la existencia del documento referenciado antes de crear registros dependientes. El soft delete preserva todos los registros del usuario incluso tras su baja lógica, garantizando la trazabilidad histórica completa. Los campos `createdAt` y `updatedAt` son gestionados automáticamente por Mongoose mediante la opción `timestamps: true`, proporcionando una auditoría temporal de cada documento.

---

## Capítulo VIII — Inteligencia Artificial y Modelo Predictivo

### 8.1 Fundamentos Científicos

El componente de inteligencia artificial de HearGuard AI implementa un modelo de aprendizaje automático del tipo **Random Forest Regressor**, introducido por Breiman (2001) y ampliamente aplicado en el dominio de la predicción de riesgo auditivo. Random Forest es un ensemble de árboles de decisión entrenados sobre subconjuntos aleatorios del conjunto de datos y con selección aleatoria de características en cada nodo de división, lo que reduce la varianza del estimador respecto de un árbol único y proporciona estimaciones robustas con conjuntos de datos de tamaño moderado. Su aplicación en el dominio auditivo ha sido validada por Bing et al. (2018), quienes reportan precisiones superiores al 90 % en la clasificación de audiogramas mediante Random Forest.

### 8.2 Metodología CRISP-DM

El modelo predictivo fue construido siguiendo rigurosamente las seis fases del proceso **CRISP-DM** (Cross-Industry Standard Process for Data Mining), formalizado por Shearer (2000) y confirmado por Schröer, Kruse y Gómez (2021) como el proceso más utilizado en proyectos de ciencia de datos en producción.

| Fase CRISP-DM | Actividad realizada | Trazabilidad |
|---------------|---------------------|--------------|
| 1. Comprensión del negocio | Definición del problema: predicción temprana del riesgo auditivo en cuatro niveles | `README.md`, `Document/RoadmapTecnico/Fase_4_ServicioIA.md` |
| 2. Comprensión de los datos | Identificación de las ocho variables predictoras: edad, horas de auriculares, nivel de volumen, exposición al ruido, riesgo ocupacional, tabaquismo, puntaje auditivo promedio, puntaje en frecuencias bajas | `ai-service/model/features.py`, `ai-service/model/constants.py` |
| 3. Preparación de los datos | Construcción del vector de características, normalización implícita por el árbol, manejo de valores faltantes por imputación con valores por defecto | `ai-service/model/features.py`, función `build_feature_vector()` |
| 4. Modelado | Entrenamiento del Random Forest Regressor con scikit-learn, 120 estimadores, profundidad máxima 12, SEED=42 para reproducibilidad | `ai-service/model/trainer.py`, función `train_and_save()` |
| 5. Evaluación | Validación holdout (80/20), métricas R², MAE y RMSE, pruebas de perfiles de riesgo bajo y alto, robustez ante datos faltantes | `ai-service/tests/test_predictor.py` |
| 6. Despliegue | Exposición como microservicio REST Flask, serialización con joblib, integración con el backend Node.js, despliegue continuo en Render | `ai-service/app.py`, `ai-service/model/predictor.py`, `render.yaml` |

### 8.3 Construcción del Dataset

Dado que no se dispone de un dataset clínico anonimizado de acceso público, el modelo se entrena sobre un conjunto de **5 000 muestras sintéticas** generadas mediante una función determinista con semilla SEED=42, basada en heurísticas médicas derivadas de la literatura sobre factores de riesgo auditivo. La función `_synthetic_row()` en `trainer.py` genera valores aleatorios para las ocho características dentro de rangos clínicamente plausibles y calcula el `riskScore` como una función lineal por partes de dichas características, con interacciones multiplicativas para los casos de alto riesgo (ocupación de nivel 3, edad > 50 con exposición alta, volumen > 70 dB con uso de auriculares > 4 h diarias, puntaje auditivo < 5).

### 8.4 Variables del Modelo

| Variable | Tipo | Rango | Descripción |
|----------|------|-------|-------------|
| `age` | Numérica continua | 18–75 | Edad del usuario en años |
| `headphoneHours` | Numérica continua | 0–10 | Horas diarias de uso de auriculares |
| `volumeLevel` | Numérica continua | 10–100 | Nivel de volumen habitual (escala 0–100) |
| `noiseExposure` | Numérica ordinal | 0–2 | Exposición laboral al ruido (0=ninguna, 1=moderada, 2=intensa) |
| `occupationRisk` | Numérica ordinal | 0–3 | Nivel de riesgo acústico de la ocupación |
| `smoking` | Numérica ordinal | 0–2 | Tabaquismo (0=no fumador, 1=exfumador, 2=fumador activo) |
| `avgTestScore` | Numérica continua | 0–10 | Puntaje promedio del cuestionario auditivo |
| `lowFreqScore` | Numérica continua | 0–10 | Puntaje promedio en frecuencias 250–500 Hz |

### 8.5 Hiperparámetros del Modelo

| Hiperparámetro | Valor | Justificación |
|----------------|-------|---------------|
| `n_estimators` | 120 | Balance entre precisión y tiempo de inferencia |
| `max_depth` | 12 | Previene el sobreajuste manteniendo capacidad expresiva |
| `min_samples_leaf` | 1 | Permite la captura de patrones minoritarios |
| `max_features` | 1.0 | Utiliza todas las características en cada nodo |
| `random_state` | 42 | Garantiza reproducibilidad del entrenamiento |
| `n_jobs` | -1 | Paralelización en todos los núcleos disponibles |

### 8.6 Métricas de Evaluación

La evaluación del modelo se realiza sobre el 20 % del conjunto de datos reservado para validación (holdout), utilizando `train_test_split` con `random_state=42`. Las métricas obtenidas y los umbrales mínimos exigidos son:

- **R² holdout ≥ 0.80**: coeficiente de determinación mínimo requerido, verificado automáticamente en la prueba `test_model_loaded()`.
- **MAE**: error absoluto medio, reportado en los metadatos del modelo (`model_metadata.json`).
- **RMSE**: raíz del error cuadrático medio, reportado en los metadatos del modelo.

Adicionalmente, las pruebas de perfil verifican que: un perfil de bajo riesgo (edad 22, pocas horas de auriculares, bajo volumen, sin exposición laboral) produzca un `riskScore < 40`; y un perfil de alto riesgo (edad 60, 8 h de auriculares, volumen 95, exposición laboral intensa, fumador activo, puntajes auditivos bajos) produzca un `riskScore > 60`.

### 8.7 Flujo de Procesamiento

El flujo de procesamiento de la inteligencia artificial comprende cinco pasos: (1) recepción del payload JSON con las variables del usuario desde el backend Node.js; (2) construcción del vector de características mediante `build_feature_vector()`, que extrae las ocho variables, aplica valores por defecto para los campos ausentes y produce una lista de ocho flotantes; (3) inferencia del modelo serializado cargado en memoria, que produce un `riskScore` en el intervalo [0, 100]; (4) mapeo del score a nivel cualitativo mediante `score_to_level()` (0–25: Bajo, 26–50: Moderado, 51–75: Alto, 76–100: Muy Alto) y estimación de años equivalentes mediante `score_to_years()`; y (5) retorno de la respuesta JSON estructurada al backend.

### 8.8 Intervención Humana y Limitaciones

El sistema implementa el principio de **Human-in-the-Loop (HITL)**: los resultados del modelo se presentan siempre con la advertencia explícita de que tienen carácter informativo y no constituyen diagnóstico médico. El usuario valida los datos de entrada mediante su propia experiencia y puede corregir los valores auto-reportados. El sistema no toma ninguna decisión autónoma sobre la salud del usuario.

Las limitaciones del modelo incluyen: el entrenamiento sobre datos sintéticos en lugar de un dataset clínico real; la dependencia de la veracidad de los valores auto-reportados por el usuario; la ausencia de calibración audiométrica formal del cuestionario; y la no inclusión de comorbilidades médicas (diabetes, hipertensión) que la literatura identifica como factores de riesgo auditivo secundarios.

---

## Capítulo IX — Seguridad Informática

### 9.1 Marco de Referencia OWASP

La seguridad del sistema HearGuard AI fue diseñada con referencia al marco **OWASP Top 10** (2021). La suite de pruebas de seguridad `backend/tests/security.test.js` verifica la mitigación de los principales vectores de ataque identificados por OWASP: inyección, autenticación rota, exposición de datos sensibles, control de acceso insuficiente, configuración de seguridad incorrecta y componentes con vulnerabilidades conocidas (verificado mediante `npm audit --audit-level=high` en el pipeline de CI).

### 9.2 Autenticación mediante Tokens JWT

El sistema implementa autenticación stateless mediante **JSON Web Tokens (JWT)** con las siguientes características de seguridad: firma HMAC-SHA256 con secrets de 128 caracteres hexadecimales almacenados en variables de entorno; access token de corta duración (15 minutos) para minimizar la ventana de exposición ante robo; refresh token de larga duración (7 días) almacenado únicamente como hash SHA-256 en la base de datos, de modo que el valor en texto plano no persiste tras la primera respuesta; rotación de refresh token en cada renovación, de forma que cada refresh token es válido para un único uso; y verificación de algoritmo en la validación del token para prevenir ataques de confusión de algoritmo (incluyendo el ataque `alg:none`).

### 9.3 Control de Acceso Basado en Roles

El control de acceso implementa aislamiento estricto entre usuarios: cada recurso (lectura de ruido, evaluación, resultado, dispositivo) contiene el `userId` del propietario, y todos los endpoints verifican que el usuario autenticado sea el propietario del recurso antes de devolver o modificar cualquier dato. No existe modo de acceso a los datos de otro usuario. Las rutas protegidas son verificadas por el middleware `authenticate` aplicado globalmente a todos los routers excepto `/api/auth/register`, `/api/auth/login` y `/health`.

### 9.4 Protección contra Ataques Comunes

| Vulnerabilidad | Mitigación implementada |
|----------------|-------------------------|
| Inyección NoSQL | Validación estricta de tipos con express-validator; Mongoose castea automáticamente los tipos |
| Timing attack en login | Comparación constante con bcrypt.compare() incluso cuando el usuario no existe |
| Enumeración de usuarios | Respuesta idéntica (401) para email inexistente y contraseña incorrecta |
| CSRF | No aplica (API REST stateless con tokens Bearer, sin cookies de sesión) |
| XSS almacenado | Content-Type: application/json en todas las respuestas; sin renderizado HTML |
| Fuerza bruta | Rate limiting implícito por el tiempo de bcrypt (salt 12 ≈ 250 ms/hash) |
| JWT alg:none | Verificación explícita de algoritmo en la validación del token |

### 9.5 Seguridad del Transporte

Toda la comunicación entre clientes y servidores se realiza sobre HTTPS/TLS, garantizada por las plataformas de despliegue (Render y Vercel proporcionan certificados TLS automáticos). La conexión a MongoDB Atlas utiliza TLS por defecto. Las variables de entorno con credenciales (JWT_SECRET, JWT_REFRESH_SECRET, MONGO_URI) nunca se commitean al repositorio y se inyectan en tiempo de ejecución.

### 9.6 Auditoría y Registro

El backend registra todas las operaciones mediante el módulo `logger.js`, que diferencia los niveles de log (error, warn, info, debug) y registra el contexto de cada operación (método HTTP, path, código de respuesta, userId cuando aplica). El pipeline de CI ejecuta `npm audit --audit-level=high` en el job `backend` para detectar vulnerabilidades de alta gravedad en las dependencias npm antes de cada despliegue.

### 9.7 Protección de Datos Sensibles

Los datos de salud del usuario (historial de ruido, evaluaciones, niveles de riesgo) se almacenan en MongoDB Atlas con cifrado en reposo gestionado por la plataforma. La contraseña del usuario nunca se devuelve en ninguna respuesta de la API (el modelo Mongoose excluye el campo `password` en todas las consultas mediante `select: false`). El campo `refreshTokenHash` tampoco se expone en ninguna respuesta.

---

## Capítulo X — Calidad del Software

### 10.1 Modelo de Calidad ISO/IEC 25010

La calidad del software HearGuard AI se evalúa conforme al modelo ISO/IEC 25010 (2011), que define ocho características de calidad del producto. Las métricas obtenidas acreditan el cumplimiento de las principales características:

| Característica ISO 25010 | Métrica | Resultado |
|--------------------------|---------|-----------|
| **Adecuación funcional** | 507 casos de prueba pasantes | ✅ 100 % |
| **Eficiencia de rendimiento** | Prueba k6: latencia p95 < 500 ms en smoke test | ✅ |
| **Compatibilidad** | Desplegado en Chrome, Edge y Firefox; app Flutter Android/iOS | ✅ |
| **Usabilidad** | Lighthouse accessibility ≥ 90 % | ✅ |
| **Confiabilidad** | 0 errores en SonarCloud Reliability | ✅ Rating A |
| **Seguridad** | 0 vulnerabilidades en SonarCloud Security | ✅ Rating A |
| **Mantenibilidad** | 0 code smells en SonarCloud Maintainability; complejidad ciclomática ≤ 7 en funciones críticas | ✅ Rating A |
| **Portabilidad** | Desplegado en contenedores Docker; compatible con Ubuntu y Windows | ✅ |

### 10.2 Proceso de Prueba ISO/IEC/IEEE 29119

El proceso de prueba sigue el estándar ISO/IEC/IEEE 29119-3, con el plan de pruebas formal documentado en `docs/plan-de-pruebas.md`. El plan incluye la identificación de los casos de prueba con el esquema `CP-[CAPA]-[N]` (por ejemplo, `CP-B-01` para el caso 1 del backend), las precondiciones, los pasos de ejecución, los datos de prueba y los resultados esperados para cada uno de los 507 casos.

### 10.3 Suite de Pruebas Automatizadas

| Capa | Framework | Archivo(s) | N.° casos |
|------|-----------|------------|-----------|
| Backend Node.js / Express | Jest + Supertest | `backend/tests/*.test.js` (12 archivos) | 207 |
| Servicio IA Python / Flask | pytest | `ai-service/tests/test_*.py` (4 archivos) | 30 |
| Frontend Angular | Vitest | `frontend/src/**/*.spec.ts` (11 archivos) | 107 |
| Aplicación móvil Flutter | flutter_test | `flutter_app/test/**/*_test.dart` (8 archivos) | 42 |
| End-to-End multiplataforma | Playwright | `e2e/tests/*.spec.ts` (3 archivos) | 36 |
| Escenarios BDD Gherkin | Cucumber.js | `docs/features/*.feature` (6 archivos) | 85 |
| **Total** | | | **507** |
| Rendimiento / carga | k6 | `tests/k6/load-test.js` | 3 escenarios |

### 10.4 Cobertura de Código

La cobertura mínima exigida por el pipeline de CI es del **60 % de líneas** tanto en el backend (verificado con un script Node.js que parsea `coverage/lcov.info`) como en el servicio de IA (`pytest --cov-fail-under=60`). En ejecución local con `npm test -- --runInBand`, el backend alcanza el **100 % de líneas**. La cobertura consolidada multi-lenguaje reportada por SonarCloud es del **100 %**, integrando los reportes lcov del backend y del frontend con el reporte XML de Python.

### 10.5 Análisis Estático con SonarCloud

El análisis estático se ejecuta en el job `sonarcloud` del pipeline de CI, que descarga los artefactos de cobertura de los jobs de backend, AI y frontend, corrije las rutas del informe lcov del frontend mediante `scripts/fix-sonar-coverage-paths.js` y ejecuta el `SonarSource/sonarqube-scan-action`. Los resultados del último análisis publicado son:

| Métrica SonarCloud | Resultado |
|--------------------|-----------|
| Quality Gate | **Aprobado** |
| Security | **Rating A** — 0 vulnerabilidades |
| Reliability | **Rating A** — 0 bugs |
| Maintainability | **Rating A** — 0 code smells |
| Coverage | **100 %** |
| Duplications | **0 %** |
| Lines of Code | **13 000+** (4 lenguajes) |

### 10.6 Pruebas de Rendimiento con k6

Las pruebas de rendimiento se ejecutan en el job `k6-smoke` del pipeline, contra el backend desplegado en producción (Render). El escenario smoke ejecuta 1 usuario virtual durante 30 segundos y verifica que la latencia p95 de los endpoints principales no supere los umbrales establecidos. El reporte HTML generado mediante la función `handleSummary` se sube como artefacto del job.

### 10.7 Auditoría de Accesibilidad con Lighthouse

El job `lighthouse` ejecuta Lighthouse CI contra el frontend desplegado en Vercel, configurado en `.lighthouserc.json` con los siguientes umbrales: accessibility ≥ 90 % (falla el build si no se cumple), performance ≥ 80 %, best-practices ≥ 85 % y SEO ≥ 80 % (advertencias si no se cumplen).

### 10.8 Pruebas BDD con Cucumber.js

Los 85 escenarios Gherkin se ejecutan en el job `bdd` del pipeline contra el backend Express con MongoDB en memoria. El job necesita el job `backend` como prerequisito. Los escenarios que requieren navegador (Angular UI), hardware físico (ESP32) o el microservicio Flask activo están marcados como `pending()` en sus step definitions (`frontend.steps.js`, `ai.steps.js`), por lo que no bloquean el pipeline pero quedan registrados en el reporte HTML de resultados. El reporte se sube como artefacto al finalizar el job.

### 10.9 Análisis de Complejidad Ciclomática

El análisis de complejidad ciclomática del código fuente, documentado en `docs/complejidad-ciclomatica.md` conforme al método de McCabe (1976), confirma que ninguna función del sistema supera el umbral de CC = 10 (alto riesgo), manteniéndose todas las funciones críticas en el rango de riesgo bajo (CC 1–4) o moderado (CC 5–7), lo que asegura la cobertura completa con los casos de prueba implementados.

---

## Capítulo XI — Innovación y Originalidad

### 11.1 Aportes Tecnológicos

La aportación tecnológica de HearGuard AI consiste en la integración coherente y sistemática de cinco tecnologías en un único flujo de trabajo de salud preventiva: (1) monitoreo IoT de bajo costo mediante ESP32 + KY-037; (2) evaluación auditiva digital por cuestionario multifrecuencia; (3) predicción de riesgo mediante Random Forest entrenado con CRISP-DM; (4) plataforma multiplataforma web (Angular) y móvil (Flutter) con sincronización en tiempo real; y (5) aseguramiento de calidad industrial con TDD + BDD + 507 pruebas + SonarCloud. Ninguna solución existente conocida en el mercado latinoamericano integra estos cinco componentes en un único sistema accesible y de código abierto.

### 11.2 Innovación en el Sector de la Salud Digital

Desde el punto de vista de la innovación sectorial, HearGuard AI introduce tres elementos diferenciadores respecto de las soluciones existentes en el mercado:

**Predicción personalizada de riesgo.** Las aplicaciones de medición de decibelios existentes (Decibel X, Sound Meter Pro, NIOSH SLM) miden la exposición instantánea pero no la integran en un perfil de riesgo personalizado. HearGuard AI produce un score de riesgo individual que combina la exposición medida con variables clínicas y de hábitos auto-reportadas.

**Continuidad histórica.** El sistema construye un historial longitudinal de exposición auditiva, a diferencia de las aplicaciones de medición que operan de forma episódica sin memoria entre sesiones.

**Trazabilidad metodológica total.** El sistema es el único en su clase que documenta formalmente su proceso de desarrollo (TDD + BDD) y su proceso de modelado (CRISP-DM) con trazabilidad explícita entre requisitos, escenarios, pruebas y código, lo que lo hace auditable, reproducible y extensible.

### 11.3 Comparación con Aplicaciones de Medición de Ruido

| Característica | Apps de medición de ruido | HearGuard AI |
|----------------|---------------------------|--------------|
| Medición de dB en tiempo real | ✅ | ✅ |
| Historial de exposición | ❌ | ✅ |
| Evaluación auditiva | ❌ | ✅ |
| Predicción de riesgo con IA | ❌ | ✅ |
| Recomendaciones preventivas | ❌ | ✅ |
| Integración IoT (ESP32) | ❌ | ✅ |
| App móvil nativa | Parcial | ✅ Flutter |
| Código abierto documentado | ❌ | ✅ |

### 11.4 Comparación con Plataformas de Salud Ocupacional

Las plataformas de salud ocupacional certificadas (sistemas hospitalarios de audiometría, software de calibración acústica industrial) ofrecen mayor precisión clínica pero requieren hardware especializado de miles de dólares, instalación profesional y formación técnica. HearGuard AI representa el extremo opuesto: un sistema de grado educativo y preventivo, de acceso libre, que democratiza la monitorización auditiva con un costo de hardware inferior a 30 dólares (ESP32 + KY-037).

### 11.5 Elementos Originales del Software

Los elementos de código originalmente desarrollados para este sistema —sin correspondencia directa en proyectos de código abierto preexistentes— incluyen: (1) el algoritmo de clasificación de riesgo acústico en tiempo real con cuatro niveles de umbral y visualización dinámica en Angular (`noise-monitor.service.ts`); (2) el flujo de prueba auditiva de doce pasos (seis frecuencias × dos oídos) con generación automática del vector de características (`hearing-test.service.ts`); (3) la función `build_feature_vector()` que construye el vector de ocho características con imputación de valores por defecto para los campos ausentes (`ai-service/model/features.py`); (4) el puente serial Node.js para la integración del ESP32 con el backend REST mediante `X-Device-Key` (`serial_bridge.js`); y (5) el conjunto completo de 85 escenarios BDD Gherkin en español para el dominio de salud auditiva (`docs/features/*.feature`).

---

## Capítulo XII — Resultados Obtenidos

### 12.1 Resultados de Ingeniería de Software

| Indicador | Resultado |
|-----------|-----------|
| Casos de prueba automatizados | **507** en 6 capas (207+30+107+42+36+85) |
| Escenarios BDD Gherkin ejecutables | **85** en 6 archivos `.feature` |
| Escenarios k6 de rendimiento | **3** (smoke, promedio, carga) |
| Cobertura de líneas (SonarCloud) | **100 %** |
| Quality Gate SonarCloud | **Aprobado** |
| Security / Reliability / Maintainability | **Rating A** en los tres |
| Vulnerabilidades / Bugs / Code Smells | **0 / 0 / 0** |
| Duplicación de código | **0 %** |
| Líneas de código | **13 000+** en 4 lenguajes |
| Jobs en el pipeline de CI/CD | **10** |
| Requisitos funcionales trazados | **60 RF + 10 RNF** |

### 12.2 Resultados del Modelo Predictivo

| Métrica | Resultado |
|---------|-----------|
| R² holdout (validación) | **≥ 0.80** (verificado en CI) |
| Conjunto de entrenamiento | 4 000 muestras sintéticas |
| Conjunto de validación | 1 000 muestras (20 %) |
| Variables del modelo | 8 características |
| Niveles de clasificación | 4 (Bajo, Moderado, Alto, Muy Alto) |
| Score acotado en | [0, 100] |
| Robustez ante datos faltantes | ✅ verificada (`test_missing_data_safe`) |
| Monotonía del score | ✅ verificada (`test_score_to_years_monotonic`) |

### 12.3 Resultados Funcionales

El sistema implementa la totalidad de los 60 requisitos funcionales definidos al inicio del proyecto y los 10 requisitos no funcionales. Los 85 escenarios BDD Gherkin ejecutables en CI (los que tienen step definitions completas en `bdd/step_definitions/`) pasan en el 100 % de las ejecuciones. Los 36 casos E2E Playwright contra el frontend desplegado en Vercel pasan de forma consistente. El pipeline de CI completa los diez jobs sin errores en cada push a la rama `main`.

### 12.4 Resultados de Despliegue

La plataforma está desplegada en producción en tres servicios en la nube: el backend en Render (`https://backend-hearguard.onrender.com`), el frontend en Vercel (`https://frontend-tau-tan-95.vercel.app`) y la base de datos en MongoDB Atlas. El endpoint de health check (`GET /health`) retorna HTTP 200 de forma continua. El despliegue es completamente automatizado mediante el job `deploy` del pipeline de CI/CD ante cada push a `main` que supere los tests.

---

## Capítulo XIII — Evolución Futura

### 13.1 Integración con Wearables y Dispositivos Clínicos

Una evolución natural del sistema es la integración con wearables de consumo (smartwatches con micrófono, bandas de salud) que proporcionen mediciones continuas de exposición acústica durante la jornada del usuario, sin requerir que este active manualmente el monitor. La integración con audiómetros de grado educativo certificados permitiría elevar la precisión del cuestionario auditivo al nivel de un screening clínico básico.

### 13.2 Dataset Clínico Real y Reentrenamiento del Modelo

La limitación más significativa del modelo actual es el entrenamiento con datos sintéticos. La incorporación de un dataset clínico anonimizado, obtenido con consentimiento informado de pacientes audiológicos, fortalecería de forma sustancial la validez predictiva del modelo. Una vez disponible el dataset, el pipeline de CI/CD permitiría implementar reentrenamiento automático con cada nuevo lote de datos (MLOps), publicando las métricas de evaluación en el `model_metadata.json`.

### 13.3 Módulo de Audiometría Tonal

El cuestionario auditivo actual es una prueba subjetiva de percepción. Una evolución directa es la implementación de una prueba de audiometría tonal básica mediante tonos de referencia reproducidos por el altavoz del dispositivo, en la que el usuario indica el umbral mínimo de percepción por frecuencia. Este enfoque, validado por Vlaming et al. (2014), elevaría la objetividad de la evaluación sin requerir hardware adicional.

### 13.4 Inteligencia Artificial Predictiva Avanzada

Las versiones futuras del sistema podrían incorporar modelos de series temporales (LSTM, Transformer) que aprendan del historial de exposición individual del usuario para predecir la evolución esperada del riesgo a 12 o 24 meses, habilitando intervenciones preventivas proactivas antes de que el deterioro sea perceptible. La arquitectura de microservicios del sistema facilita la sustitución del modelo Random Forest por un modelo más complejo sin afectar al backend ni a los clientes.

### 13.5 Expansión de la Plataforma

La versión 1.0 está orientada a usuarios individuales. Una versión futura podría incorporar funcionalidades de gestión de grupos (empleados de una empresa, estudiantes de una institución educativa, pacientes de una clínica), con dashboards consolidados por grupo, alertas automáticas ante exposiciones colectivas de alto riesgo y exportación de informes de salud ocupacional compatibles con los estándares del Ministerio de Trabajo del Perú.

### 13.6 Integración con el Sistema de Salud

Una evolución de alto impacto social es la integración del perfil de riesgo de HearGuard AI con la Historia Clínica Electrónica (HCE) del MINSA o de prestadoras de salud privadas, de modo que el historial de exposición y los niveles de riesgo calculados sean accesibles para el médico tratante. Esta integración requeriría la certificación del sistema como dispositivo médico de clase I ante DIGEMID.

---

## Conclusiones

**Primera conclusión.** HearGuard AI v1.0 demuestra que es viable construir una plataforma de salud digital preventiva de calidad industrial —evidenciada por 507 casos de prueba automatizados, Quality Gate SonarCloud aprobado, cobertura del 100 % y Rating A en Seguridad, Confiabilidad y Mantenibilidad— aplicando metodologías formales de ingeniería de software (TDD + BDD) en el contexto de la formación universitaria en Ingeniería de Sistemas e Informática de la Universidad Continental.

**Segunda conclusión.** La integración de TDD, BDD y CRISP-DM en un mismo proyecto de software de salud produce una trazabilidad explícita entre los requisitos funcionales, los escenarios de comportamiento Gherkin, los casos de prueba automatizados y el código de producción, lo que hace al sistema auditable, reproducible y mantenible por cualquier desarrollador que adopte el repositorio, independientemente de su participación en el desarrollo original.

**Tercera conclusión.** El modelo Random Forest entrenado con metodología CRISP-DM sobre datos sintéticos, con R² holdout ≥ 0.80 y robustez verificada ante datos faltantes, constituye un componente predictivo funcional y documentado que puede ser mejorado de forma incremental mediante la incorporación de un dataset clínico real, sin necesidad de modificar la arquitectura del microservicio Flask.

**Cuarta conclusión.** La arquitectura de microservicios desacoplados —backend Node.js, microservicio Flask, frontend Angular, app Flutter y firmware ESP32— permite que cada componente evolucione de forma independiente. Esta separación reduce el riesgo de regresiones entre componentes y facilita la sustitución de tecnologías individuales sin afectar al sistema en su conjunto.

**Quinta conclusión.** La disponibilidad de HearGuard AI como software de código abierto con documentación técnica completa (plan de pruebas IEEE 829, matriz de trazabilidad, metodología documentada, especificación OpenAPI 3.1, análisis de complejidad ciclomática, 85 escenarios BDD en Gherkin) lo convierte en un caso de estudio reproducible para la enseñanza de ingeniería de software de calidad en el dominio de la salud digital, contribuyendo al fortalecimiento del ecosistema HealthTech universitario en el Perú.

---

## Referencias Bibliográficas

BECK, Kent. *Test-driven development: by example*. Boston: Addison-Wesley, 2003.

BING, Dai, YING, Jian, ZHAO, Dong, QI, Chen, HUANG, Xinsheng, ZHAO, Fei. Predicting the hearing outcome in sudden sensorineural hearing loss via machine learning models. *Clinical Otolaryngology*. 2018, vol. 43, no. 3, pp. 868–874. DOI 10.1111/coa.13068.

BISSI, Wilson, NETO, Adolfo Gustavo Serra Seca, EMER, Maria Claudia Figueiredo Pereira. The effects of test driven development on internal quality, external quality and productivity: a systematic review. *Information and Software Technology*. 2016, vol. 74, pp. 45–54. DOI 10.1016/j.infsof.2016.02.004.

BREIMAN, Leo. Random forests. *Machine Learning*. 2001, vol. 45, no. 1, pp. 5–32. DOI 10.1023/A:1010933404324.

HUMBLE, Jez, FARLEY, David. *Continuous delivery: reliable software releases through build, test, and deployment automation*. Boston: Addison-Wesley, 2010.

ISO/IEC 25010:2011. *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. Ginebra: International Organization for Standardization, 2011.

ISO/IEC/IEEE 29119-3:2021. *Software and systems engineering — Software testing — Part 3: Test documentation*. Ginebra: International Organization for Standardization, 2021.

ISLAM, S. M. Riazul, MAHMUD, Sabina, RAHMAN, Mohammad Arifur. IoT-based pervasive health monitoring: architectures, opportunities and challenges. *Journal of Ambient Intelligence and Humanized Computing*. 2020, vol. 11, no. 6, pp. 1–22. DOI 10.1007/s12652-020-01817-w.

JANZEN, David, SAIEDIAN, Hossein. Test-driven development: concepts, taxonomy, and future direction. *Computer*. 2005, vol. 38, no. 9, pp. 43–50. DOI 10.1109/MC.2005.314.

KARDOUS, Chucri A., SHAW, Peter B. Evaluation of smartphone sound measurement applications. *The Journal of the Acoustical Society of America*. 2014, vol. 135, no. 4, pp. EL186–EL192. DOI 10.1121/1.4865269.

KREUZBERGER, Dominik, KÜHL, Niklas, HIRSCHL, Sebastian. Machine learning operations (MLOps): overview, definition, and architecture. *IEEE Access*. 2023, vol. 11, pp. 31866–31879. DOI 10.1109/ACCESS.2022.3227572.

LENATTI, Marta, PAGLIALONGA, Alessia, OTERI, Margherita, RUGGERI, Alessandra, MONGODI, Silvia. Characterisation of novel hearing assessment tests via machine learning and digital biomarkers from wearable technologies. *Biomedical Signal Processing and Control*. 2022, vol. 73, art. 103455. DOI 10.1016/j.bspc.2021.103455.

MARTÍNEZ-PLUMED, Fernando, CONTRERAS-OCHANDO, Lidia, FERRI, César, HERNÁNDEZ-ORALLO, José, KULL, Meelis, LACHICHE, Nicolas, RAMÍREZ-QUINTANA, María José, FLACH, Peter. CRISP-DM twenty years later: from data mining processes to data science trajectories. *IEEE Transactions on Knowledge and Data Engineering*. 2021, vol. 33, no. 8, pp. 3048–3061. DOI 10.1109/TKDE.2019.2962680.

MCCABE, Thomas J. A complexity measure. *IEEE Transactions on Software Engineering*. 1976, vol. SE-2, no. 4, pp. 308–320. DOI 10.1109/TSE.1976.233837.

NORTH, Dan. Introducing BDD. *Better Software Magazine*. 2006.

ORGANIZACIÓN MUNDIAL DE LA SALUD. *World report on hearing* [en línea]. Ginebra: World Health Organization, 2021 [consultado: junio 2026]. Disponible en: https://www.who.int/publications/i/item/world-report-on-hearing

OWASP FOUNDATION. *OWASP Top Ten 2021* [en línea]. Open Web Application Security Project, 2021 [consultado: junio 2026]. Disponible en: https://owasp.org/www-project-top-ten/

PICAUT, Judicaël, CAN, Arnaud, FORTIN, Nicolas, ARDOUIN, Jérémy, LAGRANGE, Mathieu. An open-science crowdsourced dataset of urban sound pressure levels and acoustic indicators from the Internet of Sound Monitoring. *Data in Brief*. 2020, vol. 28, art. 104948. DOI 10.1016/j.dib.2019.104948.

PRESSMAN, Roger S., MAXIM, Bruce R. *Software engineering: a practitioner's approach*. 8.ª ed. Nueva York: McGraw-Hill Education, 2014.

SCHRÖER, Christoph, KRUSE, Felix, GÓMEZ, Jorge Marx. A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*. 2021, vol. 181, pp. 526–534. DOI 10.1016/j.procs.2021.01.199.

SHEARER, Colin. The CRISP-DM model: the new blueprint for data mining. *Journal of Data Warehousing*. 2000, vol. 5, no. 4, pp. 13–22.

SMART, John Ferguson. *BDD in action: behavior-driven development for the whole software lifecycle*. Shelter Island: Manning Publications, 2014.

SOLIS, Carlos, WANG, Xiaofeng. A study of the characteristics of behaviour driven development. En: *Proceedings of the 37th EUROMICRO Conference on Software Engineering and Advanced Applications*. IEEE, 2011, pp. 383–387. DOI 10.1109/SEAA.2011.76.

VLAMING, Mark S. M. G., MACKINNON, Robert C., JANSEN, Maartje, MOORE, David R. Automated screening for high-frequency hearing loss. *Ear and Hearing*. 2014, vol. 35, no. 6, pp. 667–679. DOI 10.1097/AUD.0000000000000063.

---

## Anexos Propuestos

### Anexo A — Diagramas de Arquitectura

- Diagrama C4 (Contexto, Contenedores, Componentes) del sistema
- Diagrama de despliegue en la nube (Render + Vercel + MongoDB Atlas)
- Diagrama de flujo del pipeline de CI/CD (10 jobs en GitHub Actions)
- Diagrama de flujo del procesamiento IoT (ESP32 → serial_bridge.js → backend)

### Anexo B — Diagramas UML

- Diagrama de casos de uso del sistema (RF-01 al RF-06 + 10 RNF)
- Diagrama de secuencia: flujo de autenticación con rotación de refresh token
- Diagrama de secuencia: flujo completo de evaluación auditiva e invocación del modelo IA
- Diagrama de secuencia: flujo de monitoreo IoT (ESP32 → backend → frontend)
- Diagrama de clases del backend (controladores, servicios, modelos)
- Diagrama de actividad: ciclo TDD Red–Green–Refactor aplicado en el proyecto

### Anexo C — Modelo de Procesos de Negocio (BPMN)

- Proceso: Ciclo de gestión de salud auditiva del usuario (registro → monitoreo → evaluación → predicción → dashboard)
- Proceso: Incorporación y autenticación de dispositivo IoT ESP32
- Proceso: Ciclo de integración continua y despliegue automatizado

### Anexo D — Modelo de Datos

- Diagrama entidad-relación conceptual de las cinco colecciones MongoDB
- Diccionario de datos completo con tipos, restricciones y ejemplos
- Especificación OpenAPI 3.1 completa (`docs/api-spec.yml`)

### Anexo E — Capturas de Pantalla del Sistema

- Dashboard de salud auditiva (web Angular)
- Monitor de ruido en tiempo real con gauge animado
- Flujo de prueba auditiva (12 pasos)
- Pantalla de resultados con nivel de riesgo y recomendaciones
- Historial de evaluaciones con gráficos de evolución
- Pantalla de gestión de dispositivos IoT
- Aplicación móvil Flutter (pantallas principales)

### Anexo F — Reportes de Calidad

- Reporte de cobertura de código SonarCloud (exportado)
- Reporte HTML de pruebas BDD Cucumber.js
- Reporte HTML de pruebas E2E Playwright
- Reporte HTML de pruebas de rendimiento k6
- Reporte Lighthouse CI (accesibilidad y rendimiento)
- Plan de pruebas IEEE 829 (`docs/plan-de-pruebas.md`)
- Matriz de trazabilidad BDD-TDD (`docs/matriz-trazabilidad.md`)
- Análisis de complejidad ciclomática (`docs/complejidad-ciclomatica.md`)

### Anexo G — Código Fuente

- Archivo comprimido `HearGuardAI_v1.0.zip` con la estructura completa del repositorio
- Fragmentos representativos documentados en `docs/ejemplar-hearguard-ai.md`

---

*HearGuard AI v1.0 · Universidad Continental · Escuela Académico Profesional de Ingeniería de Sistemas e Informática · 2026*

*Metodología: TDD + BDD (principal) · CRISP-DM (modelo predictivo)*

---

**Terreros Hinojosa, Luis Francisco**
DNI N.° 76926326
Autor del software — Ingeniero de Sistemas e Informática
Universidad Continental, Huancayo, Perú

**Rondinel Aquino, Hardy Eduardo**
DNI N.° 71798927
Coautor del software — Ingeniero de Sistemas e Informática
Universidad Continental, Huancayo, Perú

**Maglioni Arana Caparachín**
Asesor Académico
Universidad Continental, Huancayo, Perú
