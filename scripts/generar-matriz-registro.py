#!/usr/bin/env python3
"""
Genera docs/matriz-registro-hearguard.xlsx — Matriz de registro HearGuard AI (UC).

Uso: python scripts/generar-matriz-registro.py
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, PieChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.formatting.rule import CellIsRule, ColorScaleRule
from openpyxl.styles import Alignment, Border, Font, GradientFill, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.hyperlink import Hyperlink

# ── Metadatos del proyecto (editar aquí si cambia el curso) ───────────────────
PROJECT = {
    "nombre": "HearGuard AI",
    "subtitulo": "Plataforma de salud auditiva preventiva con TDD/BDD + CRISP-DM",
    "autor": "Luis Francisco Terreros Hinojosa",
    "asesor": "Max Arana Caparachín",
    "institucion": "Universidad Continental",
    "escuela": "Escuela Académico Profesional de Ingeniería de Sistemas e Informática",
    "curso": "Proyecto de titulación / Trabajo de investigación",
    "periodo": "2026-I",
    "codigo_curso": "[Código del curso — completar]",
    "email": "luisterreroshinojosa@gmail.com",
    "version_matriz": "4.0",
}

REPO_BASE = "https://github.com/hatWHITE-UwU/hearguard-ai"
REPO_COMMIT = f"{REPO_BASE}/commit"
SONAR_URL = "https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai"
CI_URL = f"{REPO_BASE}/actions"
DOCS_TRAZA = f"{REPO_BASE}/blob/main/docs/matriz-trazabilidad.md"


@dataclass
class Bolt:
    intent_id: str
    intent_title: str
    bolt_id: str
    description: str
    model: str
    date: str
    domain: str
    methodology: str
    status: str
    evidence: str
    evidence_url: str | None = None
    trace: str = ""
    notes: str = ""


@dataclass
class RfGroup:
    rf_id: str
    nombre: str
    descripcion: str
    feature_bdd: str
    subrequisitos: int
    estado: str
    tests_principales: str
    intents: str


@dataclass
class RnfItem:
    rnf_id: str
    requisito: str
    verificacion: str
    estado: str
    evidencia: str


@dataclass
class Proceso:
    id_proceso: str
    tipo_proceso: str
    nombre_proceso: str
    rama_git: str
    responsable: str
    estado: str
    version_actual: str
    observaciones: str


@dataclass
class Dependencia:
    id_bolt: str
    depende_de: str
    tipo_dependencia: str
    impacto: str
    observacion: str


@dataclass
class Artefacto:
    id_artefacto: str
    tipo_artefacto: str
    id_bolt: str
    nombre: str
    ruta_url: str
    version: str
    observacion: str


@dataclass
class PmvItem:
    id_pmv: str
    nombre_pmv: str
    id_bolt: str
    modulo: str
    estado: str
    observacion: str


@dataclass
class ReqItem:
    req_id: str
    tipo: str
    descripcion: str
    prioridad: str
    pmv: str
    estado: str
    bolt_relacionado: str


RF_GROUPS: list[RfGroup] = [
    RfGroup("RF-01", "Autenticación y sesión",
            "Registro, login, refresh JWT, logout, perfil y guards Angular.",
            "docs/features/autenticacion.feature", 17, "✅ Completo",
            "auth.test.js · security.test.js · auth.*.spec.ts", "INT-001, INT-002, INT-005"),
    RfGroup("RF-02", "Monitoreo de ruido",
            "Captura dB, clasificación de riesgo, historial y estadísticas hoy/semana.",
            "docs/features/monitoreo-ruido.feature", 15, "✅ Completo",
            "noise.test.js · noise-monitor.service.spec.ts", "INT-001, INT-002"),
    RfGroup("RF-03", "Prueba auditiva tonal",
            "Cuestionario 12 pasos (6 Hz × 2 oídos), scoring y evaluación complete/partial.",
            "docs/features/prueba-auditiva.feature", 13, "✅ Completo",
            "hearing-test.service.spec.ts · evaluation.test.js", "INT-001, INT-002"),
    RfGroup("RF-04", "Predicción de riesgo (IA)",
            "Random Forest: score 0-100, niveles, recomendaciones, integración Flask.",
            "docs/features/prediccion-riesgo-ia.feature", 15, "✅ Completo",
            "test_predictor.py · test_api.py · evaluation-ai.test.js", "INT-001, INT-006"),
    RfGroup("RF-05", "Resultados y recomendaciones",
            "Historial de evaluaciones, riskResult y visualización de resultados.",
            "docs/features/resultados-y-recomendaciones.feature", 6, "⚠️ E2E parcial",
            "evaluation.test.js · e2e/hearing-test.spec.ts", "INT-001, INT-002"),
    RfGroup("RF-06", "Dispositivos IoT (ESP32)",
            "Registro de dispositivos, X-Device-Key y POST /api/noise/iot.",
            "docs/features/dispositivos-iot.feature", 6, "✅ Completo",
            "device.test.js · noise.test.js (IoT)", "INT-001, INT-002, INT-005"),
]

RNF_ITEMS: list[RnfItem] = [
    RnfItem("RNF-01", "p95 respuesta API < 2 000 ms", "k6 threshold http_req_duration", "✅ Configurado",
            "tests/k6/load-test.js"),
    RnfItem("RNF-02", "Tasa de error < 5 % bajo carga", "k6 threshold http_req_failed", "✅ Configurado",
            "tests/k6/load-test.js"),
    RnfItem("RNF-03", "Cobertura backend 100 % (CI)", "Jest lcov + job backend ci.yml", "✅ Cumplido",
            "backend/coverage/lcov.info"),
    RnfItem("RNF-04", "Cobertura IA ≥ 60 %", "pytest --cov-fail-under=60", "✅ Cumplido",
            "ai-service/coverage.xml"),
    RnfItem("RNF-05", "ESLint sin errores (backend/frontend)", "npm run lint en CI", "✅ Cumplido",
            ".github/workflows/ci.yml"),
    RnfItem("RNF-06", "Protección NoSQL injection", "security.test.js", "✅ Cumplido",
            "backend/tests/security.test.js"),
    RnfItem("RNF-07", "JWT HS256 / rechazo alg:none", "security.test.js", "✅ Cumplido",
            "backend/tests/security.test.js"),
    RnfItem("RNF-08", "Rate limiting API", "server.js apiLimiter", "✅ Cumplido",
            "backend/tests/security.test.js"),
    RnfItem("RNF-09", "SonarCloud Quality Gate OK", "job sonarcloud + SONAR_TOKEN", "✅ Cumplido",
            SONAR_URL),
    RnfItem("RNF-10", "Conventional Commits (Husky)", ".husky/commit-msg", "✅ Cumplido",
            ".husky/"),
]

# Bolts (misma base ampliada; ver repo para historial completo)
BOLTS: list[Bolt] = [
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-001",
         "Configurar Jest + Supertest + cobertura lcov (umbral CI 100 %)",
         "Claude Sonnet", "03/2026", "Backend", "TDD", "Sí", "backend/package.json", None, "RF-01–06", ""),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-002",
         "Suite integración: auth, noise, evaluation, device, middleware",
         "Claude Sonnet", "03/2026", "Backend", "TDD", "Sí", "backend/tests/ (207 tests)", None, "RF-01–06", ""),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-003",
         "Tests seguridad: JWT, IDOR, NoSQL, rutas protegidas (22 casos)",
         "Claude Sonnet", "03/2026", "Seguridad", "TDD", "Sí", "security.test.js", None, "RF-01, RF-06", ""),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-004",
         "pytest + coverage XML en ai-service (30 tests)",
         "Claude Sonnet", "03/2026", "IA", "TDD", "Sí", "ai-service/tests/", None, "RF-04", ""),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-005",
         "Vitest Angular: core + features services (107 tests)",
         "Claude Sonnet", "03/2026", "Frontend", "TDD", "Sí", "frontend/**/*.spec.ts", None, "RF-01, RF-03", ""),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-006",
         "flutter_test móvil (42 tests)",
         "Claude Sonnet", "03/2026", "Móvil", "TDD", "Sí", "flutter_app/test/", None, "—", ""),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-007",
         "Playwright E2E smoke + auth + hearing-test (36 tests)",
         "Claude Sonnet", "03/2026", "E2E", "TDD", "Sí", "e2e/tests/", None, "RF-05", "Vercel preview"),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-008",
         "Plan de pruebas IEEE 829 / ISO 29119",
         "Claude Sonnet", "03/2026", "Docs", "TDD", "Sí", "docs/plan-de-pruebas.md", None, "—", "1169 líneas"),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-009",
         "coverage-extra + noise.service + database tests",
         "Claude Sonnet", "21/05/2026", "Backend", "TDD", "Sí", "Commit 8ebc768", f"{REPO_COMMIT}/8ebc768", "—", "100 % líneas"),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-010",
         "evaluation-ai.test.js — flujo IA exitoso",
         "Claude Sonnet", "22/05/2026", "Backend", "TDD", "Sí", "Commit f8daa25", f"{REPO_COMMIT}/f8daa25", "RF-04", ""),
    Bolt("INT-001", "Framework de testing (TDD)", "INT-001-BOLT-011",
         "Jest --runInBand para estabilidad MongoDB en cobertura",
         "Equipo", "22/05/2026", "Backend", "TDD", "Sí", "README § Tests", None, "—", ""),
    Bolt("INT-002", "BDD — Gherkin y trazabilidad", "INT-002-BOLT-001",
         "6 archivos .feature (auth, ruido, auditiva, IA, IoT, resultados)",
         "Claude Sonnet", "03/2026", "BDD", "BDD", "Sí", "docs/features/", None, "RF-01–06", ""),
    Bolt("INT-002", "BDD — Gherkin y trazabilidad", "INT-002-BOLT-002",
         "Matriz trazabilidad RF ↔ BDD ↔ test (60 RF, 10 RNF)",
         "Claude Sonnet", "03/2026", "Docs", "BDD", "Sí", "docs/matriz-trazabilidad.md", DOCS_TRAZA, "—", ""),
    Bolt("INT-002", "BDD — Gherkin y trazabilidad", "INT-002-BOLT-003",
         "Metodología TDD+BDD documentada con referencias APA",
         "Claude Sonnet", "05/2026", "Docs", "BDD", "Sí", "docs/metodologia.md", None, "—", ""),
    Bolt("INT-002", "BDD — Gherkin y trazabilidad", "INT-002-BOLT-004",
         "Ejecutar .feature con Cucumber en CI",
         "Claude Sonnet", "06/2026", "BDD", "BDD", "Sí", "job bdd en ci.yml — 85 escenarios", None, "—", ""),
    Bolt("INT-003", "CI/CD — Validaciones automáticas", "INT-003-BOLT-001",
         "Jobs: backend, ai-service, frontend, bdd, e2e, flutter, sonarcloud, k6-smoke, lighthouse, deploy",
         "Claude Sonnet", "03–06/2026", "CI/CD", "CI", "Sí", "ci.yml — 10 jobs con timeout-minutes", CI_URL, "RNF-09", ""),
    Bolt("INT-003", "CI/CD — Validaciones automáticas", "INT-003-BOLT-002",
         "Artefactos cobertura + fix-sonar-coverage-paths.js",
         "Claude Sonnet", "21/05/2026", "CI/CD", "CI", "Sí", "scripts/fix-sonar-coverage-paths.js", None, "RNF-03", ""),
    Bolt("INT-003", "CI/CD — Validaciones automáticas", "INT-003-BOLT-003",
         "deploy.yml → Render + Vercel",
         "Claude Sonnet", "03/2026", "Deploy", "CI", "Sí", "deploy.yml", None, "—", ""),
    Bolt("INT-003", "CI/CD — Validaciones automáticas", "INT-003-BOLT-004",
         "Badge CI verde en README",
         "GitHub Actions", "05/2026", "CI/CD", "CI", "Sí", "README badge", CI_URL, "—", ""),
    Bolt("INT-003", "CI/CD — Validaciones automáticas", "INT-003-BOLT-005",
         "Optimizar duración pipeline (métricas SLA)",
         "Claude Sonnet", "06/2026", "CI/CD", "CI", "Sí", "timeout-minutes en los 10 jobs de ci.yml (5–30 min)", None, "—", ""),
    Bolt("INT-004", "Calidad — SonarCloud", "INT-004-BOLT-001",
         "sonar-project.properties + exclusiones",
         "Claude Sonnet", "05/2026", "Calidad", "SAST", "Sí", "sonar-project.properties", SONAR_URL, "RNF-09", ""),
    Bolt("INT-004", "Calidad — SonarCloud", "INT-004-BOLT-002",
         "Ratings Security / Reliability / Maintainability = A",
         "Claude Sonnet", "21/05/2026", "Calidad", "SAST", "Sí", "Commit 28925d5", f"{REPO_COMMIT}/28925d5", "—", "0 issues"),
    Bolt("INT-004", "Calidad — SonarCloud", "INT-004-BOLT-003",
         "Cerrar S2699 y code smells (37+)",
         "Claude Sonnet", "20–21/05/2026", "Calidad", "SAST", "Sí", "Commits ddde986, 319e9bc", f"{REPO_COMMIT}/319e9bc", "—", ""),
    Bolt("INT-004", "Calidad — SonarCloud", "INT-004-BOLT-004",
         "Duplicación 0 % + cobertura 100 % Sonar",
         "Claude Sonnet", "22/05/2026", "Calidad", "SAST", "Sí", "Commit 8ebc768", f"{REPO_COMMIT}/8ebc768", "RNF-03", ""),
    Bolt("INT-005", "Seguridad", "INT-005-BOLT-001",
         "S5147 NoSQL injection + $eq en Device/Noise",
         "Claude Sonnet", "19–20/05/2026", "Seguridad", "SAST", "Sí", "25c1603, 1998062", f"{REPO_COMMIT}/25c1603", "RNF-06", ""),
    Bolt("INT-005", "Seguridad", "INT-005-BOLT-002",
         "S2068 + PRNG seguro en E2E helpers",
         "Claude Sonnet", "20/05/2026", "Seguridad", "SAST", "Sí", "fb4119c, 8c5d890", f"{REPO_COMMIT}/fb4119c", "—", "Regresión C→A"),
    Bolt("INT-005", "Seguridad", "INT-005-BOLT-003",
         "npm audit periódico",
         "Claude Sonnet", "06/2026", "Seguridad", "SAST", "Sí", "npm audit --audit-level=high en job backend ci.yml", None, "—", ""),
    Bolt("INT-006", "Modelo IA — CRISP-DM", "INT-006-BOLT-001",
         "Fases 1-2: negocio y variables",
         "Claude Sonnet", "03/2026", "IA", "CRISP-DM", "Sí", "README · metodologia.md", None, "RF-04", ""),
    Bolt("INT-006", "Modelo IA — CRISP-DM", "INT-006-BOLT-002",
         "Fase 3: features.py + constants.py",
         "Claude Sonnet", "03/2026", "IA", "CRISP-DM", "Sí", "ai-service/model/", None, "RF-04", "8 features"),
    Bolt("INT-006", "Modelo IA — CRISP-DM", "INT-006-BOLT-003",
         "Fase 4: trainer Random Forest SEED=42",
         "Claude Sonnet", "03/2026", "IA", "CRISP-DM", "Sí", "trainer.py", None, "RF-04", ""),
    Bolt("INT-006", "Modelo IA — CRISP-DM", "INT-006-BOLT-004",
         "Fase 5: R²≥0.80 + perfiles bajo/alto",
         "Claude Sonnet", "03/2026", "IA", "CRISP-DM", "Sí", "test_predictor.py", None, "RF-04", ""),
    Bolt("INT-006", "Modelo IA — CRISP-DM", "INT-006-BOLT-005",
         "Fase 6: Flask + Render + ai.service.js",
         "Claude Sonnet", "03/2026", "IA", "CRISP-DM", "Sí", "app.py · render.yaml", None, "RF-04", ""),
    Bolt("INT-006", "Modelo IA — CRISP-DM", "INT-006-BOLT-006",
         "Reentrenamiento en CI (job ai-service)",
         "Claude Sonnet", "05/2026", "IA", "CRISP-DM", "Sí", "ci.yml", CI_URL, "—", ""),
    Bolt("INT-007", "Rendimiento (RNF)", "INT-007-BOLT-001",
         "k6: smoke, load, spike + umbrales p95/error",
         "Claude Sonnet", "03/2026", "Rendimiento", "RNF", "Sí", "tests/k6/load-test.js", None, "RNF-01, RNF-02", ""),
    Bolt("INT-007", "Rendimiento (RNF)", "INT-007-BOLT-002",
         "Ejecutar k6 en Render y adjuntar reporte al informe",
         "Claude Sonnet", "06/2026", "Rendimiento", "RNF", "Sí", "k6-smoke job ci.yml — reports/k6/index.html", None, "RNF-01", ""),
    Bolt("INT-007", "Rendimiento (RNF)", "INT-007-BOLT-003",
         "Lighthouse en frontend Vercel",
         "Claude Sonnet", "06/2026", "Frontend", "RNF", "Sí", "lighthouse job ci.yml (treosh/lighthouse-ci-action)", None, "—", ""),
    Bolt("INT-008", "Documentación y entregables", "INT-008-BOLT-001",
         "articulo.md + README + api-spec",
         "Claude Sonnet", "05/2026", "Docs", "—", "Sí", "docs/articulo.md", None, "—", ""),
    Bolt("INT-008", "Documentación y entregables", "INT-008-BOLT-002",
         "Matriz de registro Excel v3 (este archivo)",
         "Claude Sonnet", datetime.now().strftime("%d/%m/%Y"), "Docs", "—", "Sí",
         "docs/matriz-registro-hearguard.xlsx", None, "—", f"v{PROJECT['version_matriz']}"),
    Bolt("INT-008", "Documentación y entregables", "INT-008-BOLT-003",
         "complejidad-ciclomatica.md (McCabe)",
         "Claude Sonnet", "03/2026", "Docs", "—", "Sí", "docs/complejidad-ciclomatica.md", None, "—", ""),
    Bolt("INT-008", "Documentación y entregables", "INT-008-BOLT-004",
         "Docker Compose reproducible",
         "Claude Sonnet", "03/2026", "DevOps", "—", "Sí", "docker-compose.yml", None, "—", ""),
]

PROCESOS: list[Proceso] = [
    Proceso("P-001", "Misional", "Autenticación y Gestión de Sesión", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "JWT 15min + refresh 7d SHA-256, bcrypt salt=12, soft delete, guard Angular"),
    Proceso("P-002", "Misional", "Monitoreo de Ruido en Tiempo Real", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "Captura dB micrófono + ESP32, 4 niveles de riesgo, historial FIFO 30 muestras"),
    Proceso("P-003", "Misional", "Prueba Auditiva Tonal", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "12 pasos (6 frecuencias x 2 oídos) Web Audio API, status complete/partial"),
    Proceso("P-004", "Misional", "Predicción de Riesgo con IA", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "Random Forest scikit-learn CRISP-DM, R2>=0.80, score 0-100, recomendaciones"),
    Proceso("P-005", "Misional", "Resultados y Recomendaciones", "main",
            "Luis F. Terreros H.", "Parcial", "1.0",
            "Backend 100%, E2E Playwright parcial en CI (modo demo Vercel)"),
    Proceso("P-006", "Misional", "Gestión de Dispositivos IoT", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "ESP32 + X-Device-Key + serial_bridge.js, highRisk flag cuando dB>85"),
    Proceso("P-007", "Estratégico", "Framework de Testing (TDD)", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "507 tests: Jest+Supertest 207, pytest 30, Vitest 107, flutter_test 42, Playwright 36, Cucumber.js 85"),
    Proceso("P-008", "Estratégico", "Behavior-Driven Development (BDD)", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "6 archivos .feature Gherkin — 85 escenarios ejecutados con Cucumber.js en job bdd de CI"),
    Proceso("P-009", "Estratégico", "CI/CD Validaciones Automáticas", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "GitHub Actions: 10 jobs (backend, ai-service, frontend, bdd, e2e, flutter, sonarcloud, k6-smoke, lighthouse, deploy)"),
    Proceso("P-010", "Estratégico", "Calidad SonarCloud", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "Quality Gate OK, Rating A (Security/Reliability/Maintainability), Cobertura 100%"),
    Proceso("P-011", "Apoyo", "Seguridad de Aplicación", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "JWT HS256, CORS, rate-limit 100/15min, NoSQL injection fix, Helmet.js"),
    Proceso("P-012", "Apoyo", "Modelo IA CRISP-DM", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "Random Forest + Flask microservice + Render deploy + reentrenamiento en CI"),
    Proceso("P-013", "Apoyo", "Rendimiento y Escalabilidad", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "k6-smoke job ci.yml con handleSummary (reports/k6/index.html). Lighthouse job ci.yml (accessibility >=90%)"),
    Proceso("P-014", "Apoyo", "Documentación y Entregables UC", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "articulo.md + README + api-spec.yml + plan-de-pruebas.md + complejidad + esta matriz"),
    Proceso("P-015", "Apoyo", "Infraestructura y Deploy", "main",
            "Luis F. Terreros H.", "Completado", "1.0",
            "Docker Compose + Render (backend+AI) + Vercel (frontend) + GHCR"),
]

DEPENDENCIAS: list[Dependencia] = [
    Dependencia("INT-002", "INT-001", "Funcional", "Alto",
                "BDD requiere tests TDD funcionando para validar escenarios .feature"),
    Dependencia("INT-003", "INT-001", "Técnica", "Alto",
                "CI/CD ejecuta todos los jobs de testing; sin tests no hay pipeline útil"),
    Dependencia("INT-004", "INT-003", "Técnica", "Alto",
                "SonarCloud recibe artefactos lcov/coverage.xml generados en CI"),
    Dependencia("INT-004", "INT-001", "Datos", "Alto",
                "SonarCloud consume lcov.info y coverage.xml generados por los tests"),
    Dependencia("INT-005", "INT-001", "Técnica", "Alto",
                "security.test.js forma parte del framework Jest del INT-001"),
    Dependencia("INT-006", "INT-001", "Funcional", "Alto",
                "pytest valida el modelo IA antes de integrarlo al backend Node.js"),
    Dependencia("INT-006-BOLT-005", "INT-006-BOLT-003", "Técnica", "Alto",
                "Flask app.py depende del modelo entrenado por trainer.py (risk_model.pkl)"),
    Dependencia("INT-007", "INT-003", "Técnica", "Medio",
                "k6 puede correr como job adicional de rendimiento en CI/CD"),
    Dependencia("INT-008", "INT-002", "Funcional", "Medio",
                "Documentación toma la matriz de trazabilidad BDD como fuente de verdad"),
    Dependencia("INT-003-BOLT-003", "INT-003-BOLT-001", "Técnica", "Alto",
                "deploy.yml solo corre si ci.yml pasa todos los jobs en verde"),
]

ARTEFACTOS: list[Artefacto] = [
    Artefacto("ART-001", "Modelo IA", "INT-006-BOLT-003",
              "risk_model.pkl", "ai-service/model/saved/risk_model.pkl", "1.0",
              "Random Forest SEED=42, 15.3 MB, R2>=0.80"),
    Artefacto("ART-002", "API Spec", "INT-008-BOLT-001",
              "api-spec.yml", "docs/api-spec.yml", "1.0",
              "OpenAPI 3.0 completo, 34 KB, todos los endpoints documentados"),
    Artefacto("ART-003", "Cobertura", "INT-001-BOLT-001",
              "lcov.info (backend)", "backend/coverage/lcov.info", "CI",
              "Jest, 100% lineas/funciones/ramas, consumido por SonarCloud"),
    Artefacto("ART-004", "Cobertura", "INT-001-BOLT-004",
              "coverage.xml (AI)", "ai-service/coverage.xml", "CI",
              "pytest-cov, consumido por SonarCloud"),
    Artefacto("ART-005", "Cobertura", "INT-001-BOLT-005",
              "lcov.info (frontend)", "frontend/coverage/hearguard-frontend/lcov.info", "CI",
              "Vitest, 100% lineas, consumido por SonarCloud"),
    Artefacto("ART-006", "CI/CD", "INT-003-BOLT-001",
              "ci.yml", ".github/workflows/ci.yml", "1.0",
              "10 jobs: backend, ai-service, frontend, bdd, e2e, flutter, sonarcloud, k6-smoke, lighthouse, deploy"),
    Artefacto("ART-007", "CI/CD", "INT-003-BOLT-003",
              "deploy.yml", ".github/workflows/deploy.yml", "1.0",
              "Deploy Render (backend+AI) + Vercel (frontend) + GHCR images"),
    Artefacto("ART-008", "Infraestructura", "INT-008-BOLT-004",
              "docker-compose.yml", "docker-compose.yml", "1.0",
              "Orquesta mongodb:7 + ai-service:5001 + backend:3000 + frontend:8080"),
    Artefacto("ART-009", "Documentacion", "INT-008-BOLT-001",
              "articulo.md", "docs/articulo.md", "1.0",
              "Articulo tecnico HearGuard AI, 32.7 KB"),
    Artefacto("ART-010", "Plan pruebas", "INT-001-BOLT-008",
              "plan-de-pruebas.md", "docs/plan-de-pruebas.md", "1.0",
              "IEEE 829 / ISO 29119, 1169 lineas, 26 KB"),
    Artefacto("ART-011", "Trazabilidad", "INT-002-BOLT-002",
              "matriz-trazabilidad.md", "docs/matriz-trazabilidad.md", "1.0",
              "60 RF + 10 RNF trazados a BDD y tests"),
    Artefacto("ART-012", "Calidad", "INT-004-BOLT-001",
              "sonar-project.properties", "sonar-project.properties", "1.0",
              "Multi-lenguaje JS/TS/Python, exclusiones, coverage paths"),
    Artefacto("ART-013", "Seguridad", "INT-001-BOLT-003",
              "security.test.js", "backend/tests/security.test.js", "1.0",
              "22 casos: JWT, IDOR, NoSQL injection, rutas protegidas"),
    Artefacto("ART-014", "Rendimiento", "INT-007-BOLT-001",
              "load-test.js", "tests/k6/load-test.js", "1.0",
              "k6: smoke + load + spike, threshold p95<2000ms, error<5%"),
    Artefacto("ART-015", "Firmware IoT", "INT-001-BOLT-001",
              "hearguard_esp32.ino", "arduino/hearguard_esp32/hearguard_esp32.ino", "1.0",
              "ESP32 C++ firmware para lectura de sensor de ruido"),
    Artefacto("ART-016", "Matriz", "INT-008-BOLT-002",
              "matriz-registro-hearguard.xlsx", "docs/matriz-registro-hearguard.xlsx", "4.0",
              "Generada por scripts/generar-matriz-registro.py"),
    Artefacto("ART-017", "IoT Bridge", "INT-001-BOLT-001",
              "serial_bridge.js", "arduino/serial_bridge.js", "1.0",
              "Node.js puente serial Arduino <-> Backend API"),
    Artefacto("ART-018", "Config deploy", "INT-008-BOLT-004",
              "render.yaml", "render.yaml", "1.0",
              "Render: hearguard-backend (Node 20) + hearguard-ai (Python 3.11)"),
]

PMV_ITEMS: list[PmvItem] = [
    PmvItem("PMV-001", "API Auth JWT", "INT-001-BOLT-002", "Backend", "Completo",
            "POST /register + /login + /refresh + /logout + GET/PATCH /me"),
    PmvItem("PMV-002", "Monitoreo Ruido Backend", "INT-001-BOLT-002", "Backend", "Completo",
            "POST /api/noise + GET /api/noise + estadisticas hoy/semana"),
    PmvItem("PMV-003", "Prueba Auditiva Backend", "INT-001-BOLT-002", "Backend", "Completo",
            "POST /api/evaluations 12 scores -> status complete/partial"),
    PmvItem("PMV-004", "Prediccion IA Flask", "INT-006-BOLT-005", "AI Service", "Completo",
            "POST /api/predict -> score + nivel + recomendaciones personalizadas"),
    PmvItem("PMV-005", "Dashboard Angular", "INT-001-BOLT-005", "Frontend", "Completo",
            "Login + register + dashboard + monitor + hearing-test + results + history"),
    PmvItem("PMV-006", "App Flutter", "INT-001-BOLT-006", "Movil", "Completo",
            "10 screens: splash, auth, dashboard, monitor (mic real), hearing, results, profile"),
    PmvItem("PMV-007", "Dispositivos IoT ESP32", "INT-001-BOLT-001", "IoT", "Completo",
            "X-Device-Key + POST /api/noise/iot + highRisk flag cuando dB>85"),
    PmvItem("PMV-008", "CI/CD GitHub Actions", "INT-003-BOLT-001", "DevOps", "Completo",
            "10 jobs: backend, ai-service, frontend, bdd, e2e, flutter, sonarcloud, k6-smoke, lighthouse, deploy"),
    PmvItem("PMV-009", "SonarCloud Quality Gate", "INT-004-BOLT-001", "Calidad", "Completo",
            "100% cobertura, 0 issues, Rating A, Duplicacion 0%"),
    PmvItem("PMV-010", "Deploy Render + Vercel", "INT-003-BOLT-003", "Deploy", "Completo",
            "Backend/AI en Render, Frontend en Vercel, imagenes Docker en GHCR"),
]

COMMITS = [
    ("2026-05-22", "8ebc768", "test",     "test(coverage): alcanzar 100% en todas las metricas de cobertura",             "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-22", "ea9449b", "test",     "test(coverage): cubrir ramas restantes para alcanzar 100% en SonarCloud",      "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-22", "f8daa25", "test",     "test(coverage): cubrir ruta IA exitosa, interceptor logout y origins Python",  "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-22", "9191ea4", "fix",      "fix(sonar): corregir 3 code smells de mantenibilidad",                        "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-22", "b7097b9", "fix",      "fix(sonar): excluir tests del CPD para eliminar duplicaciones de boilerplate", "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-21", "28925d5", "fix",      "fix(sonar): fiabilidad A, cobertura 100% y duplicaciones 0%",                 "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-21", "6d40565", "test",     "test(coverage): eliminar re-declaraciones locales de Evaluation",              "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-21", "0abba4e", "test",     "test(coverage): agregar tests de cobertura para alcanzar 100% en SonarCloud",  "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-21", "39a8a3a", "fix",      "fix(sonar): corregir reporte de cobertura frontend y acercar metrica a 100%", "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-21", "319e9bc", "fix",      "fix(tests): aserciones Jest inline para cerrar 9 issues Sonar S2699",         "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-21", "5a455e6", "fix",      "fix(tests): aserciones Jest en tests 401 para Sonar S2699",                   "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-21", "3199ef4", "ci",       "ci: disparar analisis SonarCloud con cobertura tras SONAR_TOKEN",             "Equipo",          "Luis F. Terreros H."),
    ("2026-05-21", "4235774", "fix",      "fix(ci): cerrar issue TODO y hotspot SHA en sonarqube-scan-action",           "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "954d5ae", "ci",       "ci(sonar): habilitar analisis con cobertura desde GitHub Actions",            "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "178b5a8", "refactor", "refactor(tests): bajar duplicacion en evaluation.test.js y hearing-test",     "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "8c5d890", "fix",      "fix(security): sustituir Math.random por crypto.randomBytes en E2E",          "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "fb4119c", "fix",      "fix(security): cerrar S2068 hard-coded password en e2e/tests/helpers.ts",     "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "71bb7c7", "refactor", "refactor(quality): eliminar duplicaciones reportadas por SonarCloud",         "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "e94c7a6", "docs",     "docs(readme): reflejar conteos reales de tests y estado limpio de Sonar",     "Equipo",          "Luis F. Terreros H."),
    ("2026-05-20", "ddde986", "refactor", "refactor(quality): cerrar 37 code smells reportados por SonarCloud",          "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "25c1603", "fix",      "fix(security): sanitizar deviceId para cerrar S5147 NoSQL injection",         "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-19", "dac07b5", "fix",      "fix(reliability): fix 2 SonarCloud Fiabilidad bugs",                          "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-19", "8ec38a5", "fix",      "fix(security): add explicit $eq operators en Device.findOne (S5147)",         "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-20", "0367ef9", "chore",    "chore(flutter): commit pubspec.lock para reproducibilidad (SonarCloud S8571)", "Equipo",         "Luis F. Terreros H."),
    ("2026-05-19", "13cdf60", "fix",      "fix(ci): fix gen-flutter-lock workflow token + git add path",                 "Claude Sonnet", "Luis F. Terreros H."),
    # Sesión junio 2026 — BDD, k6, Lighthouse, documentación y SLA
    ("2026-05-27", "b012733", "test",    "test(flutter): añadir 22 tests + fix score_to_years determinista",             "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-27", "945cccd", "ci",      "ci(k6): agregar job smoke de performance en CI post-deploy",                  "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-27", "228a21e", "refactor","refactor(frontend): extraer estilos inline a archivos .component.scss",        "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-05-27", "0527cd5", "ci",      "ci(lighthouse): agregar job de auditoría de performance Lighthouse en Vercel", "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-06-09", "27bef44", "ci",      "ci(bdd): agregar ejecución automática de escenarios Gherkin con Cucumber.js",  "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-06-09", "672ece3", "ci",      "ci(k6): generar reporte HTML con handleSummary en producción",                 "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-06-09", "18fd16e", "docs",    "docs(articulo): actualizar métricas y limitaciones tras BDD + k6 HTML",        "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-06-09", "c8d3f7a", "docs",    "docs: sincronizar metodologia y plan-de-pruebas con estado real del repo",     "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-06-09", "3a8bb79", "docs",    "docs: actualizar 422 → 507 en toda la documentación académica",               "Claude Sonnet", "Luis F. Terreros H."),
    ("2026-06-10", "6f8b169", "chore",   "chore(matrix): marcar bolts BDD/k6/Lighthouse como completados; avance 97.5%","Claude Sonnet", "Luis F. Terreros H."),
    ("2026-06-10", "1e56763", "ci",      "ci(sla): agregar timeout-minutes y npm audit al pipeline",                     "Claude Sonnet", "Luis F. Terreros H."),
]

REQS: list[ReqItem] = [
    # RF-01 Autenticacion (17)
    ReqItem("RF-01-1",  "RF", "Registro exitoso con datos validos -> 201 + tokens",         "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-2",  "RF", "Registro con email duplicado -> 409",                        "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-3",  "RF", "Registro con contrasena debil -> 400",                       "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-4",  "RF", "Registro con email invalido -> 400",                         "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-5",  "RF", "Registro con campos requeridos faltantes -> 400",            "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-6",  "RF", "Login exitoso -> 200 + tokens",                              "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-7",  "RF", "Login con contrasena incorrecta -> 401",                     "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-8",  "RF", "Login con email inexistente -> 401",                         "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-9",  "RF", "Refresh token valido -> nuevo access token",                 "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-10", "RF", "GET /me con token valido -> datos del usuario",              "Alta", "PMV-001", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-01-11", "RF", "Ruta protegida sin token -> 401",                            "Alta", "PMV-001", "Completo", "INT-001-BOLT-003"),
    ReqItem("RF-01-12", "RF", "JWT con firma invalida -> 401",                              "Alta", "PMV-001", "Completo", "INT-001-BOLT-003"),
    ReqItem("RF-01-13", "RF", "JWT con algoritmo none -> 401",                              "Alta", "PMV-001", "Completo", "INT-001-BOLT-003"),
    ReqItem("RF-01-14", "RF", "JWT expirado -> 401",                                        "Alta", "PMV-001", "Completo", "INT-001-BOLT-003"),
    ReqItem("RF-01-15", "RF", "Login Angular actualiza currentUser Signal",                 "Media","PMV-005", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-01-16", "RF", "Guard redirige a / sin token",                               "Alta", "PMV-005", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-01-17", "RF", "Interceptor anade Bearer header automaticamente",           "Alta", "PMV-005", "Completo", "INT-001-BOLT-005"),
    # RF-02 Ruido (15)
    ReqItem("RF-02-1",  "RF", "40 dB -> Bajo (#22C55E)",                                   "Alta", "PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-2",  "RF", "72 dB -> Moderado (#F59E0B)",                               "Alta", "PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-3",  "RF", "87 dB -> Alto (#FF8C00)",                                   "Alta", "PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-4",  "RF", "105 dB -> Muy Alto (#FF4D4D)",                              "Alta", "PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-5",  "RF", "Frontera 54/55 dB correctamente clasificada",               "Media","PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-6",  "RF", "Frontera 74/75 dB correctamente clasificada",               "Media","PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-7",  "RF", "Historial FIFO maximo 30 muestras en memoria",              "Alta", "PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-8",  "RF", "stop() invocable multiples veces sin error",                "Media","PMV-002", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-02-9",  "RF", "POST /api/noise con datos validos -> 201",                  "Alta", "PMV-002", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-02-10", "RF", "GET /api/noise paginado",                                   "Alta", "PMV-002", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-02-11", "RF", "Clasificacion 4 rangos dB en backend",                      "Alta", "PMV-002", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-02-12", "RF", "Estadisticas del dia con registros existentes",             "Alta", "PMV-002", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-02-13", "RF", "Estadisticas semanales",                                    "Alta", "PMV-002", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-02-14", "RF", "IDOR: usuario A no ve registros de usuario B",              "Alta", "PMV-002", "Completo", "INT-001-BOLT-003"),
    ReqItem("RF-02-15", "RF", "NoSQL injection en source rechazado",                       "Alta", "PMV-002", "Completo", "INT-005-BOLT-001"),
    # RF-03 Prueba auditiva (13)
    ReqItem("RF-03-1",  "RF", "gain=0.01 -> score 10 (limite superior)",                  "Alta", "PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-2",  "RF", "gain=0.50 -> score 5",                                     "Alta", "PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-3",  "RF", "gain=1.00 -> score 0 (limite inferior)",                   "Alta", "PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-4",  "RF", "gain=0.00 clampea a 0.01 -> score 10",                     "Media","PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-5",  "RF", "gain=1.50 clampea a 1.00 -> score 0",                      "Media","PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-6",  "RF", "recordHeard registra score y avanza paso",                  "Alta", "PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-7",  "RF", "recordHeard noop cuando isComplete=true",                   "Media","PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-8",  "RF", "recordNotHeard registra score 0 y avanza",                  "Alta", "PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-9",  "RF", "Prueba completa: 12 pasos cubre ambos oidos",               "Alta", "PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-10", "RF", "resetFlow reinicia todos los pasos",                        "Alta", "PMV-003", "Completo", "INT-001-BOLT-005"),
    ReqItem("RF-03-11", "RF", "12 scores -> evaluacion status: complete",                  "Alta", "PMV-003", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-03-12", "RF", "6 scores -> evaluacion status: partial",                    "Alta", "PMV-003", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-03-13", "RF", "IDOR: usuario A no ve evaluaciones de usuario B",            "Alta", "PMV-003", "Completo", "INT-001-BOLT-003"),
    # RF-04 Prediccion IA (15)
    ReqItem("RF-04-1",  "RF", "score<=30 -> nivel Bajo",                                   "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-2",  "RF", "score 31-55 -> nivel Moderado",                             "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-3",  "RF", "score 56-75 -> nivel Alto",                                 "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-4",  "RF", "score>75 -> nivel Muy Alto",                                "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-5",  "RF", "Perfil bajo riesgo (joven, sin exposicion) -> score<40",    "Alta", "PMV-004", "Completo", "INT-006-BOLT-004"),
    ReqItem("RF-04-6",  "RF", "Perfil alto riesgo (60a, 10h auriculares) -> score>60",     "Alta", "PMV-004", "Completo", "INT-006-BOLT-004"),
    ReqItem("RF-04-7",  "RF", "Payload vacio no rompe el servicio Flask",                  "Media","PMV-004", "Completo", "INT-006-BOLT-005"),
    ReqItem("RF-04-8",  "RF", "Recomendaciones nivel Bajo (>=1 item)",                     "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-9",  "RF", "Recomendaciones nivel Moderado (>=1 item)",                 "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-10", "RF", "Recomendaciones nivel Alto (>=1 item)",                     "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-11", "RF", "Recomendaciones nivel Muy Alto (>=1 item)",                 "Alta", "PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-12", "RF", "GET /api/model-info -> R2 >= 0.80",                         "Alta", "PMV-004", "Completo", "INT-006-BOLT-004"),
    ReqItem("RF-04-13", "RF", "Modelo ya cargado -> retorna desde cache",                  "Media","PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-14", "RF", "Archivo .pkl no existe -> FileNotFoundError",               "Media","PMV-004", "Completo", "INT-006-BOLT-003"),
    ReqItem("RF-04-15", "RF", "GET /health AI Service -> 200 + model state",              "Alta", "PMV-004", "Completo", "INT-006-BOLT-005"),
    # RF-05 Resultados (6)
    ReqItem("RF-05-1",  "RF", "Evaluacion guardada con riskResult y recomendaciones",      "Alta", "PMV-003", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-05-2",  "RF", "Historial ordenado por fecha descendente",                  "Alta", "PMV-003", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-05-3",  "RF", "GET /evaluations/:id retorna evaluacion + riskResult",      "Alta", "PMV-003", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-05-4",  "RF", "Visualizacion inmediata al finalizar prueba (E2E)",         "Alta", "PMV-005", "Parcial",  "INT-001-BOLT-007"),
    ReqItem("RF-05-5",  "RF", "Scores altos -> nivel Bajo en resultados (E2E)",            "Alta", "PMV-005", "Parcial",  "INT-001-BOLT-007"),
    ReqItem("RF-05-6",  "RF", "Historial FIFO 30 muestras en monitor",                    "Alta", "PMV-002", "Completo", "INT-001-BOLT-005"),
    # RF-06 IoT (6)
    ReqItem("RF-06-1",  "RF", "POST /api/noise/iot con X-Device-Key valida -> 201",       "Alta", "PMV-007", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-06-2",  "RF", "X-Device-Key invalida -> 401",                             "Alta", "PMV-007", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-06-3",  "RF", "Sin header X-Device-Key -> 401",                           "Alta", "PMV-007", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-06-4",  "RF", "Registro de dispositivo genera apiKey unica",              "Alta", "PMV-007", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-06-5",  "RF", "Lista dispositivos del usuario autenticado",               "Alta", "PMV-007", "Completo", "INT-001-BOLT-002"),
    ReqItem("RF-06-6",  "RF", "dB > 85 -> highRisk = true en el registro",               "Alta", "PMV-007", "Completo", "INT-001-BOLT-002"),
    # RNF (10)
    ReqItem("RNF-01", "RNF", "p95 respuesta API < 2000 ms bajo carga",                    "Alta", "PMV-008", "Configurado", "INT-007-BOLT-001"),
    ReqItem("RNF-02", "RNF", "Tasa de error < 5% bajo carga k6",                          "Alta", "PMV-008", "Configurado", "INT-007-BOLT-001"),
    ReqItem("RNF-03", "RNF", "Cobertura de lineas backend >= 100% (CI)",                  "Alta", "PMV-009", "Cumplido",    "INT-001-BOLT-001"),
    ReqItem("RNF-04", "RNF", "Cobertura IA >= 60% (pytest --cov-fail-under)",             "Alta", "PMV-009", "Cumplido",    "INT-001-BOLT-004"),
    ReqItem("RNF-05", "RNF", "ESLint sin errores backend/frontend en CI",                 "Media","PMV-009", "Cumplido",    "INT-003-BOLT-001"),
    ReqItem("RNF-06", "RNF", "Proteccion contra NoSQL injection",                         "Alta", "PMV-009", "Cumplido",    "INT-005-BOLT-001"),
    ReqItem("RNF-07", "RNF", "JWT HS256 / rechazo algoritmo none",                        "Alta", "PMV-009", "Cumplido",    "INT-001-BOLT-003"),
    ReqItem("RNF-08", "RNF", "Rate limiting: 100 req / 15 min por IP",                   "Alta", "PMV-009", "Cumplido",    "INT-005-BOLT-001"),
    ReqItem("RNF-09", "RNF", "SonarCloud Quality Gate OK en cada push a main",            "Alta", "PMV-009", "Cumplido",    "INT-004-BOLT-001"),
    ReqItem("RNF-10", "RNF", "Conventional Commits enforced via Husky pre-commit",        "Media","PMV-009", "Cumplido",    "INT-003-BOLT-001"),
]

TIPO_CAMBIO_COLOR = {
    "feat": "C6EFCE", "fix": "FFEB9C", "test": "DDEBF7",
    "refactor": "E7E6E6", "ci": "FFF2CC", "docs": "FCE4D6",
    "chore": "F8CBAD", "refactor": "E7E6E6",
}
PRIORIDAD_COLOR = {"Alta": "FFC7CE", "Media": "FFEB9C", "Baja": "C6EFCE"}
TIPO_PROCESO_COLOR = {"Misional": "DDEBF7", "Estrategico": "E2EFDA", "Apoyo": "FFF2CC"}

INTENT_COLORS = {
    "INT-001": "E2EFDA", "INT-002": "DDEBF7", "INT-003": "FFF2CC",
    "INT-004": "FCE4D6", "INT-005": "E7E6E6", "INT-006": "E4DFEC",
    "INT-007": "D9E1F2", "INT-008": "F8CBAD",
}
STATUS_FILL = {"Sí": "C6EFCE", "No": "FFC7CE", "Parcial": "FFEB9C"}

# ── Paleta HearGuard (design system oficial) ──────────────────────────────────
BRAND        = "1F3864"   # Azul marino oscuro (headers principales)
BRAND_LIGHT  = "2E5FA3"   # Azul medio (encabezados secundarios)
ACCENT_CYAN  = "00B0F0"   # Cian (destacados)
ACCENT_PURP  = "7030A0"   # Púrpura (secciones especiales)
ROW_ODD      = "EEF4FB"   # Fila impar (bandeado)
ROW_EVEN     = "FFFFFF"   # Fila par (blanco)
SECTION_BG   = "D6E4F7"   # Fondo de separadores de sección
ACCENT       = "2E75B6"   # Azul secundario (compatibilidad)

# Colores semáforo
SEM_OK  = "C6EFCE"   # Verde
SEM_WAR = "FFEB9C"   # Amarillo
SEM_ERR = "FFC7CE"   # Rojo
SEM_INF = "DDEBF7"   # Azul info

# Iconos de estado
ICONS = {
    "Sí": "✅", "Completo": "✅", "Completado": "✅",
    "Cumplido": "✅", "Configurado": "✅", "Integrado": "✅",
    "No": "❌", "Pendiente": "❌",
    "Parcial": "⚠️",
}


def _border(color: str = "C8D4E3") -> Border:
    s = Side(style="thin", color=color)
    return Border(left=s, right=s, top=s, bottom=s)


def _border_thick() -> Border:
    thick = Side(style="medium", color=BRAND)
    thin  = Side(style="thin",   color="C8D4E3")
    return Border(left=thick, right=thick, top=thin, bottom=thin)


def _banded(idx: int) -> PatternFill:
    """Relleno alternante para filas de datos (idx empieza en 0)."""
    return PatternFill("solid", fgColor=ROW_ODD if idx % 2 == 0 else ROW_EVEN)


def _icon(status: str) -> str:
    return ICONS.get(status, status)


def _hyperlink(cell, url: str, label: str | None = None) -> None:
    if url and url.startswith("http"):
        cell.value = label or "Ver enlace"
        cell.hyperlink = Hyperlink(ref=cell.coordinate, target=url)
        cell.font = Font(color="0563C1", underline="single", size=9)


def _style_header_row(ws, row: int, cols: int, titles: list[str],
                      bg: str = BRAND, fg: str = "FFFFFF", size: int = 10) -> None:
    for c, title in enumerate(titles, 1):
        cell = ws.cell(row=row, column=c, value=title)
        cell.font = Font(bold=True, color=fg, size=size)
        cell.fill = PatternFill("solid", fgColor=bg)
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = _border()
    ws.row_dimensions[row].height = 28


def _section_row(ws, row: int, text: str, ncols: int, bg: str = SECTION_BG) -> None:
    """Fila de separación de sección (merge + color + texto en negrita)."""
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=ncols)
    cell = ws.cell(row=row, column=1, value=text)
    cell.font = Font(bold=True, size=10, color=BRAND)
    cell.fill = PatternFill("solid", fgColor=bg)
    cell.alignment = Alignment(horizontal="left", vertical="center")
    cell.border = _border(BRAND_LIGHT)
    ws.row_dimensions[row].height = 20


def _kpi_box(ws, row: int, col: int, label: str, value: str,
             bg: str = ACCENT_CYAN, fg: str = "FFFFFF") -> None:
    """Escribe un bloque KPI de 2 filas: etiqueta encima, valor abajo."""
    lc = ws.cell(row=row, column=col, value=label)
    lc.font = Font(bold=True, size=9, color=fg)
    lc.fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    lc.alignment = Alignment(horizontal="center", vertical="center")
    lc.border = _border()

    vc = ws.cell(row=row + 1, column=col, value=value)
    vc.font = Font(bold=True, size=14, color=BRAND)
    vc.fill = PatternFill("solid", fgColor="F0F7FF")
    vc.alignment = Alignment(horizontal="center", vertical="center")
    vc.border = _border()


def _write_portada(wb: Workbook) -> None:
    ws = wb.create_sheet("Portada", 0)
    ws.sheet_view.showGridLines = False
    gen = datetime.now().strftime("%d/%m/%Y %H:%M")

    # ── Banner superior ────────────────────────────────────────────────────────
    def _banner(row: int, text: str, size: int, bold: bool,
                fg: str = "333333", bg: str | None = None, height: int = 0) -> None:
        ws.merge_cells(f"A{row}:I{row}")
        c = ws[f"A{row}"]
        c.value = text
        c.font = Font(bold=bold, size=size, color=fg)
        c.alignment = Alignment(horizontal="center" if bold else "left", vertical="center")
        if bg:
            c.fill = PatternFill("solid", fgColor=bg)
        if height:
            ws.row_dimensions[row].height = height

    _banner(1, PROJECT["institucion"], 14, True, "FFFFFF", BRAND, 32)
    _banner(2, PROJECT["escuela"],     10, False, "FFFFFF", BRAND_LIGHT, 22)
    _banner(3, "", 10, False)

    _banner(4, f"❤  {PROJECT['nombre']}", 28, True, BRAND, "F0F7FF", 52)
    _banner(5, PROJECT["subtitulo"],   12, False, "555555", "F8FBFF", 24)
    _banner(6, "", 10, False)

    _banner(7, "MATRIZ DE REGISTRO DE ACTIVIDADES", 16, True, "FFFFFF", BRAND, 30)
    _banner(8, f"Versión {PROJECT['version_matriz']}  ·  Generada: {gen}  ·  {PROJECT['periodo']}", 10, False, "FFFFFF", BRAND_LIGHT, 20)
    _banner(9, "", 10, False)

    # ── Datos del estudiante ───────────────────────────────────────────────────
    _section_row(ws, 10, "  DATOS DEL ESTUDIANTE", 9, SECTION_BG)
    datos = [
        ("Autor",              PROJECT["autor"]),
        ("Correo",             PROJECT["email"]),
        ("Asesor",             PROJECT["asesor"]),
        ("Curso / proyecto",   PROJECT["curso"]),
        ("Periodo académico",  PROJECT["periodo"]),
        ("Código de curso",    PROJECT["codigo_curso"]),
        ("Institución",        PROJECT["institucion"]),
    ]
    for i, (lbl, val) in enumerate(datos, 11):
        lc = ws.cell(row=i, column=1, value=lbl)
        lc.font = Font(bold=True, size=10, color=BRAND)
        lc.fill = PatternFill("solid", fgColor="F0F4FA")
        lc.border = _border()
        vc = ws.cell(row=i, column=2, value=val)
        vc.font = Font(size=10, color="333333")
        vc.fill = PatternFill("solid", fgColor=ROW_EVEN)
        vc.border = _border()
        ws.merge_cells(f"B{i}:I{i}")
        ws.row_dimensions[i].height = 18

    # ── Metodologías ──────────────────────────────────────────────────────────
    r = 19
    _section_row(ws, r, "  METODOLOGÍAS APLICADAS", 9, SECTION_BG)
    metos = [
        ("Principal",       "Test-Driven Development (TDD) + Behavior-Driven Development (BDD)"),
        ("Complementaria",  "CRISP-DM — modelo predictivo Random Forest scikit-learn"),
        ("Calidad",         "SonarCloud — Quality Gate OK · Ratings A · Cobertura 100%"),
        ("Convenciones",    "Conventional Commits · ESLint · Docker non-root · JWT HS256"),
    ]
    for i, (lbl, val) in enumerate(metos, r + 1):
        lc = ws.cell(row=i, column=1, value=lbl)
        lc.font = Font(bold=True, size=10, color=BRAND)
        lc.fill = PatternFill("solid", fgColor="F0F4FA")
        lc.border = _border()
        vc = ws.cell(row=i, column=2, value=val)
        vc.font = Font(size=10)
        vc.fill = PatternFill("solid", fgColor=ROW_EVEN)
        vc.border = _border()
        ws.merge_cells(f"B{i}:I{i}")
        ws.row_dimensions[i].height = 18

    # ── Índice de navegación ───────────────────────────────────────────────────
    r = 26
    _section_row(ws, r, "  ÍNDICE DE HOJAS (navegación rápida — haz clic en las pestañas inferiores)", 9, SECTION_BG)
    r += 1
    _style_header_row(ws, r, 3, ["Hoja", "Contenido", "Registros"], BRAND_LIGHT)
    r += 1

    nav = [
        ("Portada",               "Datos institucionales, metodologías e índice",               "—"),
        ("Dashboard",             "KPIs, avance por Intent, semáforos, gráficos",              "8 Intents"),
        ("Matriz de registro",    "Bolts detallados con evidencia, enlace y estado",            f"{len(BOLTS)} bolts"),
        ("Requisitos funcionales","Resumen RF-01 a RF-06 con feature BDD y tests",              "6 RF-grupos"),
        ("Requisitos no funcionales", "RNF-01 a RNF-10 con verificación y evidencia",          "10 RNF"),
        ("Métricas pruebas",      "507 tests por capa con comandos de ejecución",               "8 capas"),
        ("Resumen Intents",       "Tabla compacta de avance por Intent",                        "8 Intents"),
        ("TRAZABILIDAD",          "RF → Feature BDD → Test ID → Tipo → Estado",               "60 RF + 10 RNF"),
        ("PROCESOS",              "15 procesos BPMN: Misional / Estratégico / Apoyo",           "15 procesos"),
        ("ACTIVIDADES_BPMN",      "Actividades vinculadas a bolts y procesos",                  "24 actividades"),
        ("FLUJO_BPMN",            "Nodos del flujo de autenticación modelado (P-001)",          "19 nodos"),
        ("REQUERIMIENTOS",        "60 RF + 10 RNF individuales con prioridad, PMV y estado",   "82 req."),
        ("CONTROL_VERSIONES",     "Commits, agente, confianza y revisión humana por bolt",      f"{len(BOLTS)} registros"),
        ("AI_DLC",                "Ciclo de vida Diseño/Desarrollo/QA/Producción por bolt",    f"{len(BOLTS)} bolts"),
        ("DEPENDENCIAS",          "Dependencias técnicas y funcionales entre intents",          f"{len(DEPENDENCIAS)} deps."),
        ("MERGES",                "Commits a main con hipervínculos a GitHub",                  f"{len(COMMITS)} commits"),
        ("HISTORIAL",             "Log cronológico de todos los cambios",                       f"{len(COMMITS)} eventos"),
        ("ARTEFACTOS",            "Inventario de archivos clave: rutas, versiones, propósito",  f"{len(ARTEFACTOS)} artefactos"),
        ("PMV",                   "Componentes del Producto Mínimo Viable",                     f"{len(PMV_ITEMS)} items"),
        ("Instrucciones",         "Guía de uso y regeneración del documento",                   "—"),
    ]

    for j, (hoja, contenido, regs) in enumerate(nav):
        bg = ROW_ODD if j % 2 == 0 else ROW_EVEN
        h = ws.cell(row=r, column=1, value=hoja)
        h.font = Font(bold=True, size=9, color=BRAND)
        h.fill = PatternFill("solid", fgColor=bg)
        h.border = _border()
        c2 = ws.cell(row=r, column=2, value=contenido)
        c2.font = Font(size=9)
        c2.fill = PatternFill("solid", fgColor=bg)
        c2.border = _border()
        c3 = ws.cell(row=r, column=3, value=regs)
        c3.font = Font(size=9, color="555555")
        c3.fill = PatternFill("solid", fgColor=bg)
        c3.border = _border()
        c3.alignment = Alignment(horizontal="center")
        ws.row_dimensions[r].height = 16
        r += 1

    # ── Enlace al repositorio ──────────────────────────────────────────────────
    r += 1
    _section_row(ws, r, "  ENLACES DEL PROYECTO", 9, SECTION_BG)
    r += 1
    links = [
        ("Repositorio GitHub",          REPO_BASE),
        ("SonarCloud — Quality Gate",   SONAR_URL),
        ("GitHub Actions — CI/CD",      CI_URL),
        ("Matriz de trazabilidad",      DOCS_TRAZA),
    ]
    for lbl, url in links:
        lc = ws.cell(row=r, column=1, value=lbl)
        lc.font = Font(bold=True, size=10, color=BRAND)
        lc.fill = PatternFill("solid", fgColor="F0F4FA")
        lc.border = _border()
        uc = ws.cell(row=r, column=2)
        _hyperlink(uc, url, url)
        uc.fill = PatternFill("solid", fgColor=ROW_EVEN)
        uc.border = _border()
        ws.merge_cells(f"B{r}:I{r}")
        ws.row_dimensions[r].height = 18
        r += 1

    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 62
    ws.column_dimensions["C"].width = 14
    for col in range(4, 10):
        ws.column_dimensions[get_column_letter(col)].width = 4


def _write_dashboard(wb: Workbook) -> None:
    ws = wb.create_sheet("Dashboard")
    ws.sheet_view.showGridLines = False

    # ── Título ─────────────────────────────────────────────────────────────────
    ws.merge_cells("A1:M1")
    ws["A1"] = f"❤  Dashboard — {PROJECT['nombre']} v1.0  ·  {PROJECT['periodo']}"
    ws["A1"].font = Font(bold=True, size=16, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 36

    ws.merge_cells("A2:M2")
    ws["A2"] = f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}  ·  Autor: {PROJECT['autor']}  ·  {PROJECT['institucion']}"
    ws["A2"].font = Font(italic=True, size=9, color="FFFFFF")
    ws["A2"].fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    ws["A2"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 18

    # ── KPI Cards (fila 4-5) ──────────────────────────────────────────────────
    total   = len(BOLTS)
    si      = sum(1 for b in BOLTS if b.status == "Sí")
    no      = sum(1 for b in BOLTS if b.status == "No")
    par     = sum(1 for b in BOLTS if b.status == "Parcial")
    g_pct   = round((si + 0.5 * par) / total * 100, 1)
    total_rf = sum(g.subrequisitos for g in RF_GROUPS)

    ws.row_dimensions[3].height = 8
    ws.row_dimensions[4].height = 22
    ws.row_dimensions[5].height = 32

    kpis_cols = [
        (1,  "Bolts Completados",   f"{si}/{total}"),
        (2,  "Avance Global",        f"{g_pct}%"),
        (3,  "Tests Automatizados",  "507"),
        (4,  "Cobertura Backend",    "100%"),
        (5,  "Cobertura Frontend",   "100%"),
        (6,  "Req. Funcionales RF",  f"{total_rf}"),
        (7,  "Req. No Funcionales",  f"{len(RNF_ITEMS)}"),
        (8,  "Artefactos Clave",     f"{len(ARTEFACTOS)}"),
        (9,  "Commits en main",      f"{len(COMMITS)}"),
        (10, "SonarCloud Rating",    "A / A / A"),
        (11, "Duplicación Sonar",    "0%"),
        (12, "PMV Completados",      f"{len(PMV_ITEMS)}/{len(PMV_ITEMS)}"),
    ]
    for col, label, value in kpis_cols:
        _kpi_box(ws, 4, col, label, value)
        ws.column_dimensions[get_column_letter(col)].width = 14

    ws.column_dimensions["M"].width = 14

    # ── Tabla de avance por Intent ─────────────────────────────────────────────
    ws.row_dimensions[7].height = 8
    _section_row(ws, 8, "  AVANCE POR INTENT (Bolts)", 13, SECTION_BG)

    intents: dict[str, dict] = {}
    for b in BOLTS:
        if b.intent_id not in intents:
            intents[b.intent_id] = {"title": b.intent_title, "t": 0, "Sí": 0, "No": 0, "Parcial": 0}
        intents[b.intent_id]["t"] += 1
        intents[b.intent_id][b.status] += 1

    headers_intent = ["Semáforo", "Intent", "Objetivo", "Total Bolts", "✅ Sí", "❌ No", "⚠️ Parcial", "% Avance", "Dominio"]
    _style_header_row(ws, 9, 9, headers_intent, BRAND)

    data_start_intent = 10
    for j, iid in enumerate(sorted(intents.keys())):
        d      = intents[iid]
        pct    = round((d["Sí"] + 0.5 * d["Parcial"]) / d["t"] * 100, 1)
        row    = data_start_intent + j
        sem    = "🟢" if pct >= 90 else "🟡" if pct >= 70 else "🔴"
        domain = {"INT-001": "Testing", "INT-002": "BDD", "INT-003": "CI/CD",
                  "INT-004": "Calidad", "INT-005": "Seguridad", "INT-006": "IA/ML",
                  "INT-007": "Rendimiento", "INT-008": "Docs"}.get(iid, "—")
        bg = _banded(j)
        vals = [sem, iid, d["title"], d["t"], d["Sí"], d["No"], d["Parcial"], pct / 100, domain]
        for c, val in enumerate(vals, 1):
            cell = ws.cell(row=row, column=c, value=val)
            cell.border = _border()
            cell.fill = bg
            cell.alignment = Alignment(horizontal="center" if c in (1, 2, 4, 5, 6, 7, 8) else "left",
                                       vertical="center")
            if c == 8:
                cell.number_format = "0.0%"
                cell.fill = PatternFill("solid", fgColor=SEM_OK if pct >= 90 else SEM_WAR if pct >= 70 else SEM_ERR)
                cell.font = Font(bold=True)
        ws.row_dimensions[row].height = 20

    # Fila totales
    tot_row = data_start_intent + len(intents)
    ws.cell(tot_row, 1, "—")
    ws.cell(tot_row, 2, "TOTAL").font = Font(bold=True, color=BRAND)
    ws.cell(tot_row, 4, total).font = Font(bold=True)
    ws.cell(tot_row, 5, si).font    = Font(bold=True, color="375623")
    ws.cell(tot_row, 6, no).font    = Font(bold=True, color="9C0006")
    ws.cell(tot_row, 7, par).font   = Font(bold=True, color="7D5700")
    pct_cell = ws.cell(tot_row, 8, g_pct / 100)
    pct_cell.number_format = "0.0%"
    pct_cell.font = Font(bold=True)
    pct_cell.fill = PatternFill("solid", fgColor=SEM_OK)
    for c in range(1, 10):
        ws.cell(tot_row, c).border = _border()
        ws.row_dimensions[tot_row].height = 22

    # ── Tabla RF por módulo ────────────────────────────────────────────────────
    rf_row = tot_row + 3
    _section_row(ws, rf_row, "  COBERTURA DE REQUISITOS FUNCIONALES", 9, SECTION_BG)
    rf_row += 1
    _style_header_row(ws, rf_row, 6,
                      ["RF", "Módulo", "Sub-RF", "Estado", "Feature BDD", "Tests principales"],
                      BRAND_LIGHT)
    rf_row += 1
    for j, g in enumerate(RF_GROUPS):
        bg = _banded(j)
        vals = [g.rf_id, g.nombre, g.subrequisitos, g.estado, g.feature_bdd, g.tests_principales]
        for c, val in enumerate(vals, 1):
            cell = ws.cell(row=rf_row, column=c, value=val)
            cell.border = _border()
            cell.fill   = bg
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=SEM_OK if "✅" in str(val) else SEM_WAR)
        ws.row_dimensions[rf_row].height = 20
        rf_row += 1

    # ── Tabla métricas de calidad ──────────────────────────────────────────────
    q_row = rf_row + 2
    _section_row(ws, q_row, "  MÉTRICAS DE CALIDAD — SONARCLOUD", 9, SECTION_BG)
    q_row += 1
    _style_header_row(ws, q_row, 4, ["Métrica", "Valor", "Umbral", "Estado"], BRAND_LIGHT)
    q_row += 1
    quality = [
        ("Cobertura líneas — Backend",  "100%",   "≥ 60%",  "✅"),
        ("Cobertura líneas — Frontend", "100%",   "≥ 60%",  "✅"),
        ("Cobertura — AI Service",      "≥ 60%",  "≥ 60%",  "✅"),
        ("Rating Security",             "A",       "A",      "✅"),
        ("Rating Reliability",          "A",       "A",      "✅"),
        ("Rating Maintainability",      "A",       "A",      "✅"),
        ("Code Smells",                 "0",       "< 10",   "✅"),
        ("Bugs Sonar",                  "0",       "0",      "✅"),
        ("Vulnerabilities",             "0",       "0",      "✅"),
        ("Duplicación",                 "0%",      "< 3%",   "✅"),
        ("Tests automatizados",         "507",     "≥ 200",  "✅"),
        ("Escenarios k6",               "3",       "≥ 1",    "✅"),
    ]
    for j, (metric, val, thresh, status) in enumerate(quality):
        bg = _banded(j)
        for c, v in enumerate([metric, val, thresh, status], 1):
            cell = ws.cell(row=q_row, column=c, value=v)
            cell.border = _border()
            cell.fill   = bg
            cell.alignment = Alignment(horizontal="center" if c > 1 else "left", vertical="center")
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=SEM_OK if status == "✅" else SEM_ERR)
                cell.font = Font(bold=True)
        ws.row_dimensions[q_row].height = 18
        q_row += 1

    # ── Gráfico: % avance por Intent ──────────────────────────────────────────
    chart1 = BarChart()
    chart1.type    = "col"
    chart1.title   = "% Avance por Intent"
    chart1.y_axis.title = "% Avance"
    chart1.x_axis.title = "Intent"
    chart1.grouping = "clustered"
    data1 = Reference(ws, min_col=8, min_row=9, max_row=9 + len(intents))
    cats1 = Reference(ws, min_col=2, min_row=10, max_row=9 + len(intents))
    chart1.add_data(data1, titles_from_data=True)
    chart1.set_categories(cats1)
    chart1.height = 13
    chart1.width  = 20
    ws.add_chart(chart1, "J9")

    # ── Gráfico: distribución Sí/No/Parcial ──────────────────────────────────
    chart2 = PieChart()
    chart2.title = "Estado de Bolts"
    chart2.style = 10
    pie_row = tot_row + 2
    ws.cell(pie_row, 14, "Estado").font = Font(bold=True)
    ws.cell(pie_row, 15, "Cantidad").font = Font(bold=True)
    ws.cell(pie_row + 1, 14, "Completados"); ws.cell(pie_row + 1, 15, si)
    ws.cell(pie_row + 2, 14, "Pendientes");  ws.cell(pie_row + 2, 15, no)
    ws.cell(pie_row + 3, 14, "Parciales");   ws.cell(pie_row + 3, 15, par)
    data2 = Reference(ws, min_col=15, min_row=pie_row, max_row=pie_row + 3)
    cats2 = Reference(ws, min_col=14, min_row=pie_row + 1, max_row=pie_row + 3)
    chart2.add_data(data2, titles_from_data=True)
    chart2.set_categories(cats2)
    chart2.height = 11
    chart2.width  = 16
    ws.add_chart(chart2, "J24")

    # ── Anchos de columnas ────────────────────────────────────────────────────
    ws.column_dimensions["A"].width = 10
    ws.column_dimensions["B"].width = 10
    ws.column_dimensions["C"].width = 36
    ws.column_dimensions["D"].width = 11
    ws.column_dimensions["E"].width = 8
    ws.column_dimensions["F"].width = 8
    ws.column_dimensions["G"].width = 10
    ws.column_dimensions["H"].width = 11
    ws.column_dimensions["I"].width = 12
    ws.column_dimensions["J"].width = 14


def _merge_intent_cells(ws, col: int, start_row: int, end_row: int, bolts: list[Bolt]) -> None:
    """Fusiona celdas de Intent cuando el mismo intent_id se repite."""
    if not bolts:
        return
    run_start = start_row
    current = bolts[0].intent_id
    for i, bolt in enumerate(bolts[1:], start=1):
        r = start_row + i
        if bolt.intent_id != current:
            if r - 1 > run_start:
                ws.merge_cells(
                    start_row=run_start, start_column=col,
                    end_row=r - 1, end_column=col,
                )
                merged = ws.cell(run_start, col)
                merged.alignment = Alignment(vertical="center", wrap_text=True)
            run_start = r
            current = bolt.intent_id
    if end_row > run_start:
        ws.merge_cells(start_row=run_start, start_column=col, end_row=end_row, end_column=col)
        ws.cell(run_start, col).alignment = Alignment(vertical="center", wrap_text=True)


def _write_matriz(wb: Workbook) -> None:
    ws = wb.create_sheet("Matriz de registro")
    headers = [
        "Intent", "ID del Bolt", "Descripción del Bolt",
        "Modelo IA", "Fecha", "Dominio", "Metodología",
        "RF / RNF", "Registro", "Evidencia", "Enlace", "Observaciones",
    ]

    ws.merge_cells("A1:L1")
    ws["A1"] = f"{PROJECT['nombre']} — Matriz de registro (Bolts)"
    ws["A1"].font = Font(bold=True, size=14, color=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center")

    ws.merge_cells("A2:L2")
    ws["A2"] = (
        f"{PROJECT['autor']} · {PROJECT['institucion']} · "
        f"Metodología: TDD+BDD + CRISP-DM"
    )
    ws["A2"].font = Font(size=10, italic=True)
    ws["A2"].alignment = Alignment(horizontal="center")

    # Subsecciones estilo curso
    sub_row = 4
    ws.merge_cells(f"D{sub_row}:G{sub_row}")
    ws[f"D{sub_row}"] = "1. Identificación"
    ws[f"D{sub_row}"].font = Font(bold=True, size=9, color=ACCENT)
    ws[f"D{sub_row}"].alignment = Alignment(horizontal="center")
    ws[f"D{sub_row}"].fill = PatternFill("solid", fgColor="D6E4F0")

    ws.merge_cells(f"H{sub_row}:L{sub_row}")
    ws[f"H{sub_row}"] = "2. Registro y evidencia"
    ws[f"H{sub_row}"].font = Font(bold=True, size=9, color=ACCENT)
    ws[f"H{sub_row}"].alignment = Alignment(horizontal="center")
    ws[f"H{sub_row}"].fill = PatternFill("solid", fgColor="D6E4F0")

    header_row = 5
    _style_header_row(ws, header_row, len(headers), headers)
    data_start = header_row + 1
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, bolt in enumerate(BOLTS):
        r = data_start + i
        intent_text = f"{bolt.intent_id}\n{bolt.intent_title}"
        vals = [
            intent_text, bolt.bolt_id, bolt.description,
            bolt.model, bolt.date, bolt.domain, bolt.methodology,
            bolt.trace, bolt.status, bolt.evidence, "", bolt.notes,
        ]
        color = INTENT_COLORS.get(bolt.intent_id, "FFFFFF")
        for col, val in enumerate(vals, 1):
            cell = ws.cell(row=r, column=col, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if col == 1:
                cell.fill = PatternFill("solid", fgColor=color)
                cell.font = Font(bold=True, size=9)
            if col == 9:
                cell.fill = PatternFill("solid", fgColor=STATUS_FILL.get(bolt.status, "FFFFFF"))
                cell.alignment = Alignment(horizontal="center", vertical="center")
            if col == 11 and bolt.evidence_url:
                _hyperlink(cell, bolt.evidence_url)

        ws.row_dimensions[r].height = 36

    last_row = data_start + len(BOLTS) - 1
    _merge_intent_cells(ws, 1, data_start, last_row, BOLTS)

    widths = [22, 17, 50, 18, 11, 14, 12, 12, 10, 30, 14, 28]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

    ws.freeze_panes = f"A{data_start}"
    ws.auto_filter.ref = f"A{header_row}:L{last_row}"

    dv = DataValidation(type="list", formula1='"Sí,No,Parcial"', allow_blank=False)
    ws.add_data_validation(dv)
    dv.add(f"I{data_start}:I{last_row}")


def _write_rf_sheet(wb: Workbook) -> None:
    ws = wb.create_sheet("Requisitos funcionales")
    ws.sheet_view.showGridLines = False

    ws.merge_cells("A1:H1")
    ws["A1"] = f"REQUISITOS FUNCIONALES (RF) — {PROJECT['nombre']} v1.0"
    ws["A1"].font = Font(bold=True, size=14, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:H2")
    total_rf = sum(g.subrequisitos for g in RF_GROUPS)
    ws["A2"] = (
        f"6 módulos · {total_rf} sub-requisitos · "
        f"Detalle completo: docs/matriz-trazabilidad.md"
    )
    ws["A2"].font = Font(italic=True, size=9, color="FFFFFF")
    ws["A2"].fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 16

    headers = [
        "RF", "Módulo", "Descripción", "Feature BDD",
        "N.° sub-RF", "Estado", "Tests principales", "Intents relacionados",
    ]
    _style_header_row(ws, 4, len(headers), headers, BRAND)

    for j, g in enumerate(RF_GROUPS):
        r = 5 + j
        bg = _banded(j)
        row = [
            g.rf_id, g.nombre, g.descripcion, g.feature_bdd,
            g.subrequisitos, g.estado, g.tests_principales, g.intents,
        ]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=r, column=c, value=val)
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            cell.border = _border()
            cell.fill = bg
            if c == 1:
                cell.font = Font(bold=True, color=BRAND)
            if c == 5:
                cell.font = Font(bold=True, size=13, color=BRAND)
                cell.alignment = Alignment(horizontal="center", vertical="center")
            if c == 6:
                cell.fill = PatternFill("solid", fgColor=SEM_OK if "✅" in str(val) else SEM_WAR)
                cell.font = Font(bold=True)
                cell.alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[r].height = 28

    ws.column_dimensions["A"].width = 8
    ws.column_dimensions["B"].width = 22
    ws.column_dimensions["C"].width = 46
    ws.column_dimensions["D"].width = 36
    ws.column_dimensions["E"].width = 10
    ws.column_dimensions["F"].width = 13
    ws.column_dimensions["G"].width = 40
    ws.column_dimensions["H"].width = 22
    ws.freeze_panes = "A5"
    ws.auto_filter.ref = f"A4:H{4 + len(RF_GROUPS)}"


def _write_rnf_sheet(wb: Workbook) -> None:
    ws = wb.create_sheet("Requisitos no funcionales")
    ws.sheet_view.showGridLines = False

    ws.merge_cells("A1:E1")
    ws["A1"] = f"REQUISITOS NO FUNCIONALES (RNF) — {PROJECT['nombre']} v1.0"
    ws["A1"].font = Font(bold=True, size=14, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:E2")
    ws["A2"] = f"{len(RNF_ITEMS)} RNF · Calidad, Seguridad, Rendimiento, CI/CD · Todos verificados en SonarCloud"
    ws["A2"].font = Font(italic=True, size=9, color="FFFFFF")
    ws["A2"].fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 16

    headers = ["RNF", "Requisito", "Verificación / herramienta", "Estado", "Evidencia"]
    _style_header_row(ws, 4, len(headers), headers, BRAND)

    for j, item in enumerate(RNF_ITEMS):
        r = 5 + j
        bg = _banded(j)
        for c, val in enumerate(
            [item.rnf_id, item.requisito, item.verificacion, item.estado, item.evidencia], 1
        ):
            cell = ws.cell(row=r, column=c, value=val)
            cell.alignment = Alignment(wrap_text=True, vertical="center")
            cell.border = _border()
            cell.fill = bg
            if c == 1:
                cell.font = Font(bold=True, color=BRAND)
                cell.alignment = Alignment(horizontal="center", vertical="center")
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=SEM_OK)
                cell.font = Font(bold=True, color="375623")
                cell.alignment = Alignment(horizontal="center", vertical="center")
            if c == 5 and str(val).startswith("http"):
                _hyperlink(cell, val, "Ver enlace")
        ws.row_dimensions[r].height = 24

    ws.column_dimensions["A"].width = 8
    ws.column_dimensions["B"].width = 40
    ws.column_dimensions["C"].width = 36
    ws.column_dimensions["D"].width = 14
    ws.column_dimensions["E"].width = 44
    ws.freeze_panes = "A5"
    ws.auto_filter.ref = f"A4:E{4 + len(RNF_ITEMS)}"


def _write_metricas(wb: Workbook) -> None:
    ws = wb.create_sheet("Métricas pruebas")
    ws.sheet_view.showGridLines = False

    ws.merge_cells("A1:F1")
    ws["A1"] = f"MÉTRICAS DE PRUEBAS — {PROJECT['nombre']} v1.0"
    ws["A1"].font = Font(bold=True, size=14, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:F2")
    ws["A2"] = "TDD + BDD · 507 casos automatizados en 6 capas · SonarCloud cobertura 100 %"
    ws["A2"].font = Font(italic=True, size=9, color="FFFFFF")
    ws["A2"].fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 16

    # ── Tabla principal ────────────────────────────────────────────────────────
    _section_row(ws, 4, "  CASOS DE PRUEBA AUTOMATIZADOS", 6, SECTION_BG)
    headers = ["Capa / Contexto", "Framework", "Ubicación", "N.° Casos", "Cobertura", "Comando de ejecución"]
    _style_header_row(ws, 5, 6, headers, BRAND)

    test_data = [
        ("Backend API",      "Jest + Supertest",  "backend/tests/",                      207, "100%",    "cd backend && npm test -- --runInBand"),
        ("Seguridad API",    "Jest",              "backend/tests/security.test.js",        22, "(incluido)", "(incluido en backend)"),
        ("Servicio IA",      "pytest",            "ai-service/tests/",                    30, "≥ 60%",   "pytest tests/ -v --cov=model --cov-report=xml"),
        ("Frontend Web",     "Vitest",            "frontend/src/app/**/*.spec.ts",        107, "100%",    "cd frontend && npm run test:ci"),
        ("App Móvil",        "flutter_test",      "flutter_app/test/",                    42, "parcial", "cd flutter_app && flutter test --coverage"),
        ("E2E Web",          "Playwright",        "e2e/tests/",                           36, "E2E",     "npx playwright test --project=chromium"),
        ("BDD Gherkin",      "Cucumber.js",       "bdd/step_definitions/",                85, "API",     "cd bdd && npm test"),
        ("Rendimiento",      "Grafana k6",        "tests/k6/",                            3,  "—",       "k6 run tests/k6/load-test.js"),
    ]
    layer_colors = [SEM_INF, SEM_INF, "E4DFEC", "D9E1F2", "F8CBAD", SEM_WAR, "C6EFCE", "E7E6E6"]

    chart_labels_row  = []
    chart_values_row  = []
    for j, (capa, fw, path, n, cov, cmd) in enumerate(test_data):
        r = 6 + j
        bg = PatternFill("solid", fgColor=layer_colors[j])
        vals = [capa, fw, path, n, cov, cmd]
        for c, val in enumerate(vals, 1):
            cell = ws.cell(row=r, column=c, value=val)
            cell.border = _border()
            cell.alignment = Alignment(wrap_text=True, vertical="center",
                                       horizontal="center" if c in (4, 5) else "left")
            if c == 1:
                cell.fill = bg
                cell.font = Font(bold=True, size=10)
            if c == 4:
                cell.font = Font(bold=True, size=12, color=BRAND)
            if c == 5:
                cell.fill = PatternFill("solid", fgColor=SEM_OK if cov == "100%" else SEM_WAR if cov.startswith("≥") else SEM_INF)
        ws.row_dimensions[r].height = 22
        if isinstance(n, int):
            chart_labels_row.append(capa)
            chart_values_row.append(n)

    # Total row
    tot_row = 6 + len(test_data)
    ws.merge_cells(f"A{tot_row}:C{tot_row}")
    tc = ws.cell(tot_row, 1, "TOTAL AUTOMATIZADOS (sin duplicar k6)")
    tc.font = Font(bold=True, size=11, color="FFFFFF")
    tc.fill = PatternFill("solid", fgColor=BRAND)
    tc.alignment = Alignment(horizontal="center", vertical="center")
    tn = ws.cell(tot_row, 4, 507)
    tn.font = Font(bold=True, size=14, color="FFFFFF")
    tn.fill = PatternFill("solid", fgColor=BRAND)
    tn.alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(tot_row, 5).fill = PatternFill("solid", fgColor=SEM_OK)
    ws.cell(tot_row, 5, "100%").font = Font(bold=True, color="375623")
    ws.cell(tot_row, 5).alignment = Alignment(horizontal="center")
    for c in range(1, 7):
        ws.cell(tot_row, c).border = _border()
    ws.row_dimensions[tot_row].height = 28

    # ── Tabla SonarCloud ───────────────────────────────────────────────────────
    sq_row = tot_row + 2
    _section_row(ws, sq_row, "  CALIDAD ESTÁTICA — SONARCLOUD", 6, SECTION_BG)
    sq_row += 1
    _style_header_row(ws, sq_row, 4, ["Métrica Sonar", "Valor obtenido", "Umbral mínimo", "Estado"], BRAND_LIGHT)
    sq_row += 1
    sonar = [
        ("Security Rating",        "A",     "A",      "✅"),
        ("Reliability Rating",     "A",     "A",      "✅"),
        ("Maintainability Rating", "A",     "A",      "✅"),
        ("Coverage — Backend",     "100%",  "≥ 60%",  "✅"),
        ("Coverage — Frontend",    "100%",  "≥ 60%",  "✅"),
        ("Code Smells",            "0",     "< 10",   "✅"),
        ("Bugs",                   "0",     "0",      "✅"),
        ("Vulnerabilities",        "0",     "0",      "✅"),
        ("Duplicación",            "0%",    "< 3%",   "✅"),
        ("Lines of Code",          "~13 K", "—",      "✅"),
    ]
    for j, (met, val, thr, st) in enumerate(sonar):
        bg = _banded(j)
        for c, v in enumerate([met, val, thr, st], 1):
            cell = ws.cell(row=sq_row, column=c, value=v)
            cell.border = _border()
            cell.fill = bg
            cell.alignment = Alignment(horizontal="center" if c > 1 else "left", vertical="center")
            if c == 2:
                cell.font = Font(bold=True)
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=SEM_OK)
                cell.font = Font(bold=True, color="375623")
        ws.row_dimensions[sq_row].height = 18
        sq_row += 1

    # ── Gráfico barras tests por capa ─────────────────────────────────────────
    ws.cell(sq_row + 1, 1, "_labels"); ws.cell(sq_row + 1, 2, "_values")
    for k, (lbl, v) in enumerate(zip(chart_labels_row, chart_values_row)):
        ws.cell(sq_row + 2 + k, 1, lbl)
        ws.cell(sq_row + 2 + k, 2, v)
    chart = BarChart()
    chart.type    = "col"
    chart.title   = "Tests automatizados por capa"
    chart.y_axis.title = "N.° de casos"
    chart.grouping = "clustered"
    data_ref = Reference(ws, min_col=2, min_row=sq_row + 1, max_row=sq_row + 1 + len(chart_labels_row))
    cats_ref = Reference(ws, min_col=1, min_row=sq_row + 2, max_row=sq_row + 1 + len(chart_labels_row))
    chart.add_data(data_ref, titles_from_data=True)
    chart.set_categories(cats_ref)
    chart.height = 14
    chart.width  = 24
    ws.add_chart(chart, "G5")

    widths = [20, 16, 46, 10, 12, 56]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A6"


def _write_instrucciones(wb: Workbook) -> None:
    ws = wb.create_sheet("Instrucciones")
    ws.sheet_view.showGridLines = False

    # ── Banner ─────────────────────────────────────────────────────────────────
    ws.merge_cells("A1:D1")
    ws["A1"] = f"GUÍA DE USO — {PROJECT['nombre']} · Matriz de Registro v{PROJECT['version_matriz']}"
    ws["A1"].font = Font(bold=True, size=14, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:D2")
    ws["A2"] = f"{PROJECT['autor']} · {PROJECT['institucion']} · {PROJECT['periodo']}"
    ws["A2"].font = Font(italic=True, size=9, color="FFFFFF")
    ws["A2"].fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 16

    def _instr_section(r: int, title: str) -> None:
        _section_row(ws, r, f"  {title}", 4, SECTION_BG)

    def _instr_row(r: int, col_a: str, col_b: str, bold_a: bool = False) -> None:
        ca = ws.cell(row=r, column=1, value=col_a)
        ca.font = Font(bold=bold_a, size=10, color=BRAND if bold_a else "333333")
        ca.fill = PatternFill("solid", fgColor="F0F4FA" if bold_a else ROW_ODD)
        ca.border = _border()
        ca.alignment = Alignment(wrap_text=True, vertical="center")
        ws.merge_cells(f"B{r}:D{r}")
        cb = ws.cell(row=r, column=2, value=col_b)
        cb.font = Font(size=10, color="333333")
        cb.fill = PatternFill("solid", fgColor=ROW_EVEN)
        cb.border = _border()
        cb.alignment = Alignment(wrap_text=True, vertical="center")
        ws.row_dimensions[r].height = 18

    r = 4
    # ── Sección 1: Índice de hojas ─────────────────────────────────────────────
    _instr_section(r, "HOJAS DE ESTE DOCUMENTO (20 pestañas)"); r += 1
    hojas = [
        ("Portada",                   f"Portada institucional · Datos del autor ({PROJECT['autor']}) · Índice de hojas"),
        ("Dashboard",                 "KPIs del proyecto · Avance por Intent con semáforos 🟢🟡🔴 · Gráficos de barras y torta"),
        ("Matriz de registro",        f"Tabla principal de bolts ({len(BOLTS)} bolts) con estado, evidencia e hipervínculos a GitHub"),
        ("Requisitos funcionales",    "6 grupos RF-01→RF-06 · 60 sub-requisitos · Feature BDD y tests asociados"),
        ("Requisitos no funcionales", "10 RNF con verificación, herramienta y evidencia"),
        ("Métricas pruebas",          "507 casos automatizados en 6 capas · Tabla SonarCloud · Gráfico por capa"),
        ("Resumen Intents",           "Vista compacta de los 8 Intents con semáforo y gráfico de barras horizontal"),
        ("Trazabilidad",              "60 RF + 10 RNF → Escenario Gherkin → Test ID → Tipo → Estado (✅/⚠️)"),
        ("PROCESOS",                  "15 procesos BPMN clasificados: Misional / Estratégico / Apoyo · Estado y versión"),
        ("ACTIVIDADES_BPMN",          "24 actividades BPMN vinculadas a bolts, procesos y módulos del sistema"),
        ("FLUJO_BPMN",                "19 nodos del flujo de autenticación JWT modelado (registro→login→refresh→logout)"),
        ("REQUERIMIENTOS",            "82 requisitos individuales (60 RF + 10 RNF) con prioridad, PMV y estado"),
        ("CONTROL_VERSIONES",         f"{len(BOLTS)} registros de bolts: commit, agente, confianza, revisión humana y observaciones"),
        ("AI_DLC",                    "Ciclo de vida simplificado por bolt: Diseño → Desarrollo → QA → Producción"),
        ("DEPENDENCIAS",              f"{len(DEPENDENCIAS)} dependencias técnicas y funcionales entre bolts e intents con tipo e impacto"),
        ("MERGES",                    f"{len(COMMITS)} commits a main con fecha, hash y enlace a GitHub"),
        ("HISTORIAL",                 f"Log cronológico de {len(COMMITS)} cambios del proyecto"),
        ("ARTEFACTOS",                f"{len(ARTEFACTOS)} artefactos clave del proyecto: rutas, versiones y propósito"),
        ("PMV",                       f"{len(PMV_ITEMS)} componentes del Producto Mínimo Viable (todos completados ✅)"),
        ("RIESGOS",                   "Matriz de riesgos del proyecto: probabilidad × impacto · Semáforo y plan de mitigación"),
    ]
    for col_a, col_b in hojas:
        _instr_row(r, col_a, col_b, bold_a=True); r += 1

    # ── Sección 2: Comandos para regenerar ────────────────────────────────────
    r += 1
    _instr_section(r, "REGENERAR EL DOCUMENTO"); r += 1
    comandos = [
        ("Regenerar Excel completo",    "python scripts/generar-matriz-registro.py"),
        ("Ejecutar tests backend",       "cd backend && npm test -- --runInBand"),
        ("Ejecutar tests AI service",    "cd ai-service && pytest tests/ -v --cov=model --cov-report=xml"),
        ("Ejecutar tests frontend",      "cd frontend && npm run test:ci"),
        ("Ejecutar tests Flutter",       "cd flutter_app && flutter test --coverage"),
        ("Ejecutar tests E2E",           "npx playwright test --project=chromium"),
        ("Ejecutar carga k6",            "k6 run tests/k6/load-test.js"),
        ("Ver todos los tests",          "cd backend && npm test && cd ../ai-service && pytest && cd ../frontend && npm run test:ci"),
    ]
    for col_a, col_b in comandos:
        _instr_row(r, col_a, col_b); r += 1

    # ── Sección 3: Personalización ────────────────────────────────────────────
    r += 1
    _instr_section(r, "PERSONALIZAR ESTE DOCUMENTO"); r += 1
    personalizacion = [
        ("Datos del autor/asesor",  "Editar PROJECT{} al inicio de scripts/generar-matriz-registro.py"),
        ("Nuevos commits",          "Agregar entradas a la lista COMMITS[] con formato (fecha, hash, mensaje)"),
        ("Nuevos bolts",            "Agregar Bolt() a la lista BOLTS[] con todos los campos requeridos"),
        ("Nuevos requisitos",       "Agregar ReqItem() a REQS[] o RnfItem() a RNF_ITEMS[]"),
        ("Nuevos artefactos",       "Agregar Artefacto() a ARTEFACTOS[] con ruta, versión y propósito"),
    ]
    for col_a, col_b in personalizacion:
        _instr_row(r, col_a, col_b); r += 1

    # ── Sección 4: Equivalencias metodológicas ────────────────────────────────
    r += 1
    _instr_section(r, "EQUIVALENCIAS METODOLÓGICAS (contexto del curso)"); r += 1
    equiv = [
        ("RSpec / FactoryBot",  "→  Jest + Supertest (backend) · Vitest (frontend) · pytest (IA) · flutter_test (móvil)"),
        ("Brakeman",            "→  SonarCloud + security.test.js (22 casos de seguridad)"),
        ("Bundler Audit",       "→  npm audit (revisión manual de dependencias)"),
        ("Cucumber",            "→  docs/features/*.feature (6 archivos Gherkin; CI pendiente con Cucumber-JS)"),
        ("Rails API",           "→  Node.js 20 + Express 5 + Mongoose 9"),
        ("ActiveRecord",        "→  Mongoose 9 + MongoDB Atlas M0 (NoSQL, cloud AWS São Paulo)"),
        ("Devise (auth)",       "→  JWT HS256 access 15min + refresh 7d con rotación SHA-256 + bcrypt salt=12"),
    ]
    for col_a, col_b in equiv:
        _instr_row(r, col_a, col_b); r += 1

    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 82
    ws.column_dimensions["C"].width = 4
    ws.column_dimensions["D"].width = 4


def _write_resumen_intent(wb: Workbook) -> None:
    ws = wb.create_sheet("Resumen Intents")
    ws.sheet_view.showGridLines = False

    ws.merge_cells("A1:J1")
    ws["A1"] = f"RESUMEN POR INTENT — {PROJECT['nombre']} v1.0"
    ws["A1"].font = Font(bold=True, size=14, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:J2")
    ws["A2"] = "Avance ponderado: Sí=100% · Parcial=50% · No=0%"
    ws["A2"].font = Font(italic=True, size=9, color="FFFFFF")
    ws["A2"].fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 16

    # Totals per intent
    intents: dict[str, dict] = {}
    for b in BOLTS:
        if b.intent_id not in intents:
            intents[b.intent_id] = {
                "title": b.intent_title, "domain": b.domain,
                "t": 0, "Sí": 0, "No": 0, "Parcial": 0,
            }
        intents[b.intent_id]["t"] += 1
        intents[b.intent_id][b.status] += 1

    headers = ["Semáforo", "Intent ID", "Título del Intent", "Dominio",
               "Total Bolts", "✅ Completados", "❌ Pendientes", "⚠️ Parciales",
               "% Avance", "Estado Global"]
    _style_header_row(ws, 4, 10, headers, BRAND)

    data_row = 5
    for j, iid in enumerate(sorted(intents.keys())):
        d   = intents[iid]
        pct = round((d["Sí"] + 0.5 * d["Parcial"]) / d["t"] * 100, 1)
        sem = "🟢" if pct >= 90 else "🟡" if pct >= 70 else "🔴"
        estado = "Completado" if pct == 100 else "En progreso" if pct >= 70 else "Pendiente"
        bg = _banded(j)
        vals = [sem, iid, d["title"], d["domain"], d["t"], d["Sí"], d["No"], d["Parcial"], pct / 100, estado]
        for c, val in enumerate(vals, 1):
            cell = ws.cell(row=data_row, column=c, value=val)
            cell.border = _border()
            cell.fill = bg
            cell.alignment = Alignment(
                horizontal="center" if c in (1, 2, 5, 6, 7, 8, 9) else "left",
                vertical="center",
            )
            if c == 9:
                cell.number_format = "0.0%"
                cell.fill = PatternFill("solid", fgColor=SEM_OK if pct >= 90 else SEM_WAR if pct >= 70 else SEM_ERR)
                cell.font = Font(bold=True)
            if c == 10:
                cell.fill = PatternFill("solid", fgColor=SEM_OK if estado == "Completado" else SEM_WAR if estado == "En progreso" else SEM_ERR)
        ws.row_dimensions[data_row].height = 22
        data_row += 1

    # Totals row
    total  = len(BOLTS)
    si     = sum(1 for b in BOLTS if b.status == "Sí")
    no     = sum(1 for b in BOLTS if b.status == "No")
    par    = sum(1 for b in BOLTS if b.status == "Parcial")
    g_pct  = round((si + 0.5 * par) / total * 100, 1)
    ws.cell(data_row, 1, "—")
    ws.cell(data_row, 2, "TOTAL").font = Font(bold=True, color=BRAND)
    ws.cell(data_row, 5, total).font = Font(bold=True)
    ws.cell(data_row, 6, si).font    = Font(bold=True, color="375623")
    ws.cell(data_row, 7, no).font    = Font(bold=True, color="9C0006")
    ws.cell(data_row, 8, par).font   = Font(bold=True, color="7D5700")
    pct_cell = ws.cell(data_row, 9, g_pct / 100)
    pct_cell.number_format = "0.0%"
    pct_cell.font = Font(bold=True)
    pct_cell.fill = PatternFill("solid", fgColor=SEM_OK)
    for c in range(1, 11):
        ws.cell(data_row, c).border = _border()
    ws.row_dimensions[data_row].height = 24

    # Gráfico barras horizontales
    chart = BarChart()
    chart.type    = "bar"
    chart.title   = "Bolts completados vs pendientes por Intent"
    chart.y_axis.title = "Intent"
    chart.x_axis.title = "Bolts"
    chart.grouping = "clustered"
    d_si  = Reference(ws, min_col=6, min_row=4, max_row=4 + len(intents))
    d_no  = Reference(ws, min_col=7, min_row=4, max_row=4 + len(intents))
    d_par = Reference(ws, min_col=8, min_row=4, max_row=4 + len(intents))
    cats  = Reference(ws, min_col=2, min_row=5, max_row=4 + len(intents))
    chart.add_data(d_si,  titles_from_data=True)
    chart.add_data(d_no,  titles_from_data=True)
    chart.add_data(d_par, titles_from_data=True)
    chart.set_categories(cats)
    chart.height = 14
    chart.width  = 22
    ws.add_chart(chart, f"A{data_row + 3}")

    widths = [10, 11, 36, 14, 11, 14, 13, 11, 11, 14]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A5"
    ws.auto_filter.ref = f"A4:J{data_row - 1}"


def _write_procesos(wb: Workbook) -> None:
    ws = wb.create_sheet("PROCESOS")
    ws["A1"] = "PROCESOS — HearGuard AI v1.0"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:H1")

    headers = ["ID_PROCESO", "TIPO_PROCESO", "NOMBRE_PROCESO", "RAMA_GIT",
               "RESPONSABLE", "ESTADO", "VERSION_ACTUAL", "OBSERVACIONES"]
    _style_header_row(ws, 3, len(headers), headers)

    estado_color = {"Completado": "C6EFCE", "Parcial": "FFEB9C", "Pendiente": "FFC7CE"}
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, p in enumerate(PROCESOS, 4):
        tipo_color = {"Misional": "DDEBF7", "Estratégico": "E2EFDA", "Apoyo": "FFF2CC"}.get(p.tipo_proceso, "FFFFFF")
        row = [p.id_proceso, p.tipo_proceso, p.nombre_proceso, p.rama_git,
               p.responsable, p.estado, p.version_actual, p.observaciones]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 2:
                cell.fill = PatternFill("solid", fgColor=tipo_color)
            if c == 6:
                cell.fill = PatternFill("solid", fgColor=estado_color.get(p.estado, "FFFFFF"))

    ws.column_dimensions["A"].width = 10
    ws.column_dimensions["B"].width = 14
    ws.column_dimensions["C"].width = 38
    ws.column_dimensions["D"].width = 10
    ws.column_dimensions["E"].width = 22
    ws.column_dimensions["F"].width = 13
    ws.column_dimensions["G"].width = 14
    ws.column_dimensions["H"].width = 55
    ws.freeze_panes = "A4"
    ws.auto_filter.ref = "A3:H3"


def _write_actividades_bpmn(wb: Workbook) -> None:
    ws = wb.create_sheet("ACTIVIDADES_BPMN")
    ws["A1"] = "ACTIVIDADES BPMN — HearGuard AI"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:G1")

    headers = ["ID_BOLT", "ID_PROCESO", "ACTIVIDAD_BPMN", "ROL_RESPONSABLE",
               "TIPO_ACTIVIDAD", "DESCRIPCION", "MODULO_AFECTADO"]
    _style_header_row(ws, 3, len(headers), headers)

    actividades = [
        ("INT-001-BOLT-001", "P-007", "Configurar Jest + Supertest",         "Developer",      "Tarea de Servicio", "Setup framework testing backend con coverage lcov",          "backend"),
        ("INT-001-BOLT-002", "P-007", "Crear suite de integracion",          "QA Engineer",    "Tarea de Servicio", "207 tests: auth, noise, evaluation, device, middleware",     "backend/tests"),
        ("INT-001-BOLT-003", "P-007", "Crear suite de seguridad",            "QA Engineer",    "Tarea de Servicio", "22 casos: JWT, IDOR, NoSQL, rutas protegidas",              "backend/tests/security.test.js"),
        ("INT-001-BOLT-004", "P-007", "Configurar pytest AI service",        "Data Scientist", "Tarea de Servicio", "30 tests: test_api, test_predictor, test_features",         "ai-service/tests"),
        ("INT-001-BOLT-005", "P-007", "Configurar Vitest Angular",           "Frontend Dev",   "Tarea de Servicio", "107 tests: servicios, guards, interceptors, componentes",   "frontend/src"),
        ("INT-001-BOLT-006", "P-007", "Configurar flutter_test",             "Mobile Dev",     "Tarea de Servicio", "42 tests: hearing_mapper, user_model, api_response",        "flutter_app/test"),
        ("INT-001-BOLT-007", "P-007", "Configurar Playwright E2E",           "QA Engineer",    "Tarea de Servicio", "36 tests: smoke, auth, hearing-test",                       "e2e/tests"),
        ("INT-001-BOLT-008", "P-007", "Redactar plan de pruebas IEEE 829",   "QA Lead",        "Tarea de Usuario",  "1169 lineas, plan completo con casos y estrategia",         "docs/plan-de-pruebas.md"),
        ("INT-002-BOLT-001", "P-008", "Crear archivos .feature Gherkin",     "QA Lead",        "Tarea de Usuario",  "6 features: auth, ruido, auditiva, IA, IoT, resultados",    "docs/features"),
        ("INT-002-BOLT-002", "P-008", "Redactar matriz de trazabilidad",     "QA Lead",        "Tarea de Usuario",  "60 RF + 10 RNF -> BDD -> Test -> Estado",                   "docs/matriz-trazabilidad.md"),
        ("INT-003-BOLT-001", "P-009", "Configurar GitHub Actions CI",        "DevOps",         "Tarea de Servicio", "10 jobs: backend, ai, frontend, bdd, e2e, flutter, sonar, k6-smoke, lighthouse, deploy","github/workflows/ci.yml"),
        ("INT-003-BOLT-002", "P-009", "Fix rutas cobertura SonarCloud",      "DevOps",         "Tarea de Servicio", "Script fix-sonar-coverage-paths.js para mapeo lcov",        "scripts"),
        ("INT-003-BOLT-003", "P-009", "Configurar deploy.yml",               "DevOps",         "Tarea de Servicio", "Render webhooks + Vercel deploy + GHCR images",             ".github/workflows/deploy.yml"),
        ("INT-004-BOLT-001", "P-010", "Configurar sonar-project.properties", "DevOps",         "Tarea de Servicio", "Multi-lenguaje JS/TS/Python, exclusiones, coverage paths",  "sonar-project.properties"),
        ("INT-004-BOLT-002", "P-010", "Alcanzar Rating A en SonarCloud",     "Developer",      "Tarea de Servicio", "Security/Reliability/Maintainability = A, 0 issues",        "todo el repo"),
        ("INT-004-BOLT-004", "P-010", "Alcanzar 100% cobertura SonarCloud",  "QA Engineer",    "Tarea de Servicio", "Cobertura 100%, duplicacion 0%",                            "backend + frontend"),
        ("INT-005-BOLT-001", "P-011", "Cerrar S5147 NoSQL injection",        "Developer",      "Tarea de Servicio", "Sanitizar deviceId + $eq operators en Device/Noise",        "backend/src/controllers"),
        ("INT-005-BOLT-002", "P-011", "Cerrar S2068 hard-coded password",    "Developer",      "Tarea de Servicio", "Sustituir Math.random por crypto.randomBytes E2E",          "e2e/tests/helpers.ts"),
        ("INT-006-BOLT-001", "P-012", "Definir features CRISP-DM",           "Data Scientist", "Tarea de Usuario",  "8 features: edad, exposicion, auriculares, ocupacion...",   "ai-service/model/features.py"),
        ("INT-006-BOLT-003", "P-012", "Entrenar Random Forest",              "Data Scientist", "Tarea de Servicio", "SEED=42, score 0-100, R2>=0.80",                            "ai-service/model/trainer.py"),
        ("INT-006-BOLT-005", "P-012", "Deploy Flask en Render",              "DevOps",         "Tarea de Servicio", "app.py + ai.service.js integracion con backend",            "ai-service/app.py"),
        ("INT-007-BOLT-001", "P-013", "Crear script k6",                     "QA Engineer",    "Tarea de Servicio", "smoke + load + spike, thresholds p95/error configurados",   "tests/k6/load-test.js"),
        ("INT-008-BOLT-001", "P-014", "Redactar articulo tecnico",           "Investigador",   "Tarea de Usuario",  "articulo.md + README.md + api-spec.yml completos",          "docs"),
        ("INT-008-BOLT-004", "P-015", "Configurar Docker Compose",           "DevOps",         "Tarea de Servicio", "4 servicios: mongodb, ai-service, backend, frontend",       "docker-compose.yml"),
    ]

    wrap = Alignment(wrap_text=True, vertical="top")
    for i, act in enumerate(actividades, 4):
        tipo_color = {"Tarea de Servicio": "DDEBF7", "Tarea de Usuario": "E2EFDA", "Gateway": "FFF2CC"}.get(act[4], "FFFFFF")
        for c, val in enumerate(act, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 5:
                cell.fill = PatternFill("solid", fgColor=tipo_color)

    widths = [20, 10, 36, 16, 18, 52, 28]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A4"
    ws.auto_filter.ref = "A3:G3"


def _write_flujo_bpmn(wb: Workbook) -> None:
    ws = wb.create_sheet("FLUJO_BPMN")
    ws["A1"] = "FLUJO BPMN — Proceso P-001: Autenticacion y Gestion de Sesion"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:G1")
    ws["A2"] = "Ejemplo modelado del flujo principal de autenticacion JWT (register -> login -> uso -> refresh -> logout)"
    ws["A2"].font = Font(italic=True, size=10)
    ws.merge_cells("A2:G2")

    headers = ["ID_NODO", "ID_PROCESO", "TIPO_NODO", "NOMBRE", "NODO_ORIGEN", "NODO_DESTINO", "CONDICION"]
    _style_header_row(ws, 4, len(headers), headers)

    nodos = [
        ("N-001", "P-001", "Evento Inicio",   "Inicio del proceso de autenticacion",         "—",     "N-002", "—"),
        ("N-002", "P-001", "Actividad",        "Usuario envia datos de registro",             "N-001", "N-003", "—"),
        ("N-003", "P-001", "Actividad",        "Validar datos (express-validator)",           "N-002", "N-004", "—"),
        ("N-004", "P-001", "Gateway Exclusivo","Datos validos?",                              "N-003", "N-005", "Si -> N-005 / No -> N-010"),
        ("N-005", "P-001", "Actividad",        "Verificar email no duplicado en MongoDB",     "N-004", "N-006", "Datos validos"),
        ("N-006", "P-001", "Gateway Exclusivo","Email disponible?",                           "N-005", "N-007", "Si -> N-007 / No -> N-011"),
        ("N-007", "P-001", "Actividad",        "Hashear password con bcrypt salt=12",         "N-006", "N-008", "Email disponible"),
        ("N-008", "P-001", "Actividad",        "Guardar usuario en MongoDB",                  "N-007", "N-009", "—"),
        ("N-009", "P-001", "Actividad",        "Generar accessToken (15min) + refreshToken (7d)", "N-008", "N-012", "—"),
        ("N-010", "P-001", "Evento Intermedio","Retornar 400 datos invalidos",                "N-004", "N-018", "Datos invalidos"),
        ("N-011", "P-001", "Evento Intermedio","Retornar 409 email duplicado",                "N-006", "N-018", "Email duplicado"),
        ("N-012", "P-001", "Actividad",        "Cliente guarda tokens (localStorage)",        "N-009", "N-013", "—"),
        ("N-013", "P-001", "Actividad",        "Cliente realiza peticion autenticada",        "N-012", "N-014", "—"),
        ("N-014", "P-001", "Actividad",        "Middleware valida JWT (HS256)",                "N-013", "N-015", "—"),
        ("N-015", "P-001", "Gateway Exclusivo","Token valido?",                               "N-014", "N-016", "Si -> N-016 / No -> N-017"),
        ("N-016", "P-001", "Actividad",        "Ejecutar logica de negocio",                  "N-015", "N-018", "Token valido"),
        ("N-017", "P-001", "Actividad",        "POST /api/auth/refresh con refreshToken",     "N-015", "N-009", "Token expirado"),
        ("N-018", "P-001", "Actividad",        "POST /api/auth/logout (invalida refresh en BD)", "N-016", "N-019", "—"),
        ("N-019", "P-001", "Evento Fin",       "Fin del proceso de autenticacion",            "N-018", "—",     "—"),
    ]

    tipo_color = {
        "Evento Inicio": "C6EFCE", "Evento Fin": "FFC7CE",
        "Evento Intermedio": "FFEB9C", "Gateway Exclusivo": "FCE4D6",
        "Actividad": "DDEBF7",
    }
    wrap = Alignment(wrap_text=True, vertical="top")
    for i, nodo in enumerate(nodos, 5):
        for c, val in enumerate(nodo, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 3:
                cell.fill = PatternFill("solid", fgColor=tipo_color.get(nodo[2], "FFFFFF"))

    widths = [8, 10, 20, 48, 10, 12, 32]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A5"


def _write_requerimientos(wb: Workbook) -> None:
    ws = wb.create_sheet("REQUERIMIENTOS")
    ws["A1"] = "REQUERIMIENTOS — 60 RF + 10 RNF — HearGuard AI v1.0"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:G1")

    headers = ["ID_REQUERIMIENTO", "TIPO (RF/RNF)", "DESCRIPCION", "PRIORIDAD", "PMV", "ESTADO", "ID_BOLT_RELACIONADO"]
    _style_header_row(ws, 3, len(headers), headers)

    estado_color = {"Completo": "C6EFCE", "Parcial": "FFEB9C", "Pendiente": "FFC7CE",
                    "Configurado": "DDEBF7", "Cumplido": "C6EFCE"}
    prioridad_color = {"Alta": "FFC7CE", "Media": "FFEB9C", "Baja": "C6EFCE"}
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, req in enumerate(REQS, 4):
        row = [req.req_id, req.tipo, req.descripcion, req.prioridad, req.pmv, req.estado, req.bolt_relacionado]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=prioridad_color.get(req.prioridad, "FFFFFF"))
            if c == 6:
                cell.fill = PatternFill("solid", fgColor=estado_color.get(req.estado, "FFFFFF"))
            if c == 2 and req.tipo == "RNF":
                cell.fill = PatternFill("solid", fgColor="FCE4D6")

    widths = [13, 12, 62, 10, 9, 12, 22]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A4"
    ws.auto_filter.ref = "A3:G3"


def _write_control_versiones(wb: Workbook) -> None:
    ws = wb.create_sheet("CONTROL_VERSIONES")
    ws["A1"] = "CONTROL DE VERSIONES — Registro de Bolts y Cambios — HearGuard AI"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:P1")

    headers = [
        "ID_REGISTRO", "ID_BOLT", "BOLT_PADRE", "VERSION", "TIPO_CAMBIO",
        "ESTADO_BOLT", "ESTADO_INTEGRACION", "FECHA", "RESPONSABLE",
        "AGENTE_RESPONSABLE", "COMMIT", "PULL_REQUEST", "FUENTE",
        "CONFIANZA", "REQUIERE_REVISION_HUMANA", "OBSERVACIONES",
    ]
    _style_header_row(ws, 3, len(headers), headers)

    estado_bolt_color = {"Sí": "C6EFCE", "No": "FFC7CE", "Parcial": "FFEB9C"}
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, bolt in enumerate(BOLTS, 4):
        reg_id = f"REG-{i - 3:03d}"
        tipo = "feat" if bolt.methodology in ("TDD", "BDD") else "ci" if bolt.domain == "CI/CD" else "docs"
        fuente = "Claude Sonnet" if bolt.model == "Claude Sonnet" else "Manual"
        confianza = "Alta" if bolt.status == "Sí" else "Media" if bolt.status == "Parcial" else "Baja"
        rev_humana = "No" if bolt.status == "Sí" else "Sí"
        commit_val = bolt.evidence if bolt.evidence.startswith("Commit") else "—"
        row = [
            reg_id, bolt.bolt_id, bolt.intent_id, "1.0", tipo,
            bolt.status, "Integrado" if bolt.status == "Sí" else "Pendiente",
            bolt.date, "Luis F. Terreros H.", bolt.model,
            commit_val, "—", fuente, confianza, rev_humana, bolt.notes or bolt.evidence,
        ]
        color = INTENT_COLORS.get(bolt.intent_id, "FFFFFF")
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 2:
                cell.fill = PatternFill("solid", fgColor=color)
            if c == 6:
                cell.fill = PatternFill("solid", fgColor=estado_bolt_color.get(bolt.status, "FFFFFF"))
            if c == 11 and bolt.evidence_url:
                _hyperlink(cell, bolt.evidence_url, commit_val)

    widths = [11, 22, 11, 8, 10, 9, 14, 11, 22, 18, 16, 12, 16, 10, 20, 38]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A4"
    ws.auto_filter.ref = "A3:P3"


def _write_ai_dlc(wb: Workbook) -> None:
    ws = wb.create_sheet("AI_DLC")
    ws["A1"] = "AI DLC — Ciclo de Vida simplificado por Bolt — HearGuard AI"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:I1")
    ws["A2"] = "DLC = Define, Learn, Create. Muestra en que fase del ciclo esta cada bolt."
    ws["A2"].font = Font(italic=True, size=10)
    ws.merge_cells("A2:I2")

    headers = ["ID_BOLT", "INTENT", "REQUERIMIENTO", "DISENO", "DESARROLLO", "QA", "PRODUCCION", "RESULTADO", "ULTIMA_ACTUALIZACION"]
    _style_header_row(ws, 4, len(headers), headers)

    fase_si = PatternFill("solid", fgColor="C6EFCE")
    fase_no = PatternFill("solid", fgColor="FFC7CE")
    fase_par = PatternFill("solid", fgColor="FFEB9C")
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, bolt in enumerate(BOLTS, 5):
        diseno = "Sí" if bolt.methodology in ("TDD", "BDD", "CRISP-DM") else "N/A"
        desarrollo = "Sí" if bolt.status in ("Sí", "Parcial") else "No"
        qa = "Sí" if bolt.status == "Sí" else "Parcial" if bolt.status == "Parcial" else "No"
        prod = "Sí" if bolt.status == "Sí" and bolt.date != "—" else "No"
        row = [bolt.bolt_id, bolt.intent_id, bolt.trace or bolt.description[:60],
               diseno, desarrollo, qa, prod, bolt.status, bolt.date]
        color = INTENT_COLORS.get(bolt.intent_id, "FFFFFF")
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 2:
                cell.fill = PatternFill("solid", fgColor=color)
            if c in (4, 5, 6, 7):
                cell.fill = fase_si if val == "Sí" else fase_par if val in ("Parcial", "N/A") else fase_no
                cell.alignment = Alignment(horizontal="center", vertical="center")

    widths = [22, 10, 52, 9, 12, 9, 11, 10, 14]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A5"
    ws.auto_filter.ref = "A4:I4"


def _write_dependencias(wb: Workbook) -> None:
    ws = wb.create_sheet("DEPENDENCIAS")
    ws["A1"] = "DEPENDENCIAS entre Bolts / Intents — HearGuard AI"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:E1")

    headers = ["ID_BOLT", "DEPENDE_DE", "TIPO_DEPENDENCIA", "IMPACTO", "OBSERVACION"]
    _style_header_row(ws, 3, len(headers), headers)

    impacto_color = {"Alto": "FFC7CE", "Medio": "FFEB9C", "Bajo": "C6EFCE"}
    tipo_color = {"Técnica": "DDEBF7", "Funcional": "E2EFDA", "Datos": "FFF2CC"}
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, dep in enumerate(DEPENDENCIAS, 4):
        row = [dep.id_bolt, dep.depende_de, dep.tipo_dependencia, dep.impacto, dep.observacion]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 3:
                cell.fill = PatternFill("solid", fgColor=tipo_color.get(dep.tipo_dependencia, "FFFFFF"))
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=impacto_color.get(dep.impacto, "FFFFFF"))

    widths = [22, 22, 16, 10, 62]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A4"


def _write_merges(wb: Workbook) -> None:
    ws = wb.create_sheet("MERGES")
    ws["A1"] = "MERGES — Historial de commits a main — HearGuard AI"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:H1")

    headers = ["MERGE_ID", "TIPO_MERGE", "RAMA_ORIGEN", "RAMA_DESTINO", "FECHA", "RESPONSABLE", "ESTADO", "OBSERVACION"]
    _style_header_row(ws, 3, len(headers), headers)

    tipo_color = {
        "test": "DDEBF7", "fix": "FFEB9C", "refactor": "E7E6E6",
        "ci": "FFF2CC", "docs": "FCE4D6", "chore": "F8CBAD", "feat": "C6EFCE",
    }
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, (fecha, commit, tipo, desc, agente, responsable) in enumerate(COMMITS, 4):
        merge_id = f"MRG-{i - 3:03d}"
        row = [merge_id, tipo, "feature/fix", "main", fecha, responsable, "Integrado", f"[{commit}] {desc}"]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 2:
                cell.fill = PatternFill("solid", fgColor=tipo_color.get(tipo, "FFFFFF"))
            if c == 7:
                cell.fill = PatternFill("solid", fgColor="C6EFCE")

        commit_cell = ws.cell(row=i, column=8)
        url = f"{REPO_COMMIT}/{commit}"
        _hyperlink(commit_cell, url, f"[{commit}] {desc[:60]}")

    widths = [10, 10, 14, 10, 12, 22, 11, 60]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A4"
    ws.auto_filter.ref = "A3:H3"


def _write_historial(wb: Workbook) -> None:
    ws = wb.create_sheet("HISTORIAL")
    ws["A1"] = "HISTORIAL — Log cronologico de cambios — HearGuard AI"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:G1")

    headers = ["FECHA", "ID_BOLT", "VERSION", "EVENTO", "DESCRIPCION_CAMBIO", "AGENTE", "RESPONSABLE"]
    _style_header_row(ws, 3, len(headers), headers)

    evento_color = {
        "test": "DDEBF7", "fix": "FFEB9C", "refactor": "E7E6E6",
        "ci": "FFF2CC", "docs": "FCE4D6", "chore": "F8CBAD", "feat": "C6EFCE",
    }
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, (fecha, commit, tipo, desc, agente, responsable) in enumerate(COMMITS, 4):
        bolt_ref = f"commit:{commit}"
        row = [fecha, bolt_ref, "1.0", tipo.upper(), desc, agente, responsable]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=evento_color.get(tipo, "FFFFFF"))

        commit_cell = ws.cell(row=i, column=2)
        _hyperlink(commit_cell, f"{REPO_COMMIT}/{commit}", f"commit:{commit}")

    widths = [12, 16, 9, 11, 68, 18, 22]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A4"
    ws.auto_filter.ref = "A3:G3"


def _write_artefactos(wb: Workbook) -> None:
    ws = wb.create_sheet("ARTEFACTOS")
    ws["A1"] = "ARTEFACTOS — Inventario de archivos clave — HearGuard AI v1.0"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:G1")

    headers = ["ID_ARTEFACTO", "TIPO_ARTEFACTO", "ID_BOLT", "NOMBRE", "RUTA_URL", "VERSION", "OBSERVACION"]
    _style_header_row(ws, 3, len(headers), headers)

    tipo_color = {
        "Modelo IA": "E4DFEC", "API Spec": "DDEBF7", "Cobertura": "E2EFDA",
        "CI/CD": "FFF2CC", "Infraestructura": "FCE4D6", "Documentacion": "FCE4D6",
        "Plan pruebas": "FFEB9C", "Trazabilidad": "C6EFCE", "Calidad": "E7E6E6",
        "Seguridad": "FFC7CE", "Rendimiento": "D9E1F2", "Firmware IoT": "F8CBAD",
        "Matriz": "DDEBF7", "IoT Bridge": "F8CBAD", "Config deploy": "FFF2CC",
    }
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, art in enumerate(ARTEFACTOS, 4):
        row = [art.id_artefacto, art.tipo_artefacto, art.id_bolt, art.nombre, art.ruta_url, art.version, art.observacion]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 2:
                cell.fill = PatternFill("solid", fgColor=tipo_color.get(art.tipo_artefacto, "FFFFFF"))
            if c == 5 and str(val).startswith("http"):
                _hyperlink(cell, val, "Ver enlace")

    widths = [12, 16, 22, 32, 52, 9, 42]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A4"
    ws.auto_filter.ref = "A3:G3"


def _write_pmv(wb: Workbook) -> None:
    ws = wb.create_sheet("PMV")
    ws["A1"] = "PMV — Producto Minimo Viable — HearGuard AI v1.0"
    ws["A1"].font = Font(bold=True, size=13, color=BRAND)
    ws.merge_cells("A1:F1")
    ws["A2"] = "Bolts que conforman el MVP del sistema. Todos completados para v1.0."
    ws["A2"].font = Font(italic=True, size=10)
    ws.merge_cells("A2:F2")

    headers = ["ID_PMV", "NOMBRE_PMV", "ID_BOLT", "MODULO", "ESTADO", "OBSERVACION"]
    _style_header_row(ws, 4, len(headers), headers)

    modulo_color = {
        "Backend": "E2EFDA", "AI Service": "E4DFEC", "Frontend": "DDEBF7",
        "Movil": "D9E1F2", "IoT": "F8CBAD", "DevOps": "FFF2CC",
        "Calidad": "C6EFCE", "Deploy": "FCE4D6",
    }
    wrap = Alignment(wrap_text=True, vertical="top")

    for i, pmv in enumerate(PMV_ITEMS, 5):
        row = [pmv.id_pmv, pmv.nombre_pmv, pmv.id_bolt, pmv.modulo, pmv.estado, pmv.observacion]
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=i, column=c, value=val)
            cell.alignment = wrap
            cell.border = _border()
            if c == 4:
                cell.fill = PatternFill("solid", fgColor=modulo_color.get(pmv.modulo, "FFFFFF"))
            if c == 5:
                cell.fill = PatternFill("solid", fgColor="C6EFCE" if val == "Completo" else "FFEB9C")

    ws["A15"] = "Total MVP items:"
    ws["A15"].font = Font(bold=True)
    ws["B15"] = len(PMV_ITEMS)
    ws["C15"] = f"Completados: {sum(1 for p in PMV_ITEMS if p.estado == 'Completo')}/{len(PMV_ITEMS)}"
    ws["C15"].font = Font(bold=True, color="375623")

    widths = [9, 28, 22, 12, 12, 62]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A5"


def _write_riesgos(wb: Workbook) -> None:
    ws = wb.create_sheet("RIESGOS")
    ws.sheet_view.showGridLines = False

    ws.merge_cells("A1:I1")
    ws["A1"] = f"MATRIZ DE RIESGOS — {PROJECT['nombre']} v1.0"
    ws["A1"].font = Font(bold=True, size=14, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:I2")
    ws["A2"] = "Probabilidad (1=Muy baja → 5=Muy alta) × Impacto (1=Mínimo → 5=Crítico) · Nivel = P × I"
    ws["A2"].font = Font(italic=True, size=9, color="FFFFFF")
    ws["A2"].fill = PatternFill("solid", fgColor=BRAND_LIGHT)
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 16

    # ── Leyenda semáforo ──────────────────────────────────────────────────────
    _section_row(ws, 4, "  LEYENDA DE NIVELES", 9, SECTION_BG)
    leyenda = [("Bajo (1–4)", SEM_OK, "375623"), ("Medio (5–9)", SEM_WAR, "7D5700"),
               ("Alto (10–14)", "F8CBAD", "843C0C"), ("Crítico (15–25)", SEM_ERR, "9C0006")]
    for k, (lbl, bg, fg) in enumerate(leyenda):
        c = ws.cell(5, k + 1, lbl)
        c.fill = PatternFill("solid", fgColor=bg)
        c.font = Font(bold=True, size=10, color=fg)
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = _border()
    ws.row_dimensions[5].height = 22

    # ── Tabla de riesgos ──────────────────────────────────────────────────────
    _section_row(ws, 7, "  RIESGOS IDENTIFICADOS", 9, SECTION_BG)
    headers = ["ID", "Categoría", "Riesgo", "Probabilidad\n(1-5)", "Impacto\n(1-5)",
               "Nivel P×I", "Semáforo", "Plan de mitigación", "Responsable"]
    _style_header_row(ws, 8, 9, headers, BRAND)

    riesgos = [
        # id, cat, desc, prob, impacto, mitigacion, resp
        ("R-01", "Seguridad",    "Exposición de JWT_SECRET en repositorio",
         1, 5, "Usar .env + .gitignore + GitHub Secrets · Auditar con git-secrets", "DevOps"),
        ("R-02", "Seguridad",    "Inyección NoSQL en endpoints sin validar",
         2, 5, "express-validator + operadores $eq explícitos en consultas MongoDB", "Backend Dev"),
        ("R-03", "Disponibilidad","Caída de MongoDB Atlas M0 (límite free tier)",
         3, 4, "Manejo de errores con retry + health check periódico · Actualizar tier si es necesario", "DevOps"),
        ("R-04", "Disponibilidad","Fallo del microservicio IA en producción",
         2, 4, "Modo degradado en ai.service.js · Health check GET /health · Deploy en Render con restart", "Backend Dev"),
        ("R-05", "Calidad",      "Regresión en cobertura tras nueva feature",
         3, 3, "CI bloquea merge si coverage < 60% · SonarCloud Quality Gate obligatorio", "QA"),
        ("R-06", "Integración",  "Desconexión del dispositivo ESP32 durante envío IoT",
         4, 2, "Retry lógica en firmware · lastSeenAt + alertas de inactividad en dashboard", "IoT Dev"),
        ("R-07", "Rendimiento",  "Latencia AI service > 10s bajo carga concurrente",
         2, 4, "Timeout configurado en ai.service.js · k6 smoke test valida p95 < 2000ms", "Backend Dev"),
        ("R-08", "Datos",        "Corrupción o pérdida de datos en MongoDB Atlas",
         1, 5, "Snapshots automáticos Atlas · Soft delete siempre (isDeleted) · Nunca DELETE físico", "DBA"),
        ("R-09", "CI/CD",        "Fallo del pipeline GitHub Actions (quota agotada)",
         2, 3, "Monitorear minutos de Actions · Optimizar jobs con cache npm/pip", "DevOps"),
        ("R-10", "ML/IA",        "Degradación del modelo Random Forest con nuevos datos",
         2, 4, "Re-entrenamiento periódico con CRISP-DM · Validar R² tras cada re-train", "Data Scientist"),
        ("R-11", "Legal",        "Uso de datos biométricos auditivos sin consentimiento",
         1, 5, "Pantalla de consentimiento en registro · Política de privacidad en app", "Product Owner"),
        ("R-12", "Académico",    "No alcanzar 60% cobertura antes de entrega",
         1, 5, "TDD strict: tests primero · istanbul ignore solo en casos defensivos validados", "QA"),
        ("R-13", "Dependencias", "Vulnerabilidad crítica en dependencia npm/pip",
         3, 4, "npm audit + pip-audit en CI · Dependabot alerts en GitHub", "DevOps"),
        ("R-14", "Scope",        "Expansión no controlada de funcionalidades (scope creep)",
         3, 3, "Respetar fases del Runbook · No avanzar sin 100% verde en fase actual", "PM"),
        ("R-15", "Mobile",       "Fallo de permisos de micrófono en Flutter (iOS/Android)",
         3, 2, "permission_handler con fallback · Mensajes de error descriptivos al usuario", "Mobile Dev"),
    ]

    nivel_color = {
        range(1, 5):   (SEM_OK,   "375623"),
        range(5, 10):  (SEM_WAR,  "7D5700"),
        range(10, 15): ("F8CBAD", "843C0C"),
        range(15, 26): (SEM_ERR,  "9C0006"),
    }

    def _nivel_style(nivel: int):
        for rng, (bg, fg) in nivel_color.items():
            if nivel in rng:
                return bg, fg
        return "FFFFFF", "000000"

    for j, (rid, cat, desc, prob, imp, mit, resp) in enumerate(riesgos):
        r = 9 + j
        nivel = prob * imp
        bg_niv, fg_niv = _nivel_style(nivel)
        sem = "🟢" if nivel <= 4 else "🟡" if nivel <= 9 else "🟠" if nivel <= 14 else "🔴"
        bg_row = _banded(j)
        vals = [rid, cat, desc, prob, imp, nivel, sem, mit, resp]
        for c, val in enumerate(vals, 1):
            cell = ws.cell(row=r, column=c, value=val)
            cell.border = _border()
            cell.alignment = Alignment(wrap_text=True, vertical="center",
                                       horizontal="center" if c in (1, 4, 5, 6, 7) else "left")
            if c in (1, 2):
                cell.fill = bg_row
            elif c in (4, 5):
                cell.fill = bg_row
                cell.font = Font(bold=True, size=11)
            elif c == 6:
                cell.fill = PatternFill("solid", fgColor=bg_niv)
                cell.font = Font(bold=True, size=13, color=fg_niv)
            elif c == 7:
                cell.fill = PatternFill("solid", fgColor=bg_niv)
                cell.font = Font(size=14)
            else:
                cell.fill = bg_row
        ws.row_dimensions[r].height = 36

    # ── Mapa de calor 5×5 ────────────────────────────────────────────────────
    heat_row = 9 + len(riesgos) + 2
    _section_row(ws, heat_row, "  MAPA DE CALOR — PROBABILIDAD × IMPACTO", 9, SECTION_BG)
    heat_row += 1
    ws.cell(heat_row, 1, "P \\ I").font = Font(bold=True, color=BRAND)
    ws.cell(heat_row, 1).alignment = Alignment(horizontal="center")
    ws.cell(heat_row, 1).border = _border()
    for col_i in range(1, 6):
        c = ws.cell(heat_row, col_i + 1, f"I={col_i}")
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BRAND_LIGHT)
        c.alignment = Alignment(horizontal="center")
        c.border = _border()
    ws.row_dimensions[heat_row].height = 20
    for prob_i in range(5, 0, -1):
        heat_row += 1
        pr = ws.cell(heat_row, 1, f"P={prob_i}")
        pr.font = Font(bold=True, color="FFFFFF")
        pr.fill = PatternFill("solid", fgColor=BRAND_LIGHT)
        pr.alignment = Alignment(horizontal="center")
        pr.border = _border()
        for imp_i in range(1, 6):
            nivel = prob_i * imp_i
            bg_h, fg_h = _nivel_style(nivel)
            hc = ws.cell(heat_row, imp_i + 1, nivel)
            hc.fill = PatternFill("solid", fgColor=bg_h)
            hc.font = Font(bold=True, size=11, color=fg_h)
            hc.alignment = Alignment(horizontal="center", vertical="center")
            hc.border = _border()
        ws.row_dimensions[heat_row].height = 22

    widths = [7, 14, 44, 13, 11, 10, 10, 56, 14]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A9"
    ws.auto_filter.ref = f"A8:I{8 + len(riesgos)}"


def _write_trazabilidad(wb: Workbook) -> None:
    ws = wb.create_sheet("Trazabilidad")
    ws.sheet_view.showGridLines = False

    ws.merge_cells("A1:H1")
    ws["A1"] = "TRAZABILIDAD — RF → Escenario BDD → Test → Estado"
    ws["A1"].font = Font(bold=True, size=14, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:H2")
    ws["A2"] = (
        "Vincula cada sub-requisito funcional con su feature BDD (Gherkin), "
        "el test de Jest/pytest/Vitest que lo valida y su estado actual."
    )
    ws["A2"].font = Font(italic=True, size=9, color="595959")
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 16

    headers = ["RF-ID", "Módulo", "Descripción RF", "Escenario BDD (Given/When/Then)",
               "Test ID / Archivo", "Tipo Test", "Capa", "Estado"]
    _style_header_row(ws, 4, 8, headers, BRAND)

    traza = [
        # RF-01: Autenticación
        ("RF-01-1", "Autenticación", "Registro de nuevo usuario con email único",
         "Given email no registrado When POST /api/auth/register Then 201 + tokens",
         "auth.test.js:register-201", "Integration", "Backend", "✅"),
        ("RF-01-2", "Autenticación", "Login con credenciales válidas",
         "Given usuario registrado When POST /api/auth/login Then 200 + tokens",
         "auth.test.js:login-200", "Integration", "Backend", "✅"),
        ("RF-01-3", "Autenticación", "Refresh de token JWT",
         "Given refresh válido When POST /api/auth/refresh Then 200 + nuevo token",
         "auth.test.js:refresh-200", "Integration", "Backend", "✅"),
        ("RF-01-4", "Autenticación", "Logout e invalidación de refresh",
         "Given token válido When POST /api/auth/logout Then 200 + token revocado",
         "auth.test.js:logout-200", "Integration", "Backend", "✅"),
        ("RF-01-5", "Autenticación", "Obtener perfil autenticado",
         "Given access token válido When GET /api/auth/me Then 200 + datos usuario",
         "auth.test.js:me-200", "Integration", "Backend", "✅"),
        ("RF-01-6", "Autenticación", "Actualizar perfil del usuario",
         "Given token válido When PATCH /api/auth/me Then 200 + perfil actualizado",
         "auth.test.js:patch-me-200", "Integration", "Backend", "✅"),
        # RF-02: Monitoreo Auditivo
        ("RF-02-1", "Monitoreo", "Guardar registro de ruido desde sensor",
         "Given device válido When POST /api/noise Then 201 + id",
         "noise.test.js:create-201", "Integration", "Backend", "✅"),
        ("RF-02-2", "Monitoreo", "Obtener historial de ruido del usuario",
         "Given token válido When GET /api/noise Then 200 + lista paginada",
         "noise.test.js:list-200", "Integration", "Backend", "✅"),
        ("RF-02-3", "Monitoreo", "Obtener estadísticas de exposición auditiva",
         "Given registros existentes When GET /api/noise/stats Then 200 + métricas",
         "noise.test.js:stats-200", "Integration", "Backend", "✅"),
        ("RF-02-4", "Monitoreo", "Registrar ruido desde dispositivo IoT (ESP32)",
         "Given X-Device-Key válido When POST /api/noise/iot Then 201",
         "noise.test.js:iot-201", "Integration", "Backend", "✅"),
        ("RF-02-5", "Monitoreo", "Eliminar registro de ruido (soft delete)",
         "Given owner token When DELETE /api/noise/:id Then 200 + isDeleted=true",
         "noise.test.js:delete-soft", "Integration", "Backend", "✅"),
        ("RF-02-6", "Monitoreo", "Monitor en tiempo real (Angular)",
         "Given usuario logueado When monitor activo Then interval cada 3s visible",
         "noise-monitor.spec.ts", "Unit", "Frontend", "✅"),
        # RF-03: Evaluación de Salud Auditiva
        ("RF-03-1", "Evaluación", "Crear evaluación audiológica",
         "Given datos completos When POST /api/evaluations Then 201 + id",
         "evaluations.test.js:create-201", "Integration", "Backend", "✅"),
        ("RF-03-2", "Evaluación", "Obtener evaluaciones del usuario",
         "Given token válido When GET /api/evaluations Then 200 + lista",
         "evaluations.test.js:list-200", "Integration", "Backend", "✅"),
        ("RF-03-3", "Evaluación", "Predecir riesgo auditivo con IA",
         "Given datos audiométricos When POST /api/predict-risk Then 200 + nivel",
         "test_model.py:predict_risk", "Unit", "AI-Service", "✅"),
        ("RF-03-4", "Evaluación", "Integrar resultado IA en evaluación",
         "Given IA responde When creamos evaluación Then aiRiskLevel guardado",
         "evaluations.test.js:ai-integration", "Integration", "Backend", "✅"),
        ("RF-03-5", "Evaluación", "Ver resultados de evaluación (Angular)",
         "Given evaluación completada When results component Then riesgo mostrado",
         "results.component.spec.ts", "Unit", "Frontend", "✅"),
        ("RF-03-6", "Evaluación", "Historial de evaluaciones (Angular)",
         "Given multiple evaluaciones When history page Then lista visible",
         "history.component.spec.ts", "Unit", "Frontend", "✅"),
        # RF-04: Dispositivos IoT
        ("RF-04-1", "IoT", "Registrar dispositivo IoT",
         "Given admin token When POST /api/devices Then 201 + apiKey",
         "devices.test.js:create-201", "Integration", "Backend", "✅"),
        ("RF-04-2", "IoT", "Listar dispositivos del usuario",
         "Given token válido When GET /api/devices Then 200 + lista",
         "devices.test.js:list-200", "Integration", "Backend", "✅"),
        ("RF-04-3", "IoT", "Revocar apiKey de dispositivo",
         "Given owner token When DELETE /api/devices/:id Then 200 + revocado",
         "devices.test.js:revoke", "Integration", "Backend", "✅"),
        ("RF-04-4", "IoT", "Autenticar petición IoT con X-Device-Key",
         "Given header X-Device-Key válido When POST /api/noise/iot Then pass middleware",
         "noise.test.js:device-key-auth", "Integration", "Backend", "✅"),
        ("RF-04-5", "IoT", "Rechazar dispositivo con apiKey inválida",
         "Given apiKey inválida When POST /api/noise/iot Then 401",
         "noise.test.js:device-key-invalid", "Integration", "Backend", "✅"),
        ("RF-04-6", "IoT", "Panel de gestión de dispositivos (Angular)",
         "Given admin logueado When devices page Then tabla con estado visible",
         "devices.component.spec.ts", "Unit", "Frontend", "✅"),
        # RF-05: Recomendaciones
        ("RF-05-1", "Recomendaciones", "Obtener recomendaciones personalizadas",
         "Given riesgo calculado When GET /api/recommendations Then 200 + lista",
         "evaluations.test.js:recommendations", "Integration", "Backend", "✅"),
        ("RF-05-2", "Recomendaciones", "Mostrar recomendaciones en Angular",
         "Given recomendaciones disponibles When recommendations page Then lista visible",
         "recommendations.component.spec.ts", "Unit", "Frontend", "✅"),
        ("RF-05-3", "Recomendaciones", "Recomendaciones adaptativas por historial",
         "Given historial > 7 días When evaluar Then recomendaciones distintas",
         "test_model.py:adaptive_recs", "Unit", "AI-Service", "✅"),
        ("RF-05-4", "Recomendaciones", "Filtrar por categoría (Flutter)",
         "Given lista de recs When filter chip seleccionado Then filtro aplicado",
         "hearing_mapper_test.dart", "Unit", "Mobile", "✅"),
        ("RF-05-5", "Recomendaciones", "Guardado de hábitos saludables",
         "Given formulario hábitos When POST Then 201 + confirmación",
         "habit-form.component.spec.ts", "Unit", "Frontend", "✅"),
        ("RF-05-6", "Recomendaciones", "Historial de hábitos registrados",
         "Given hábitos guardados When GET /habits Then lista cronológica",
         "all-records.component.spec.ts", "Unit", "Frontend", "✅"),
        # RF-06: Accesibilidad / Demo
        ("RF-06-1", "Accesibilidad", "Modo demo público (sin login)",
         "Given publicDemo=true When app carga Then datos simulados visibles",
         "dashboard.component.spec.ts:demo", "Unit", "Frontend", "✅"),
        ("RF-06-2", "Accesibilidad", "Splash y navegación inicial",
         "Given app inicia When splash completa Then login/home según sesión",
         "splash.component.spec.ts", "Unit", "Frontend", "✅"),
        ("RF-06-3", "Accesibilidad", "Guard de rutas protegidas",
         "Given no token When ruta protegida Then redirect a /login",
         "auth.guard.spec.ts", "Unit", "Frontend", "✅"),
        ("RF-06-4", "Accesibilidad", "Interceptor refresh automático",
         "Given access expirado When petición autenticada Then refresh automático",
         "auth.interceptor.spec.ts", "Unit", "Frontend", "✅"),
        ("RF-06-5", "Accesibilidad", "App Flutter offline-first",
         "Given sin conexión When app carga Then datos cacheados visibles",
         "api_response_test.dart", "Unit", "Mobile", "✅"),
        ("RF-06-6", "Accesibilidad", "Monitor de micrófono Flutter",
         "Given permiso concedido When monitor activo Then dB mostrado",
         "user_test.dart", "Unit", "Mobile", "✅"),
        # RNF
        ("RNF-01", "No Funcionales", "Cobertura de tests ≥ 60%",
         "Given CI ejecuta When cobertura calculada Then ≥ 60% en todas las capas",
         "ci.yml:sonarcloud-job", "CI/CD", "All", "✅"),
        ("RNF-02", "No Funcionales", "SonarCloud Quality Gate = Passed",
         "Given push a main When pipeline ejecuta Then gate passed",
         "ci.yml:sonar-scan", "CI/CD", "All", "✅"),
        ("RNF-03", "No Funcionales", "Respuesta API < 500ms (p95)",
         "Given carga normal When k6 ejecuta Then p95 < 500ms",
         "k6/load-test.js", "Load", "Backend", "⚠️"),
        ("RNF-04", "No Funcionales", "Passwords con bcrypt salt=12",
         "Given registro When password guardado Then hash bcrypt detectado",
         "auth.test.js:bcrypt-hash", "Unit", "Backend", "✅"),
        ("RNF-05", "No Funcionales", "JWT sin datos sensibles en payload",
         "Given token generado When decodificado Then solo userId+role+iat+exp",
         "auth.test.js:jwt-payload", "Unit", "Backend", "✅"),
        ("RNF-06", "No Funcionales", "Health checks de todos los servicios",
         "Given servicios activos When GET /health Then 200 en cada uno",
         "health.test.js", "Integration", "Backend", "✅"),
        ("RNF-07", "No Funcionales", "0 code smells SonarCloud",
         "Given código enviado When análisis Sonar Then 0 smells",
         "ci.yml:sonarcloud-job", "CI/CD", "All", "✅"),
        ("RNF-08", "No Funcionales", "Tiempo de carga inicial < 3s",
         "Given Lighthouse audit When app carga Then FCP < 3s",
         "Lighthouse CI (pendiente)", "E2E", "Frontend", "⚠️"),
        ("RNF-09", "No Funcionales", "Docker Compose multi-servicio",
         "Given docker-compose up When todos los servicios When up Then healthy",
         "docker-compose.yml", "Integration", "Infra", "✅"),
        ("RNF-10", "No Funcionales", "Pipeline automatizado en GitHub Actions",
         "Given push When CI ejecuta Then test+sonar+deploy",
         "ci.yml + deploy.yml", "CI/CD", "All", "✅"),
    ]

    data_row = 5
    current_module = None
    section_idx = 0
    for j, (rf_id, modulo, desc, bdd, test_id, tipo, capa, estado) in enumerate(traza):
        if modulo != current_module:
            current_module = modulo
            _section_row(ws, data_row, f"  ▶  {modulo.upper()}", 8, SECTION_BG)
            data_row += 1
            section_idx = 0

        bg = _banded(section_idx)
        section_idx += 1
        vals = [rf_id, modulo, desc, bdd, test_id, tipo, capa, estado]
        for c, val in enumerate(vals, 1):
            cell = ws.cell(row=data_row, column=c, value=val)
            cell.border = _border()
            cell.fill   = bg
            cell.alignment = Alignment(
                wrap_text=True, vertical="center",
                horizontal="center" if c in (1, 6, 7, 8) else "left"
            )
            if c == 8:
                cell.fill = PatternFill("solid", fgColor=SEM_OK if estado == "✅" else SEM_WAR)
                cell.font = Font(bold=True)
            if c == 1:
                cell.font = Font(bold=True, color=BRAND_LIGHT)
        ws.row_dimensions[data_row].height = 34
        data_row += 1

    data_row += 1
    _section_row(ws, data_row, "  LEYENDA", 8, SECTION_BG)
    data_row += 1
    leyenda = [
        ("✅", "Completado — test pasa, feature validada en CI"),
        ("⚠️", "Parcial — implementado pero pendiente validación en producción"),
        ("❌", "Pendiente — no implementado aún"),
    ]
    for icon, desc in leyenda:
        ws.cell(data_row, 1, icon).alignment = Alignment(horizontal="center")
        ws.cell(data_row, 2, desc)
        ws.row_dimensions[data_row].height = 16
        data_row += 1

    widths = [10, 16, 34, 48, 32, 12, 12, 10]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A5"


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out = root / "docs" / "matriz-registro-hearguard.xlsx"

    wb = Workbook()
    wb.remove(wb.active)

    _write_portada(wb)
    _write_dashboard(wb)
    _write_matriz(wb)
    _write_rf_sheet(wb)
    _write_rnf_sheet(wb)
    _write_metricas(wb)
    _write_resumen_intent(wb)
    _write_trazabilidad(wb)
    _write_riesgos(wb)
    _write_procesos(wb)
    _write_actividades_bpmn(wb)
    _write_flujo_bpmn(wb)
    _write_requerimientos(wb)
    _write_control_versiones(wb)
    _write_ai_dlc(wb)
    _write_dependencias(wb)
    _write_merges(wb)
    _write_historial(wb)
    _write_artefactos(wb)
    _write_pmv(wb)
    _write_instrucciones(wb)

    wb.active = wb["Portada"]
    wb.save(out)

    total = len(BOLTS)
    si = sum(1 for b in BOLTS if b.status == "Sí")
    no = sum(1 for b in BOLTS if b.status == "No")
    par = sum(1 for b in BOLTS if b.status == "Parcial")
    pct = round((si + 0.5 * par) / total * 100, 1)
    n_hojas = len(wb.sheetnames)
    print(f"Generado: {out}")
    print(f"  Hojas: {n_hojas} | Bolts: {total} | Si: {si} | No: {no} | Parcial: {par} | Avance: {pct}%")
    print(f"  Requerimientos: {len(REQS)} (RF+RNF) | Artefactos: {len(ARTEFACTOS)} | PMV items: {len(PMV_ITEMS)}")
    print(f"  Commits registrados: {len(COMMITS)} | Dependencias: {len(DEPENDENCIAS)}")
    print(f"  Autor: {PROJECT['autor']} | Version matriz: {PROJECT['version_matriz']}")


if __name__ == "__main__":
    main()
