/* =========================================================
   Radar de Ventas Digital™ — app.js
   - Código principal (una sola implementación; eliminé la versión duplicada
     que provocaba handlers y definiciones dobles que generaban advertencias).
   ========================================================= */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    function toNumber(v) {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }

    // Normaliza 1..5 a 0..100
    function normalize1to5(v) {
        // v in [1..5] => (v-1)/4 * 100
        return ((v - 1) / 4) * 100;
    }

    function round0(n) {
        return Math.round(n);
    }

    function escapeHTML(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* ---------------------------
       DOM (declaradas sin resolver hasta el init para evitar que
       querySelector se ejecute antes de que el DOM esté disponible)
    --------------------------- */
    let quiz;
    let results;

    let btnCalc;
    let btnReset;

    let progressFill;
    let progressText;
    let questionsLeft;

    let routeEcom;
    let routeServices;

    let previewScore;
    let previewLevel;
    let previewP1;
    let previewP2;
    let previewP3;

    let scoreTotalEl;
    let scoreLevelEl;
    let flagsCountEl;
    let prio1KPI;

    let diagGeneralEl;

    let sOferta;
    let sTrafico;
    let sConversion;
    let sRetencion;
    let sOperacion;
    let sMetricas;

    let prioTitle1;
    let prioTitle2;
    let prioTitle3;
    let prioText1;
    let prioText2;
    let prioText3;

    let plan7El;
    let plan15El;

    let ctaWhatsappTop;
    let ctaWhatsapp;

    /* ---------------------------
       State
    --------------------------- */
    const TOTAL_QUESTIONS = 24;

    const state = {
        route: "ecom", // "ecom" | "services"
    };

    // Dimensiones y pesos (deben sumar 1)
    const DIM_WEIGHTS = {
        oferta: 0.10,
        trafico: 0.20,
        conversion: 0.25,
        retencion: 0.10,
        operacion: 0.15,
        metricas: 0.20,
    };

    // Preguntas por dimensión
    const DIM_QUESTIONS = {
        oferta: ["q1", "q2", "q3", "q4"],
        trafico: ["q5", "q6", "q7", "q8"],
        conversion: ["q9", "q10", "q11", "q12", "q13"],
        retencion: ["q14", "q15", "q16"],
        operacion: ["q17", "q18", "q19", "q20"],
        metricas: ["q21", "q22", "q23", "q24"],
    };

    // Dimensión → nombre legible
    const DIM_LABELS = {
        oferta: "Oferta & Claridad",
        trafico: "Tráfico & Adquisición",
        conversion: "Conversión & Confianza",
        retencion: "Retención & Experiencia",
        operacion: "Operación & Entrega",
        metricas: "Métricas & Control",
    };

    // Banderas rojas: regla y mensaje
    function computeFlags(raw) {
        const flags = [];

        // q10: <=2 ( >3h o no definido )
        if (raw.q10 !== null && raw.q10 <= 2) {
            flags.push({
                key: "q10",
                title: "Respuesta lenta a leads",
                why: "La velocidad de respuesta no es un detalle: es parte de la confianza y suele definir si el lead compra o se enfría.",
            });
        }

        // q13: valor 1 = sí, hay fricción
        if (raw.q13 !== null && raw.q13 === 1) {
            flags.push({
                key: "q13",
                title: "Fricción en el proceso de compra/contratación",
                why: "Si el cliente siente pasos innecesarios, no se queja: se va. Reducir fricción aumenta conversión sin gastar más en tráfico.",
            });
        }

        // q17: <=2
        if (raw.q17 !== null && raw.q17 <= 2) {
            flags.push({
                key: "q17",
                title: "Inconsistencia en entrega",
                why: "Vender más sin cumplir tiempos crea devoluciones, quejas y pérdida de reputación. Es una fuga de caja silenciosa.",
            });
        }

        // q21: 1 = no conoce margen
        if (raw.q21 !== null && raw.q21 === 1) {
            flags.push({
                key: "q21",
                title: "No se conoce el margen",
                why: "Sin margen no hay control. Puedes estar vendiendo y perdiendo dinero, o no saber cuánto puedes invertir para crecer.",
            });
        }

        return flags;
    }

    function computePenalty(flagsCount) {
        // -5 por flag, máximo -15
        return -5 * clamp(flagsCount, 0, 3);
    }

    function levelFromScore(score) {
        if (score <= 39) return "Emergente";
        if (score <= 59) return "Inestable";
        if (score <= 79) return "En crecimiento";
        return "Escalable";
    }

    /* ---------------------------
       Route-specific microcopy (sin cambiar preguntas todavía)
       - En siguiente iteración, podemos variar 2–4 preguntas por ruta.
    --------------------------- */
    const ROUTE_COPY = {
        ecom: {
            whatsappText: "Hola, quiero agendar un Diagnóstico Premium del Radar de Ventas Digital para mi tienda online (e-commerce).",
            focus: "e-commerce",
            examples: "checkout, envíos, devoluciones, pagos, prueba social",
        },
        services: {
            whatsappText: "Hola, quiero agendar un Diagnóstico Premium del Radar de Ventas Digital para mi servicio/agencia (servicios digitales).",
            focus: "servicios digitales",
            examples: "leads, portafolio, propuestas, seguimiento, cierres",
        },
    };

    /* ---------------------------
       Acción library: piezas para Plan 7 y 15 días
    --------------------------- */
    const ACTIONS = {
        oferta: {
            title: "Oferta & Claridad",
            quickWins: [
                {
                    title: "Reescribe tu promesa en 1 frase (y pruébala con 3 personas)",
                    how: [
                        "Escribe: (1) Qué vendes, (2) para quién, (3) resultado tangible, (4) por qué tú.",
                        "Ejemplo: “Creamos contenido y anuncios para e-commerce que quieren subir ventas sin desperdiciar pauta.”",
                        "Pídele a 3 personas que lo repitan con sus palabras. Si no pueden, está confuso.",
                    ],
                    output: "Una frase final + 3 bullets de soporte (prueba, método, garantía).",
                    time: "45–60 min",
                    impact: "Alto",
                },
                {
                    title: "Haz visible el precio/rango (sin regalarte)",
                    how: [
                        "Publica un rango (desde / hasta) o paquetes base.",
                        "Aclara: qué incluye / qué NO incluye / tiempo de entrega.",
                        "Esto filtra leads y sube conversión.",
                    ],
                    output: "Sección de precios o rangos clara.",
                    time: "30–60 min",
                    impact: "Medio/Alto",
                },
            ],
        },

        trafico: {
            title: "Tráfico & Adquisición",
            quickWins: [
                {
                    title: "Elige 1 canal principal y una rutina mínima semanal",
                    how: [
                        "Define 1 canal principal (IG, TikTok, Ads, Marketplace, SEO).",
                        "Rutina mínima: 2 contenidos/semana con intención (atraer/educar/cerrar).",
                        "Define 1 CTA único: WhatsApp / formulario / link de compra.",
                    ],
                    output: "Rutina semanal y CTA principal definidos.",
                    time: "45 min",
                    impact: "Alto",
                },
                {
                    title: "Crea una pieza ‘vendedora’ fija (post ancla / pinned)",
                    how: [
                        "Crea una pieza que responda: qué haces + para quién + pruebas + cómo comprar.",
                        "Déjala fijada en IG/TikTok o en la parte alta de la web.",
                    ],
                    output: "1 post ancla con CTA.",
                    time: "60–90 min",
                    impact: "Medio/Alto",
                },
            ],
        },

        conversion: {
            title: "Conversión & Confianza",
            quickWins: [
                {
                    title: "Prueba social visible: 6 pruebas mínimas",
                    how: [
                        "Reúne: 3 testimonios + 2 evidencias (capturas/antes-después) + 1 caso mini con números.",
                        "Ponlos en: landing / destacados / carrusel.",
                    ],
                    output: "Bloque de confianza con 6 pruebas.",
                    time: "60–120 min",
                    impact: "Muy alto",
                },
                {
                    title: "Reduce fricción: 3 pasos máximos para comprar/contratar",
                    how: [
                        "Lista tu proceso actual paso a paso.",
                        "Elimina/reduce lo que no aporta (formularios largos, ida y vuelta infinita).",
                        "Deja un CTA claro: ‘Comprar ahora’ o ‘Agendar 15 min’.",
                    ],
                    output: "Proceso simplificado con 1 CTA claro.",
                    time: "60–90 min",
                    impact: "Muy alto",
                },
                {
                    title: "Define SLA de respuesta (y cúmplelo)",
                    how: [
                        "Define: ‘Respondemos en menos de 60 min en horario laboral’.",
                        "Configura mensajes rápidos y etiquetas en WhatsApp Business.",
                        "Si no puedes, define horarios (pero define algo).",
                    ],
                    output: "Promesa realista de respuesta + sistema mínimo.",
                    time: "30–60 min",
                    impact: "Alto",
                },
            ],
        },

        retencion: {
            title: "Retención & Experiencia",
            quickWins: [
                {
                    title: "Crea el seguimiento postventa (mensaje 24h + 7 días)",
                    how: [
                        "Mensaje 24h: confirmación + tips + soporte.",
                        "Mensaje 7 días: pregunta + pedido de testimonio + oferta de recompra/upsell.",
                    ],
                    output: "2 plantillas listas para copiar/pegar.",
                    time: "30–45 min",
                    impact: "Medio/Alto",
                },
                {
                    title: "Organiza tu base de clientes (mínimo viable)",
                    how: [
                        "Crea una hoja con: nombre, contacto, compra, fecha, valor, estado.",
                        "Esto hace posible recontactar y vender sin pagar ads.",
                    ],
                    output: "Base de datos mínima.",
                    time: "45–60 min",
                    impact: "Alto",
                },
            ],
        },

        operacion: {
            title: "Operación & Entrega",
            quickWins: [
                {
                    title: "Define y publica tiempos reales (y protege tu reputación)",
                    how: [
                        "Define tiempos de entrega por tipo de pedido/servicio.",
                        "Publica los tiempos y condiciones claras.",
                        "Si hay demora, comunica proactivamente: eso reduce conflictos.",
                    ],
                    output: "Tiempos y condiciones visibles.",
                    time: "30–60 min",
                    impact: "Alto",
                },
                {
                    title: "Crea un SOP de 1 página (paso a paso real)",
                    how: [
                        "Documenta: recepción → producción → control → entrega → postventa.",
                        "Esto reduce improvisación y errores.",
                    ],
                    output: "SOP mínimo de 1 página.",
                    time: "60–90 min",
                    impact: "Alto",
                },
            ],
        },

        metricas: {
            title: "Métricas & Control",
            quickWins: [
                {
                    title: "Calcula margen promedio (aunque sea aproximado hoy)",
                    how: [
                        "Producto/servicio: precio - costo variable - comisiones - entrega.",
                        "Define margen % aproximado.",
                        "Eso decide cuánto puedes invertir en adquisición.",
                    ],
                    output: "Margen promedio definido.",
                    time: "45–60 min",
                    impact: "Muy alto",
                },
                {
                    title: "Tablero semanal mínimo (30 minutos a la semana)",
                    how: [
                        "Anota: leads, ventas, ticket, gasto ads, utilidad estimada.",
                        "Hazlo cada semana el mismo día. Disciplina > herramientas.",
                    ],
                    output: "Tablero mínimo semanal.",
                    time: "30–45 min",
                    impact: "Alto",
                },
            ],
        },
    };

    /* ---------------------------
       Diagnóstico por nivel + dimensión
    --------------------------- */
    function generalDiagnosisText(level, score, flags, routeKey) {
        const route = ROUTE_COPY[routeKey];

        // Texto base por nivel
        if (level === "Emergente") {
            return (
                `Hoy tu negocio está en una fase ${level.toLowerCase()}: hay intención y señales de valor, ` +
                `pero todavía falta estructura para que el crecimiento sea constante. ` +
                `La buena noticia: cuando un negocio ${route.focus} organiza claridad, confianza y medición mínima, ` +
                `normalmente ve mejoras rápidas sin necesidad de “inventar” nada nuevo. ` +
                `Aquí el objetivo no es “verse bien”: es dejar de perder oportunidades por fugas básicas.\n\n` +
                `Tu score actual (${round0(score)}/100) indica que vender más es posible, ` +
                `pero primero hay que asegurar cimientos: proceso simple, respuesta rápida y control de margen.`
            );
        }

        if (level === "Inestable") {
            return (
                `Tu negocio está en un punto típico: ya vende o genera leads, pero el sistema todavía es frágil. ` +
                `Eso significa que algunos días funciona y otros no, y el resultado depende demasiado de energía, tiempo o suerte. ` +
                `En negocios ${route.focus}, esa inestabilidad casi siempre viene de dos cosas: ` +
                `fricción en conversión (confianza/proceso) y falta de control (métricas/margen).\n\n` +
                `Tu score (${round0(score)}/100) sugiere que no estás lejos: ` +
                `con ajustes puntuales puedes aumentar conversión y ordenar la operación para sostener crecimiento.`
            );
        }

        if (level === "En crecimiento") {
            return (
                `Tu negocio ya tiene señales reales de crecimiento: hay estructura suficiente para vender y entregar, ` +
                `pero todavía existen fugas silenciosas que frenan la escalabilidad. ` +
                `En esta etapa, la diferencia entre “crecer” y “escalar” es la consistencia: ` +
                `convertir más con el mismo tráfico, responder más rápido, estandarizar entrega y medir lo mínimo.\n\n` +
                `Tu score (${round0(score)}/100) indica buen potencial. ` +
                `Si atacas las prioridades correctas, puedes subir ventas sin aumentar proporcionalmente el estrés operativo.`
            );
        }

        // Escalable
        return (
            `Tu negocio muestra un nivel ${level.toLowerCase()}: hay claridad, confianza y control por encima del promedio. ` +
            `Eso normalmente significa que ya no dependes solo de “publicar más” o “meter más pauta”. ` +
            `Puedes crecer con intención: optimizar embudo, afinar oferta y tomar decisiones con datos.\n\n` +
            `Tu score (${round0(score)}/100) es fuerte. El siguiente salto no es “hacer de todo”, ` +
            `sino eliminar micro-fugas, automatizar lo repetible y fortalecer el canal principal.`
        );
    }

    function dimensionInsight(dimKey, dimScore, routeKey) {
        const name = DIM_LABELS[dimKey];
        const route = ROUTE_COPY[routeKey];

        if (dimScore < 50) {
            return (
                `<strong>${escapeHTML(name)}:</strong> aquí hay una fuga estructural. ` +
                `No significa que “estés mal”, significa que estás perdiendo oportunidades sin darte cuenta. ` +
                `En ${route.focus}, cuando esta dimensión está baja, se siente como: “hago esfuerzo, pero no es constante”.`
            );
        }
        if (dimScore < 75) {
            return (
                `<strong>${escapeHTML(name)}:</strong> funciona, pero no está optimizado. ` +
                `Estás relativamente cerca de un sistema predecible. ` +
                `Los ajustes aquí suelen dar resultados rápidos porque no requieren reinventar el negocio.`
            );
        }
        return (
            `<strong>${escapeHTML(name)}:</strong> es una fortaleza. ` +
            `Tu reto no es arreglarla, es usarla como palanca para compensar áreas más débiles.`
        );
    }

    function priorityNarrative(dimKey, dimScore, flags, routeKey) {
        const name = DIM_LABELS[dimKey];
        const route = ROUTE_COPY[routeKey];

        // Mensajes específicos por dimensión
        const base = {
            oferta:
                `La claridad vende. Si tu oferta no se entiende rápido, el cliente no “piensa”: se va. ` +
                `En ${route.focus}, esto se traduce en leads fríos o gente que pregunta sin intención real.`,
            trafico:
                `Sin un canal fuerte y una rutina mínima, el negocio depende del azar. ` +
                `La meta no es “estar en todo”, es tener un canal principal que traiga demanda de forma repetible.`,
            conversion:
                `Esta es la caja registradora. Confianza + velocidad + fricción baja = ventas. ` +
                `Si aquí hay fuga, puedes tener tráfico y aún así sentir que “no cierra”.`,
            retencion:
                `Retener es vender sin volver a pagar por el cliente. ` +
                `Cuando retención está baja, se crece más lento y con más esfuerzo del necesario.`,
            operacion:
                `Operación es reputación y margen escondido. ` +
                `Si la entrega falla, la venta se devuelve: en dinero, tiempo y estrés.`,
            metricas:
                `Sin margen y tablero mínimo, no hay control. ` +
                `Y cuando no hay control, aparecen fugas: ads sin retorno, precios mal puestos o decisiones por intuición.`,
        }[dimKey];

        // “por qué lo digo” basado en score
        let why = "";
        if (dimScore < 35) {
            why = `Tu puntuación aquí es crítica (${round0(dimScore)}/100). Esto suele ser un cuello de botella real.`;
        } else if (dimScore < 50) {
            why = `Tu puntuación aquí está baja (${round0(dimScore)}/100). Hay mejoras claras y medibles.`;
        } else if (dimScore < 70) {
            why = `Tu puntuación aquí es media (${round0(dimScore)}/100). Estás cerca, pero falta consistencia.`;
        } else {
            why = `Tu puntuación aquí es alta (${round0(dimScore)}/100). Esta prioridad sube si otras están aún más altas.`;
        }

        // Si hay banderas relacionadas, añade “alerta”
        const relatedFlagKeysByDim = {
            conversion: ["q10", "q13"],
            operacion: ["q17"],
            metricas: ["q21"],
        };

        const related = relatedFlagKeysByDim[dimKey] || [];
        const hasRelated = flags.some((f) => related.includes(f.key));

        const alert = hasRelated
            ? ` <span style="color: rgba(255,204,102,.92); font-weight: 800;">(Hay bandera roja relacionada: esto está drenando ventas hoy.)</span>`
            : "";

        return `${base} ${why}${alert}`;
    }

    /* ---------------------------
       Plan generator (7 y 15 días)
       - Toma top 3 dimensiones bajas
       - Inserta acciones específicas
    --------------------------- */
    function generatePlan(days, topDims, scoresByDim, flags, routeKey) {
        // Estrategia:
        // - 7 días: arreglar dim #1 (días 1-2), dim #2 (días 3-4), dim #3 + métricas quick win (días 5-7)
        // - 15 días: profundiza y consolida + sistema mínimo de seguimiento

        const plan = [];

        // Selecciona acciones por dimensión (tomamos 1–2 quickWins)
        function pickActionsForDim(dimKey, count = 2) {
            const pool = ACTIONS[dimKey]?.quickWins || [];
            // Si pool es menor, devuelve lo que hay
            return pool.slice(0, count);
        }

        // Enfatiza si hay bandera roja
        function injectFlagTaskIfNeeded(list, dimKey) {
            // Insertamos “tarea de emergencia” si hay bandera
            const flagToTask = {
                q10: {
                    title: "Urgente: define un sistema de respuesta (SLA + mensajes rápidos)",
                    how: [
                        "Define horario real de atención y promesa de respuesta.",
                        "Configura respuestas rápidas y etiquetas en WhatsApp Business.",
                        "Haz un guion de 6 mensajes: saludo, calificación, oferta, prueba, cierre, seguimiento.",
                    ],
                    output: "SLA de respuesta + guiones listos.",
                    time: "45–60 min",
                    impact: "Muy alto",
                },
                q13: {
                    title: "Urgente: reduce fricción a 3 pasos máximos",
                    how: [
                        "Escribe tu proceso actual en una lista.",
                        "Marca en rojo lo que el cliente no entiende o no necesita.",
                        "Deja un CTA único (comprar/agenda) y una ruta clara.",
                    ],
                    output: "Proceso simplificado (3 pasos).",
                    time: "60–90 min",
                    impact: "Muy alto",
                },
                q17: {
                    title: "Urgente: define tiempos de entrega reales + protocolo de comunicación",
                    how: [
                        "Define tiempos por tipo de pedido/servicio.",
                        "Publica condiciones y establece actualización proactiva si hay demora.",
                    ],
                    output: "Tiempos y protocolo publicados.",
                    time: "45–60 min",
                    impact: "Muy alto",
                },
                q21: {
                    title: "Urgente: calcula margen mínimo viable (y documenta supuestos)",
                    how: [
                        "Precio - costo variable - comisiones - entrega.",
                        "Define margen % aproximado. No perfecto, pero realista.",
                    ],
                    output: "Margen estimado y control básico.",
                    time: "45–60 min",
                    impact: "Muy alto",
                },
            };

            // Map dim -> flags relevantes
            const rel = {
                conversion: ["q10", "q13"],
                operacion: ["q17"],
                metricas: ["q21"],
            }[dimKey] || [];

            const found = flags.find((f) => rel.includes(f.key));
            if (!found) return list;

            const task = flagToTask[found.key];
            // Ponla primero
            return [task, ...list];
        }

        // Render helper
        function renderTask(task) {
            const steps = task.how.map((s) => `<li>${escapeHTML(s)}</li>`).join("");
            return `
        <div class="task">
          <div class="task__top">
            <div class="task__title">${escapeHTML(task.title)}</div>
            <div class="task__meta">
              <span class="pillmeta">${escapeHTML(task.time)}</span>
              <span class="pillmeta pillmeta--gold">${escapeHTML(task.impact)}</span>
            </div>
          </div>
          <ul class="task__list">${steps}</ul>
          <div class="task__out"><strong>Entregable:</strong> ${escapeHTML(task.output)}</div>
        </div>
      `;
        }

        // Construcción por días
        const [d1, d2, d3] = topDims;

        if (days === 7) {
            // Días 1-2: Dim #1
            const tasks1 = injectFlagTaskIfNeeded(pickActionsForDim(d1, 2), d1);
            plan.push({
                label: "Días 1–2",
                focus: DIM_LABELS[d1],
                desc:
                    `Objetivo: detener la fuga principal. Esto impacta ventas rápido porque ataca el cuello de botella #1.`,
                tasks: tasks1,
            });

            // Días 3-4: Dim #2
            const tasks2 = injectFlagTaskIfNeeded(pickActionsForDim(d2, 2), d2);
            plan.push({
                label: "Días 3–4",
                focus: DIM_LABELS[d2],
                desc:
                    `Objetivo: reforzar el segundo cuello de botella. Esto evita que el avance del día 1–2 se “pierda”.`,
                tasks: tasks2,
            });

            // Días 5-7: Dim #3 + tablero mínimo (métricas)
            const tasks3 = injectFlagTaskIfNeeded(pickActionsForDim(d3, 1), d3);
            // Siempre meter 1 tarea de métricas si no está en top 3
            const includeMetricas = !topDims.includes("metricas");
            const metricTask = pickActionsForDim("metricas", 1)[0];
            const lastTasks = includeMetricas ? [...tasks3, metricTask] : tasks3;

            plan.push({
                label: "Días 5–7",
                focus: `${DIM_LABELS[d3]} + Control mínimo`,
                desc:
                    `Objetivo: consolidar con control. Sin medición mínima, mejoras se sienten “subjetivas” y se abandonan.`,
                tasks: lastTasks,
            });
        } else if (days === 15) {
            // 15 días: 5 bloques de 3 días
            const dimsOrder = [d1, d1, d2, d2, d3].map((x, i) => (i === 4 ? x : x));

            const blocks = [
                { label: "Días 1–3", dim: d1, extra: "Corrección crítica + quick win" },
                { label: "Días 4–6", dim: d1, extra: "Estandarización y consistencia" },
                { label: "Días 7–9", dim: d2, extra: "Refuerzo del canal principal" },
                { label: "Días 10–12", dim: d2, extra: "Optimización de conversión del canal" },
                { label: "Días 13–15", dim: d3, extra: "Sistema mínimo + seguimiento" },
            ];

            blocks.forEach((b, idx) => {
                let tasks = pickActionsForDim(b.dim, 2);
                tasks = injectFlagTaskIfNeeded(tasks, b.dim);

                // En 15 días siempre agregar retención o métricas si están muy bajas
                if (idx === 4) {
                    const add = [];
                    if (!topDims.includes("retencion") && scoresByDim.retencion < 60) {
                        add.push(pickActionsForDim("retencion", 1)[0]);
                    }
                    if (!topDims.includes("metricas") && scoresByDim.metricas < 60) {
                        add.push(pickActionsForDim("metricas", 1)[0]);
                    }
                    tasks = [...tasks, ...add].filter(Boolean);
                }

                plan.push({
                    label: b.label,
                    focus: `${DIM_LABELS[b.dim]} • ${b.extra}`,
                    desc:
                        `Objetivo: convertir mejora en sistema. En esta etapa dejamos procesos y control “funcionando sin ti todo el día”.`,
                    tasks,
                });
            });
        }

        // Render final
        const html = plan
            .map((block) => {
                const tasksHtml = block.tasks.map(renderTask).join("");
                return `
          <div class="planblock">
            <div class="planblock__head">
              <div class="planblock__left">
                <div class="planblock__label">${escapeHTML(block.label)}</div>
                <div class="planblock__focus">${escapeHTML(block.focus)}</div>
              </div>
            </div>
            <div class="planblock__desc">${escapeHTML(block.desc)}</div>
            <div class="planblock__tasks">${tasksHtml}</div>
          </div>
        `;
            })
            .join("");

        return html;
    }

    /* ---------------------------
       Scores
    --------------------------- */
    function getRawAnswers() {
        const raw = {};
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            const name = `q${i}`;
            const checked = $(`input[name="${name}"]:checked`, quiz);
            raw[name] = checked ? toNumber(checked.value) : null;
        }
        return raw;
    }

    function isComplete(raw) {
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            if (raw[`q${i}`] === null) return false;
        }
        return true;
    }

    function computeScores(raw) {
        // Convertimos cada respuesta 1..5 a 0..100.
        const normalized = {};
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            const key = `q${i}`;
            const v = raw[key];
            normalized[key] = v === null ? null : normalize1to5(v);
        }

        // Score por dimensión = promedio simple de preguntas en esa dimensión
        const dimScores = {};
        for (const dimKey of Object.keys(DIM_QUESTIONS)) {
            const qs = DIM_QUESTIONS[dimKey];
            const vals = qs.map((q) => normalized[q]).filter((x) => x !== null);
            const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            dimScores[dimKey] = avg;
        }

        // Total ponderado
        let total = 0;
        for (const dimKey of Object.keys(DIM_WEIGHTS)) {
            total += dimScores[dimKey] * DIM_WEIGHTS[dimKey];
        }

        const flags = computeFlags(raw);
        const penalty = computePenalty(flags.length);
        const totalAfterPenalty = clamp(total + penalty, 0, 100);

        return {
            normalized,
            dimScores,
            total,
            totalAfterPenalty,
            flags,
            penalty,
        };
    }

    function topPriorities(dimScores) {
        // Ordena de menor a mayor
        const entries = Object.entries(dimScores)
            .map(([k, v]) => ({ key: k, score: v }))
            .sort((a, b) => a.score - b.score);

        return entries.slice(0, 3);
    }

    /* ---------------------------
       Render results
    --------------------------- */
    function renderResults(calc) {
        const { dimScores, totalAfterPenalty, flags } = calc;

        const level = levelFromScore(totalAfterPenalty);
        const prios = topPriorities(dimScores);

        // KPI / general
        scoreTotalEl.textContent = `${round0(totalAfterPenalty)}`;
        scoreLevelEl.textContent = `Nivel: ${level}`;
        flagsCountEl.textContent = `${flags.length}`;
        prio1KPI.textContent = DIM_LABELS[prios[0].key];

        // Dim scores
        sOferta.textContent = `${round0(dimScores.oferta)}`;
        sTrafico.textContent = `${round0(dimScores.trafico)}`;
        sConversion.textContent = `${round0(dimScores.conversion)}`;
        sRetencion.textContent = `${round0(dimScores.retencion)}`;
        sOperacion.textContent = `${round0(dimScores.operacion)}`;
        sMetricas.textContent = `${round0(dimScores.metricas)}`;

        // Diagnóstico general largo
        const general = generalDiagnosisText(level, totalAfterPenalty, flags, state.route);

        // Añadimos mini-insights por dimensión (para que sea “complementario y coherente”)
        const dimsInsightHtml = Object.keys(DIM_LABELS)
            .map((k) => `<p class="resulttext">${dimensionInsight(k, dimScores[k], state.route)}</p>`)
            .join("");

        // Añadimos flags si existen (explicación)
        const flagsHtml =
            flags.length === 0
                ? `<p class="resulttext"><strong>Banderas rojas:</strong> no detectamos banderas críticas. Eso es una muy buena señal: tu sistema no está drenando ventas por errores básicos.</p>`
                : `
          <p class="resulttext"><strong>Banderas rojas detectadas:</strong> estas no son “regaños”, son fugas que tienden a drenar ventas hoy (no en teoría).</p>
          <ul class="flaglist">
            ${flags
                    .map(
                        (f) =>
                            `<li><strong>${escapeHTML(f.title)}:</strong> ${escapeHTML(f.why)}</li>`
                    )
                    .join("")}
          </ul>
        `;

        diagGeneralEl.innerHTML = `
      <p class="resulttext">${escapeHTML(general).replaceAll("\n\n", "</p><p class='resulttext'>")}</p>
      ${flagsHtml}
      <div class="divider"></div>
      <h5 class="subhead">Lectura por dimensión</h5>
      ${dimsInsightHtml}
    `;

        // Prioridades (Top 3)
        const [p1, p2, p3] = prios;

        prioTitle1.textContent = `${DIM_LABELS[p1.key]} (${round0(p1.score)}/100)`;
        prioTitle2.textContent = `${DIM_LABELS[p2.key]} (${round0(p2.score)}/100)`;
        prioTitle3.textContent = `${DIM_LABELS[p3.key]} (${round0(p3.score)}/100)`;

        prioText1.innerHTML = priorityNarrative(p1.key, p1.score, flags, state.route);
        prioText2.innerHTML = priorityNarrative(p2.key, p2.score, flags, state.route);
        prioText3.innerHTML = priorityNarrative(p3.key, p3.score, flags, state.route);

        // Plan 7 y 15 días
        plan7El.innerHTML = generatePlan(7, [p1.key, p2.key, p3.key], dimScores, flags, state.route);
        plan15El.innerHTML = generatePlan(15, [p1.key, p2.key, p3.key], dimScores, flags, state.route);

        // Mostrar results
        results.hidden = false;
        results.scrollIntoView({ behavior: "smooth", block: "start" });

        // Update preview top
        previewScore.textContent = `${round0(totalAfterPenalty)}`;
        previewLevel.textContent = level;
        previewP1.textContent = DIM_LABELS[p1.key];
        previewP2.textContent = DIM_LABELS[p2.key];
        previewP3.textContent = DIM_LABELS[p3.key];
    }

    /* ---------------------------
       Progress UI
    --------------------------- */
    function updateProgress() {
        const raw = getRawAnswers();
        const answered = Object.values(raw).filter((v) => v !== null).length;
        const pct = Math.round((answered / TOTAL_QUESTIONS) * 100);

        progressFill.style.width = `${pct}%`;
        progressText.textContent = `${pct}% completado`;
        questionsLeft.textContent = `${TOTAL_QUESTIONS - answered} preguntas`;

        // Optional: update aria
        const pb = $(".progress__bar");
        if (pb) pb.setAttribute("aria-valuenow", String(pct));

        // Si está completo, muestra preview “tentativo” (sin textos largos)
        if (answered === TOTAL_QUESTIONS) {
            const calc = computeScores(raw);
            const level = levelFromScore(calc.totalAfterPenalty);
            const prios = topPriorities(calc.dimScores);

            previewScore.textContent = `${round0(calc.totalAfterPenalty)}`;
            previewLevel.textContent = level;

            previewP1.textContent = DIM_LABELS[prios[0].key];
            previewP2.textContent = DIM_LABELS[prios[1].key];
            previewP3.textContent = DIM_LABELS[prios[2].key];
        } else {
            previewScore.textContent = "—";
            previewLevel.textContent = "—";
            previewP1.textContent = "—";
            previewP2.textContent = "—";
            previewP3.textContent = "—";
        }
    }

    /* ---------------------------
       Route switching
    --------------------------- */
    function setRoute(routeKey) {
        state.route = routeKey;

        routeEcom.classList.toggle("is-active", routeKey === "ecom");
        routeServices.classList.toggle("is-active", routeKey === "services");

        routeEcom.setAttribute("aria-selected", routeKey === "ecom" ? "true" : "false");
        routeServices.setAttribute("aria-selected", routeKey === "services" ? "true" : "false");

        // WhatsApp CTAs (placeholder link)
        const msg = ROUTE_COPY[routeKey].whatsappText;
        const wa = buildWhatsAppLink(msg);
        ctaWhatsapp.href = wa;
        ctaWhatsappTop.href = wa;

        // En futuras iteraciones: aquí podemos ajustar 2–4 preguntas o ejemplos según ruta
    }

    function buildWhatsAppLink(message) {
        // Sin número por ahora: dejamos wa.me con texto listo.
        // Cuando tengas número, lo ponemos: https://wa.me/57XXXXXXXXXX?text=...
        const encoded = encodeURIComponent(message);
        return `https://wa.me/?text=${encoded}`;
    }

    /* ---------------------------
       Mobile menu
    --------------------------- */
    const btnMenu = $("#btn-menu");
    const mobileMenu = $("#mobile-menu");

    function toggleMenu() {
        const isOpen = btnMenu.getAttribute("aria-expanded") === "true";
        btnMenu.setAttribute("aria-expanded", isOpen ? "false" : "true");
        mobileMenu.hidden = isOpen;
    }

    /* ---------------------------
       Visual selection fallback (para navegadores sin :has)
       - Al cambiar un input, agregamos clase is-checked al label correspondiente
    --------------------------- */
    function applyCheckedClasses() {
        // Limpia
        $$(".scale label, .pillchoice", quiz).forEach((lbl) => lbl.classList.remove("is-checked"));

        // Marca
        $$("input[type='radio']:checked", quiz).forEach((inp) => {
            const label = inp.closest("label");
            if (label) label.classList.add("is-checked");
        });
    }

    /* ---------------------------
       Inject minimal CSS for tasks/plan blocks (complemento)
       (Para no tocar tu styles.css ahora; es pequeño)
    --------------------------- */
    function injectPlanStyles() {
        const css = `
      .divider{ height:1px; background: rgba(255,255,255,.08); margin: 14px 0; }
      .subhead{ margin: 10px 0 8px; font-size: 14px; letter-spacing: -.1px; opacity: .92; }
      .flaglist{ margin: 10px 0 0; padding-left: 18px; color: rgba(255,255,255,.74); line-height: 1.6; }
      .planblock{ border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.18); border-radius: 18px; padding: 12px; }
      .planblock + .planblock{ margin-top: 10px; }
      .planblock__head{ display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
      .planblock__label{ font-weight: 900; font-size: 12px; color: rgba(255,255,255,.70); }
      .planblock__focus{ margin-top: 4px; font-weight: 900; letter-spacing: -.1px; }
      .planblock__desc{ margin-top: 8px; color: rgba(255,255,255,.70); font-size: 13px; line-height: 1.55; }
      .planblock__tasks{ display:grid; gap: 10px; margin-top: 10px; }
      .task{ border: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.03); border-radius: 16px; padding: 12px; }
      .task__top{ display:flex; justify-content:space-between; gap: 10px; align-items:flex-start; }
      .task__title{ font-weight: 900; letter-spacing: -.1px; }
      .task__meta{ display:flex; gap: 8px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
      .pillmeta{ font-size: 11px; font-weight: 900; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.22); color: rgba(255,255,255,.80); }
      .pillmeta--gold{ border-color: rgba(198,168,94,.28); background: rgba(198,168,94,.12); }
      .task__list{ margin: 10px 0 0; padding-left: 18px; color: rgba(255,255,255,.74); line-height: 1.6; font-size: 13px; }
      .task__out{ margin-top: 10px; color: rgba(255,255,255,.76); font-size: 13px; line-height: 1.55; }
      /* Fallback selection class */
      .scale label.is-checked, .pillchoice.is-checked{
        border-color: rgba(198,168,94,.55) !important;
        background: rgba(198,168,94,.12) !important;
        color: rgba(255,255,255,.94) !important;
        box-shadow: 0 10px 24px rgba(0,0,0,.28);
      }
    `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* ---------------------------
       Events
    --------------------------- */
    function onCalc() {
        const raw = getRawAnswers();
        if (!isComplete(raw)) {
            // Busca la primera sin responder y scrollea hacia ella
            const firstMissing = Object.entries(raw).find(([, v]) => v === null);
            if (firstMissing) {
                const key = firstMissing[0];
                const el = $(`[data-q="${key}"]`, quiz);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            alert("Te faltan preguntas por responder. Completa las 24 para calcular el diagnóstico.");
            return;
        }

        const calc = computeScores(raw);
        renderResults(calc);
    }

    function onReset() {
        // Desmarca todo
        $$("input[type='radio']", quiz).forEach((inp) => (inp.checked = false));
        applyCheckedClasses();
        updateProgress();

        results.hidden = true;

        // Preview reset
        previewScore.textContent = "—";
        previewLevel.textContent = "—";
        previewP1.textContent = "—";
        previewP2.textContent = "—";
        previewP3.textContent = "—";

        // Scroll al inicio del radar
        $("#radar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* ---------------------------
       Init
    --------------------------- */
    function init() {
        injectPlanStyles();

        // Inicializa referencias DOM aquí (después de DOMContentLoaded)
        quiz = $("#quiz");
        results = $("#results");

        btnCalc = $("#btn-calc");
        btnReset = $("#btn-reset");

        progressFill = $("#progress-fill");
        progressText = $("#progress-text");
        questionsLeft = $("#questions-left");

        routeEcom = $("#route-ecom");
        routeServices = $("#route-services");

        previewScore = $("#preview-score");
        previewLevel = $("#preview-level");
        previewP1 = $("#preview-priority-1");
        previewP2 = $("#preview-priority-2");
        previewP3 = $("#preview-priority-3");

        scoreTotalEl = $("#score-total");
        scoreLevelEl = $("#score-level");
        flagsCountEl = $("#flags-count");
        prio1KPI = $("#prio-1");

        diagGeneralEl = $("#diag-general");

        sOferta = $("#s-oferta");
        sTrafico = $("#s-trafico");
        sConversion = $("#s-conversion");
        sRetencion = $("#s-retencion");
        sOperacion = $("#s-operacion");
        sMetricas = $("#s-metricas");

        prioTitle1 = $("#prio-title-1");
        prioTitle2 = $("#prio-title-2");
        prioTitle3 = $("#prio-title-3");
        prioText1 = $("#prio-text-1");
        prioText2 = $("#prio-text-2");
        prioText3 = $("#prio-text-3");

        plan7El = $("#plan-7");
        plan15El = $("#plan-15");

        ctaWhatsappTop = $("#cta-whatsapp-top");
        ctaWhatsapp = $("#cta-whatsapp");

        // Defaults
        setRoute("ecom");
        updateProgress();
        applyCheckedClasses();

        // Menu
        if (btnMenu && mobileMenu) {
            btnMenu.addEventListener("click", toggleMenu);
            // Cierra al click en cualquier link
            $$("#mobile-menu a").forEach((a) => {
                a.addEventListener("click", () => {
                    btnMenu.setAttribute("aria-expanded", "false");
                    mobileMenu.hidden = true;
                });
            });
        }

        // Route
        if (routeEcom) routeEcom.addEventListener("click", () => setRoute("ecom"));
        if (routeServices) routeServices.addEventListener("click", () => setRoute("services"));

        // Form interactions
        if (quiz) {
            quiz.addEventListener("change", () => {
                applyCheckedClasses();
                updateProgress();
            });
        }

        if (btnCalc) btnCalc.addEventListener("click", onCalc);
        if (btnReset) btnReset.addEventListener("click", onReset);

        // CTA fallback
        ctaWhatsappTop.href = buildWhatsAppLink(ROUTE_COPY.ecom.whatsappText);
        ctaWhatsapp.href = buildWhatsAppLink(ROUTE_COPY.ecom.whatsappText);
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        // Ya estamos después del parseo — inicializar de inmediato
        init();
    }
