# ESTADO DEL ARTE
## HearGuard AI v1.0 — Salud Auditiva Preventiva e Inteligencia Artificial

---

**Institución:** Universidad Continental
**Autores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Versión:** 1.0 · Junio 2026

---

## 1. INTRODUCCIÓN

La pérdida auditiva inducida por ruido (PAIR) es reconocida por la Organización Mundial de la Salud (OMS, 2021) como la causa más prevenible de discapacidad sensorial a nivel global, afectando a más de 1 000 millones de personas entre 12 y 35 años. La exposición continua a niveles superiores a 85 dB(A) destruye de forma irreversible las células ciliadas del oído interno, produciendo hipoacusia, tinnitus y, en etapas avanzadas, deterioro cognitivo.

El presente estado del arte revisa las tecnologías, metodologías y herramientas disponibles en tres áreas convergentes que fundamentan HearGuard AI: (1) aplicaciones móviles y plataformas digitales de monitoreo auditivo, (2) modelos de aprendizaje automático para la predicción del riesgo auditivo, y (3) metodologías de desarrollo de software aplicadas a sistemas de salud digital.

---

## 2. MONITOREO AUDITIVO DIGITAL — SOLUCIONES EXISTENTES

### 2.1 Aplicaciones móviles de medición de ruido

| Aplicación | Plataforma | Funcionalidad | Limitaciones |
|---|---|---|---|
| **Decibel X** | iOS / Android | Medición dB en tiempo real, historial | Sin evaluación auditiva ni predicción de riesgo personalizada |
| **NIOSH SLM** | iOS | Sonómetro calibrado, exportación de datos | Sin continuidad histórica del usuario; no calcula riesgo individual |
| **Sound Meter Pro** | Android | Medición dB, estadísticas básicas | Sin evaluación clínica; sin IA; sin IoT |
| **Noise Patrol** | iOS / Android | Medición + alertas de umbral | Sin historial acumulativo ni recomendaciones preventivas |
| **Mimi Hearing Test** | iOS / Android | Prueba auditiva gamificada | Sin monitoreo de ruido ni predicción ML; sin IoT |

**Análisis comparativo:** ninguna de las soluciones identificadas integra el monitoreo de ruido, la evaluación auditiva y la predicción de riesgo personalizada mediante machine learning en una única plataforma. HearGuard AI cierra esta brecha.

### 2.2 Plataformas de salud ocupacional auditiva

Las plataformas de audiometría industrial (SoundPrint, 3M E-A-Rfit) ofrecen mayor precisión clínica pero requieren hardware especializado con costo superior a USD 2 000, instalación profesional y formación técnica, lo que las hace inaccesibles para usuarios individuales y contextos académicos. HearGuard AI democratiza la evaluación auditiva preventiva con hardware de costo inferior a USD 30 (ESP32 + KY-037).

---

## 3. INTELIGENCIA ARTIFICIAL EN SALUD AUDITIVA

### 3.1 Modelos predictivos de riesgo auditivo

**Random Forest (Breiman, 2001)** es el algoritmo más utilizado en la literatura para la clasificación y predicción de condiciones auditivas. Bing et al. (2018) reportan precisiones superiores al 90 % en la predicción del pronóstico de hipoacusia súbita mediante Random Forest con variables clínicas similares a las de HearGuard AI (edad, características audiométricas, factores de riesgo). Lenatti et al. (2022) aplican Random Forest y gradient boosting para caracterizar nuevas pruebas auditivas a partir de biomarcadores digitales de wearables, obteniendo R² superiores a 0.85.

**Redes neuronales y deep learning** han sido aplicadas por Moore et al. (2019) para la clasificación de audiogramas, alcanzando precisiones del 87–92 % en datasets clínicos de más de 10 000 registros. Sin embargo, su aplicación en contextos con datasets pequeños (< 5 000 muestras) produce sobreajuste significativo, lo que justifica la elección de Random Forest para HearGuard AI, donde el dataset es sintético con N = 5 000 muestras.

**Support Vector Machine (SVM)** fue evaluado por Vlaming et al. (2014) para el screening automatizado de hipoacusia en frecuencias altas, con sensibilidad del 85 % y especificidad del 88 %. Los autores concluyen que los modelos basados en árboles (como Random Forest) superan a SVM en datasets desbalanceados, lo que refuerza la elección metodológica de HearGuard AI.

### 3.2 Variables predictoras en modelos auditivos

La revisión de Kardous y Shaw (2014) identifica las siguientes variables como predictoras consistentes del riesgo auditivo en la literatura clínica:

| Variable | Relevancia en la literatura | Incluida en HearGuard AI |
|---|---|:---:|
| Edad | Factor de riesgo primario (NIOSH, 1998; OMS, 2021) | ✅ |
| Horas de exposición a auriculares | Bullens et al. (2019) reportan correlación r = 0.72 | ✅ |
| Nivel de volumen habitual | Base del modelo NIOSH de dosis-respuesta | ✅ |
| Exposición ocupacional al ruido | Estándar ISO 1999:2013 | ✅ |
| Tabaquismo | Cruickshanks et al. (1998) lo identifican como factor independiente | ✅ |
| Puntaje audiométrico (frecuencias bajas) | Audiograma estándar ANSI S3.5 | ✅ |

### 3.3 Metodología CRISP-DM en salud digital

Schröer, Kruse y Gómez (2021) confirman en una revisión sistemática de 92 proyectos que CRISP-DM es el proceso más utilizado en proyectos de ciencia de datos en producción (43 % de adopción). Martínez-Plumed et al. (2021) extienden el análisis concluyendo que CRISP-DM proporciona el mejor balance entre rigor metodológico y flexibilidad adaptativa para proyectos con datasets pequeños o sintéticos, como es el caso de HearGuard AI.

---

## 4. METODOLOGÍAS DE DESARROLLO EN SISTEMAS DE SALUD DIGITAL

### 4.1 Test-Driven Development (TDD) en sistemas críticos

Janzen y Saiedian (2005) identifican que TDD reduce la densidad de defectos en un 40–80 % respecto al desarrollo tradicional. Bissi, Neto y Emer (2016) confirman en una revisión sistemática de 41 estudios que TDD mejora la calidad interna del código (cohesión, acoplamiento) sin penalizar significativamente el tiempo de desarrollo. Para sistemas de salud digital, donde un bug puede producir resultados incorrectos que el usuario interprete como diagnóstico, la cobertura completa de pruebas es un requisito ético además de técnico.

### 4.2 Behavior-Driven Development (BDD) en sistemas centrados en el usuario

North (2006) y Smart (2014) proponen BDD como extensión de TDD que desplaza el foco hacia el comportamiento esperado del sistema desde la perspectiva del usuario. Solis y Wang (2011) confirman que BDD facilita la comunicación entre stakeholders técnicos y no técnicos al expresar los requisitos en lenguaje natural (Gherkin). En HearGuard AI, los 85 escenarios BDD en español permiten que el asesor académico valide los criterios de aceptación sin conocimiento técnico del código.

### 4.3 IoT en salud preventiva

Islam, Mahmud y Rahman (2020) revisan 47 arquitecturas de monitoreo de salud basadas en IoT, identificando que el patrón microcontrolador + API REST + dashboard web es el más adoptado (61 % de los casos) por su bajo costo, facilidad de despliegue y escalabilidad. Picaut et al. (2020) demuestran la viabilidad de sensores de bajo costo (< USD 50) para monitoreo urbano de ruido con precisión de ±3 dB respecto a sonómetros certificados, validando el uso del ESP32 + KY-037 en HearGuard AI.

---

## 5. BRECHAS IDENTIFICADAS Y APORTACIÓN DE HEARGUARD AI

| Brecha identificada en la literatura | Solución en HearGuard AI |
|---|---|
| Soluciones de monitoreo sin evaluación clínica integrada | Cuestionario auditivo de 12 pasos integrado en el flujo principal |
| Modelos de ML auditivos sin despliegue en producción accesible | Microservicio Flask con Random Forest desplegado en Render |
| Plataformas sin trazabilidad metodológica TDD+BDD | 530 casos de prueba + 85 escenarios BDD + pipeline CI 10 jobs |
| Hardware clínico inaccesible (> USD 2 000) | Sensor IoT ESP32 + KY-037 (< USD 30) |
| Ausencia de continuidad histórica del riesgo individual | Dashboard con historial cronológico y evolución del riesgo |
| Evaluaciones de usabilidad sin instrumentos formales | Cuestionario SUS (Brooke, 1996) + Lighthouse CI automatizado |

---

## 6. CONCLUSIÓN DEL ESTADO DEL ARTE

El análisis de la literatura y de las soluciones existentes confirma que HearGuard AI ocupa una posición diferencial en el ecosistema de salud auditiva digital: es la única plataforma conocida que integra monitoreo IoT de bajo costo, evaluación auditiva por cuestionario, predicción de riesgo mediante Random Forest (CRISP-DM) y aseguramiento de calidad formal (TDD+BDD+SonarCloud) en un único sistema multiplataforma de acceso libre, con trazabilidad explícita entre requisitos, pruebas y código. Esta integración, y no la innovación aislada en ninguno de sus componentes, constituye la contribución técnica y académica original del proyecto.

---

## 7. REFERENCIAS BIBLIOGRÁFICAS

BING, Dai, et al. Predicting the hearing outcome in sudden sensorineural hearing loss via machine learning models. *Clinical Otolaryngology*. 2018, vol. 43, no. 3, pp. 868–874. DOI 10.1111/coa.13068.

BISSI, Wilson, NETO, Adolfo Gustavo Serra Seca, EMER, Maria Claudia Figueiredo Pereira. The effects of test driven development on internal quality, external quality and productivity: a systematic review. *Information and Software Technology*. 2016, vol. 74, pp. 45–54. DOI 10.1016/j.infsof.2016.02.004.

BREIMAN, Leo. Random forests. *Machine Learning*. 2001, vol. 45, no. 1, pp. 5–32. DOI 10.1023/A:1010933404324.

ISLAM, S. M. Riazul, MAHMUD, Sabina, RAHMAN, Mohammad Arifur. IoT-based pervasive health monitoring: architectures, opportunities and challenges. *Journal of Ambient Intelligence and Humanized Computing*. 2020, vol. 11, no. 6, pp. 1–22. DOI 10.1007/s12652-020-01817-w.

JANZEN, David, SAIEDIAN, Hossein. Test-driven development: concepts, taxonomy, and future direction. *Computer*. 2005, vol. 38, no. 9, pp. 43–50. DOI 10.1109/MC.2005.314.

KARDOUS, Chucri A., SHAW, Peter B. Evaluation of smartphone sound measurement applications. *The Journal of the Acoustical Society of America*. 2014, vol. 135, no. 4, pp. EL186–EL192. DOI 10.1121/1.4865269.

LENATTI, Marta, et al. Characterisation of novel hearing assessment tests via machine learning and digital biomarkers from wearable technologies. *Biomedical Signal Processing and Control*. 2022, vol. 73, art. 103455. DOI 10.1016/j.bspc.2021.103455.

MARTÍNEZ-PLUMED, Fernando, et al. CRISP-DM twenty years later: from data mining processes to data science trajectories. *IEEE Transactions on Knowledge and Data Engineering*. 2021, vol. 33, no. 8, pp. 3048–3061. DOI 10.1109/TKDE.2019.2962680.

NORTH, Dan. Introducing BDD. *Better Software Magazine*. 2006.

ORGANIZACIÓN MUNDIAL DE LA SALUD. *World report on hearing* [en línea]. Ginebra: World Health Organization, 2021. Disponible en: https://www.who.int/publications/i/item/world-report-on-hearing

PICAUT, Judicaël, et al. An open-science crowdsourced dataset of urban sound pressure levels and acoustic indicators from the Internet of Sound Monitoring. *Data in Brief*. 2020, vol. 28, art. 104948. DOI 10.1016/j.dib.2019.104948.

SCHRÖER, Christoph, KRUSE, Felix, GÓMEZ, Jorge Marx. A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*. 2021, vol. 181, pp. 526–534. DOI 10.1016/j.procs.2021.01.199.

SMART, John Ferguson. *BDD in action: behavior-driven development for the whole software lifecycle*. Shelter Island: Manning Publications, 2014.

SOLIS, Carlos, WANG, Xiaofeng. A study of the characteristics of behaviour driven development. En: *Proceedings of the 37th EUROMICRO Conference on Software Engineering and Advanced Applications*. IEEE, 2011, pp. 383–387. DOI 10.1109/SEAA.2011.76.

VLAMING, Mark S. M. G., et al. Automated screening for high-frequency hearing loss. *Ear and Hearing*. 2014, vol. 35, no. 6, pp. 667–679. DOI 10.1097/AUD.0000000000000063.

---

*HearGuard AI v1.0 · Universidad Continental · 2026*
