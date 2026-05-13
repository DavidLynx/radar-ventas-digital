(() => {
  "use strict";

  const WHATSAPP_NUMBER = "";
  const PREMIUM_MESSAGE =
    "Hola, quiero revisar el diagnóstico de Radar de Ventas Digital y conocer cómo Lynx Visual Division puede ayudarme a implementar mejoras.";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const DIMENSIONS = [
    { key: "oferta", label: "Oferta", weight: 0.10, questions: [1, 2, 3, 4] },
    { key: "trafico", label: "Tráfico", weight: 0.20, questions: [5, 6, 7, 8] },
    { key: "conversion", label: "Conversión", weight: 0.25, questions: [9, 10, 11, 12, 13] },
    { key: "retencion", label: "Retención", weight: 0.10, questions: [14, 15, 16] },
    { key: "operacion", label: "Operación", weight: 0.15, questions: [17, 18, 19, 20] },
    { key: "metricas", label: "Métricas", weight: 0.20, questions: [21, 22, 23, 24] },
  ];

  const DIMENSION_LABELS = {
    es: {
      oferta: "Oferta & Claridad",
      trafico: "Tráfico & Adquisición",
      conversion: "Conversión & Confianza",
      retencion: "Retención & Experiencia",
      operacion: "Operación & Entrega",
      metricas: "Métricas & Control",
    },
    en: {
      oferta: "Offer & Clarity",
      trafico: "Traffic & Acquisition",
      conversion: "Conversion & Trust",
      retencion: "Retention & Experience",
      operacion: "Operations & Delivery",
      metricas: "Metrics & Control",
    },
  };

  const DIAG = {
    es: {
      route: { ecom: "e-commerce", services: "servicios digitales" },
      levelFrame: {
        Emergente: "El sistema todavía está en una etapa inicial: hay piezas comerciales funcionando, pero no están conectadas con suficiente claridad para sostener crecimiento predecible.",
        Inestable: "El negocio ya tiene señales de tracción, pero el sistema depende demasiado de esfuerzo manual, intuición o canales que no están completamente controlados.",
        "En crecimiento": "La base comercial es funcional y ya permite tomar decisiones con más orden, aunque todavía existen fugas que pueden limitar la escalabilidad.",
        Escalable: "El sistema muestra una base sólida para escalar: la oferta, la conversión, la operación y las métricas están suficientemente alineadas para crecer con menos improvisación.",
      },
      scoreMeaning(score) {
        if (score < 45) return "Este puntaje indica que antes de invertir más en tráfico o campañas conviene ordenar la propuesta, reducir fricción y crear controles mínimos. El riesgo principal es intentar acelerar un sistema que todavía pierde oportunidades por claridad, confianza u operación.";
        if (score < 65) return "Este puntaje muestra que existen activos útiles, pero también fugas visibles. El crecimiento puede ocurrir, aunque probablemente llegue con altibajos si no se priorizan las dimensiones más débiles.";
        if (score < 82) return "Este puntaje refleja un negocio con estructura aprovechable. El foco debe pasar de improvisar mejoras a convertirlas en rutinas, tableros y experimentos medibles.";
        return "Este puntaje sugiere que el negocio puede avanzar hacia optimización fina: mejorar ratios, automatizar seguimiento, documentar procesos y usar datos para capturar incrementos de rendimiento.";
      },
      dim: {
        oferta: {
          low: "La propuesta no está suficientemente diferenciada o no se entiende con velocidad. En este punto, el cliente puede compararte por precio porque no encuentra una razón concreta para elegirte.",
          mid: "La oferta tiene elementos claros, pero todavía necesita una promesa más defendible, ejemplos visibles y una diferencia que se pueda explicar sin esfuerzo.",
          high: "La oferta se entiende y tiene buena base de diferenciación. El siguiente paso es usar esa claridad en anuncios, landing pages, WhatsApp, propuestas y contenido para que todo el sistema venda lo mismo.",
        },
        trafico: {
          low: "La adquisición depende demasiado de acciones sueltas. Si el flujo de visitas o leads cambia cada semana, el negocio pierde capacidad de planear caja, inventario o agenda comercial.",
          mid: "Hay canales con potencial, pero la intención todavía no está totalmente ordenada. Conviene separar contenido para atraer, educar, convertir y reactivar, y medir cuál realmente mueve ventas.",
          high: "La adquisición tiene una base saludable. Ahora la prioridad es proteger el canal principal, documentar aprendizajes y usar campañas o contenido para alimentar un embudo más medible.",
        },
        conversion: {
          low: "La conversión está dejando dinero sobre la mesa. Cuando faltan pruebas, claridad de pagos, velocidad de respuesta o condiciones simples, el cliente no siempre reclama: muchas veces se va.",
          mid: "La confianza existe, pero hay fricción en puntos concretos. Mejorar testimonios, tiempos de respuesta, proceso de compra y objeciones puede producir impacto rápido sin aumentar tráfico.",
          high: "La experiencia de conversión es fuerte. El siguiente nivel está en automatizar seguimiento, probar mensajes y revisar microfricciones que afecten el cierre en campañas o temporadas altas.",
        },
        retencion: {
          low: "El negocio está capturando poco valor después de la venta. Sin seguimiento, base de datos o recompra estructurada, cada venta obliga a empezar de cero.",
          mid: "Hay señales de postventa o recompra, pero no funcionan como sistema. Conviene convertirlas en una cadencia simple: contacto, valor, oferta y medición.",
          high: "La retención tiene buena base. Puedes avanzar hacia programas de referidos, ofertas recurrentes, mantenimiento, bundles o comunicación segmentada por tipo de cliente.",
        },
        operacion: {
          low: "La operación puede convertirse en cuello de botella. Si duplicar ventas genera caos, retrasos o errores, el crecimiento no solo suma ingresos: también amplifica problemas.",
          mid: "La entrega funciona, pero depende de control manual o conocimiento no documentado. Es momento de convertir el proceso en pasos visibles, responsables y alertas.",
          high: "La operación soporta crecimiento razonable. El foco pasa a documentar estándares, reducir variabilidad y preparar capacidad para picos sin sacrificar experiencia.",
        },
        metricas: {
          low: "El negocio está tomando decisiones con poca visibilidad. Sin margen, CAC, retorno, tablero y revisión semanal, las fugas aparecen tarde y cuestan más.",
          mid: "Existen algunos datos, pero todavía no guían decisiones con disciplina. Conviene definir pocas métricas críticas y revisarlas con acciones concretas.",
          high: "El control numérico es sólido. El siguiente paso es usar métricas para priorizar experimentos, detectar tendencias temprano y conectar cada acción comercial con impacto.",
        },
      },
      flags: {
        slow_lead: "Respuesta lenta a leads: cuando un lead espera demasiado, baja la intención de compra y aumenta la probabilidad de que compare o se enfríe.",
        friction: "Fricción en el proceso: demasiados pasos, dudas o condiciones poco claras hacen que el cliente abandone aunque sí tenga interés.",
        delivery: "Entrega inconsistente: prometer más de lo que la operación puede cumplir daña reputación, recompra y referidos.",
        scale_collapse: "Riesgo de colapso al crecer: si duplicar ventas rompe el sistema, antes de escalar conviene ordenar capacidad, responsables y flujo de trabajo.",
        margin: "Margen no medido: vender sin entender margen puede producir volumen con poca rentabilidad real.",
      },
      noFlags: "No aparecieron banderas rojas críticas. Eso no significa que no existan mejoras, sino que las alertas más sensibles del sistema no cruzaron el umbral de riesgo.",
      priorityIntro: "Esta prioridad aparece porque está entre las dimensiones más bajas del radar. Atacarla primero reduce fugas antes de empujar más tráfico o inversión.",
      cta: "Con Lynx Visual Division, este diagnóstico puede convertirse en implementación real: embudo, automatización, contenido, métricas, landing pages y sistemas digitales conectados.",
    },
    en: {
      route: { ecom: "e-commerce", services: "digital services" },
      levelFrame: {
        Emerging: "The system is still in an early stage: there are commercial pieces working, but they are not connected clearly enough to support predictable growth.",
        Unstable: "The business already shows traction, but the system still depends too much on manual effort, intuition or channels that are not fully controlled.",
        Growing: "The commercial base is functional and can support better decisions, although several leaks may still limit scalability.",
        Scalable: "The system shows a strong base for scaling: offer, conversion, operations and metrics are aligned enough to grow with less improvisation.",
      },
      scoreMeaning(score) {
        if (score < 45) return "This score means that before investing more in traffic or campaigns, the business should organize the offer, reduce friction and create minimum controls. The main risk is accelerating a system that still loses opportunities through clarity, trust or operations.";
        if (score < 65) return "This score shows useful assets, but also visible leaks. Growth can happen, yet it will likely be inconsistent unless the weakest dimensions are prioritized.";
        if (score < 82) return "This score reflects a business with a usable structure. The focus should move from improvised improvements to routines, dashboards and measurable experiments.";
        return "This score suggests the business can move into fine optimization: improving ratios, automating follow-up, documenting processes and using data to capture incremental performance.";
      },
      dim: {
        oferta: {
          low: "The offer is not differentiated or quickly understood enough. At this point, customers may compare you mainly by price because they cannot see a concrete reason to choose you.",
          mid: "The offer has clear elements, but it still needs a more defensible promise, visible proof and a difference that can be explained without effort.",
          high: "The offer is understandable and has a healthy differentiation base. The next step is to carry that clarity into ads, landing pages, WhatsApp, proposals and content.",
        },
        trafico: {
          low: "Acquisition depends too much on scattered actions. If visits or leads change every week, the business loses the ability to plan cash flow, inventory or sales capacity.",
          mid: "There are channels with potential, but the intention is not fully organized yet. Separate content for attraction, education, conversion and reactivation, then measure what actually moves revenue.",
          high: "Acquisition has a healthy base. Now protect the main channel, document learnings and use campaigns or content to feed a more measurable funnel.",
        },
        conversion: {
          low: "Conversion is leaving money on the table. When proof, payment clarity, response speed or simple terms are missing, customers often do not complain: they leave.",
          mid: "Trust exists, but there is friction in specific points. Improving testimonials, response time, purchase flow and objections can create impact without increasing traffic.",
          high: "The conversion experience is strong. The next level is automating follow-up, testing messages and reviewing micro-frictions that affect closing during campaigns or high-demand periods.",
        },
        retencion: {
          low: "The business captures too little value after the sale. Without follow-up, a customer database or structured repeat purchase, every sale forces you to start from zero.",
          mid: "There are signs of post-sale or repeat purchase, but they are not a system yet. Turn them into a simple cadence: contact, value, offer and measurement.",
          high: "Retention has a good base. You can move toward referral programs, recurring offers, maintenance, bundles or segmented communication by customer type.",
        },
        operacion: {
          low: "Operations may become the bottleneck. If doubling sales creates chaos, delays or errors, growth does not only add revenue: it amplifies problems.",
          mid: "Delivery works, but it depends on manual control or undocumented knowledge. Turn the process into visible steps, owners and alerts.",
          high: "Operations can support reasonable growth. The focus becomes documenting standards, reducing variability and preparing capacity for peaks without sacrificing experience.",
        },
        metricas: {
          low: "The business is making decisions with limited visibility. Without margin, CAC, return, dashboard and weekly review, leaks appear late and cost more.",
          mid: "Some data exists, but it still does not guide decisions with discipline. Define a few critical metrics and review them with concrete actions.",
          high: "Numerical control is solid. The next step is using metrics to prioritize experiments, detect trends early and connect every commercial action with impact.",
        },
      },
      flags: {
        slow_lead: "Slow lead response: when a lead waits too long, purchase intent drops and the chance of comparison or cooling off rises.",
        friction: "Process friction: too many steps, doubts or unclear terms make customers abandon even when they are interested.",
        delivery: "Inconsistent delivery: promising more than operations can fulfill damages reputation, repeat purchase and referrals.",
        scale_collapse: "Scale-collapse risk: if doubling sales breaks the system, organize capacity, owners and workflow before scaling.",
        margin: "Margin not measured: selling without understanding margin can create volume with little real profitability.",
      },
      noFlags: "No critical red flags appeared. That does not mean there are no improvements; it means the system’s most sensitive alerts did not cross the risk threshold.",
      priorityIntro: "This priority appears because it is among the lowest radar dimensions. Solving it first reduces leakage before pushing more traffic or spend.",
      cta: "With Lynx Visual Division, this audit can become real implementation: funnel, automation, content, metrics, landing pages and connected digital systems.",
    },
  };

  const LEAK_COPY = {
    oferta: {
      title: "Oferta poco diferenciada",
      text: "Tu propuesta necesita ser más clara, concreta y defendible frente a opciones similares.",
      plan7: "Reescribe tu promesa comercial en una frase: qué vendes, para quién, resultado y prueba.",
      plan15: "Crea una matriz de diferenciadores con evidencia: casos, métricas, garantía, tiempos o especialización.",
    },
    trafico: {
      title: "Adquisición poco predecible",
      text: "El crecimiento depende demasiado de picos, intuición o esfuerzos sueltos.",
      plan7: "Define un canal principal, una oferta de entrada y una métrica semanal de leads o ventas.",
      plan15: "Construye un calendario de contenido/campañas con intención: atraer, educar, convertir y reactivar.",
    },
    conversion: {
      title: "Fricción en conversión",
      text: "Hay oportunidades para bajar dudas, acelerar respuestas y facilitar el cierre.",
      plan7: "Audita prueba social, métodos de pago, condiciones y tiempos de respuesta visibles.",
      plan15: "Optimiza landing, WhatsApp o checkout con mensajes de confianza y pasos de compra más simples.",
    },
    retencion: {
      title: "Retención subutilizada",
      text: "La recompra, postventa y referidos todavía no están trabajando como sistema.",
      plan7: "Crea una lista de clientes anteriores y envía un seguimiento simple con valor real.",
      plan15: "Diseña una oferta de recompra, mantenimiento, bundle o upgrade con cadencia mensual.",
    },
    operacion: {
      title: "Operación vulnerable",
      text: "Más ventas podrían presionar tiempos, calidad o control interno.",
      plan7: "Documenta el proceso mínimo desde lead/pedido hasta entrega y detecta el paso más frágil.",
      plan15: "Crea un SOP liviano con responsables, tiempos, estados y alertas para evitar sorpresas.",
    },
    metricas: {
      title: "Métricas insuficientes",
      text: "Sin tablero claro, el negocio decide tarde y paga fugas invisibles.",
      plan7: "Monta un tablero mínimo con ventas, leads, conversión, costos, margen y seguimiento semanal.",
      plan15: "Conecta decisiones a números: objetivo, métrica, acción, responsable y revisión.",
    },
  };

  const I18N = {
    es: {
      htmlLang: "es",
      navHow: "Cómo funciona",
      navTools: "Herramientas",
      navStart: "Iniciar diagnóstico",
      navPremium: "Agendar Premium",
      heroPill: "Diagnóstico rápido • Plan 7 y 15 días • Sin humo",
      heroTitle: 'Detecta <span class="gold">fugas de ventas</span> y ordena tu crecimiento digital.',
      heroLead:
        "Responde 24 preguntas inteligentes y obtén un <strong>score 0–100</strong>, un análisis por dimensiones y un plan claro para vender más con operación y métricas.",
      howTitle: "Cómo funciona",
      radarIntro:
        "Responde honestamente. Si “suena fuerte”, es porque el negocio se vuelve fuerte cuando soporta presión.",
      routeTitle: "Selecciona tu ruta",
      calc: "Calcular diagnóstico",
      reset: "Reiniciar",
      resultsTitle: "Tu diagnóstico",
      toolsTitle: "Más herramientas de Lynx Visual Division",
      toolsLead: "Un ecosistema visual de utilidades, prototipos y micro-apps para marcas, contenido y sistemas digitales.",
      toolsCta: "Trabajar con Lynx Visual Division",
      openTool: "Abrir herramienta",
      faqLead: "Respuestas claras para que una empresa no se “asuste” y para que se sienta profesional.",
      loginTitle: "Login con Google en construcción.",
      loginCopy:
        "Muy pronto podrás guardar diagnósticos, comparar avances y administrar varias empresas desde tu panel de Lynx Visual Division.",
      loginOk: "Entendido",
      analyzing: "Analizando sistema comercial...",
      analysisBrand: "Lynx Visual Division intelligence layer",
      scanSteps: ["Escaneando oferta...", "Detectando fugas...", "Calculando prioridades...", "Generando plan..."],
      pdf: "Descargar reporte PDF",
      whatsapp: "Enviar por WhatsApp",
      premiumDiag: "Agenda diagnóstico premium",
      ctaTitle: "¿Quieres convertir este diagnóstico en implementación real?",
      ctaText:
        "Descarga el PDF, revísalo con tu equipo y envíanos el reporte por WhatsApp. Lynx Visual Division puede ayudarte a transformar estas fugas en un plan de acción: embudo, automatización, contenido, métricas, landing pages y sistemas digitales.",
      localNote: "Tu información no se envía a ningún servidor (modo estático). Todo corre en tu navegador.",
      popupBlocked: "Tu navegador bloqueó el popup. Permite popups para generar el PDF.",
      needResults: "Primero calcula el diagnóstico para generar el PDF.",
      chartNote: "El gráfico se actualiza automáticamente al calcular (Chart.js).",
      resultHeadings: {
        general: "Lectura general",
        radar: "Radar por dimensión",
        priorities: "Top 3 fugas (prioridades)",
        dimensions: "Análisis por dimensión",
        redFlags: "Banderas rojas detectadas",
        plan7: "Plan de 7 días",
        plan15: "Plan de 15 días",
      },
      tools: [
        { badge: "Marca", desc: "Generador visual de códigos QR para marcas, campañas y piezas digitales." },
        { badge: "Productividad", desc: "Sistema gamificado para hábitos, foco personal y reducción de ciclos negativos." },
        { badge: "Gaming", desc: "Herramienta visual para dados RPG con estética cyberpunk y utilidad para partidas." },
        { badge: "Prototype", desc: "Prototipo visual de experiencia casino/cyberpunk con coleccionables digitales." },
        { badge: "Experiencia", desc: "Experiencia interactiva de astrología y lectura visual personalizada." },
        { badge: "Contenido", desc: "Generador de comentarios simulados para contenido, prototipos y campañas." },
      ],
    },
    en: {
      htmlLang: "en",
      navHow: "How it works",
      navTools: "Tools",
      navStart: "Start audit",
      navPremium: "Book Premium",
      heroPill: "Fast audit • 7 and 15-day plan • No fluff",
      heroTitle: 'Find <span class="gold">sales leaks</span> and organize your digital growth.',
      heroLead:
        "Answer 24 smart questions and get a <strong>0–100 score</strong>, dimension analysis and a practical plan to sell more with better operations and metrics.",
      howTitle: "How it works",
      radarIntro:
        "Answer honestly. A business gets stronger when its system can withstand pressure.",
      routeTitle: "Choose your route",
      calc: "Calculate audit",
      reset: "Reset",
      resultsTitle: "Your audit",
      toolsTitle: "More tools by Lynx Visual Division",
      toolsLead: "A visual ecosystem of utilities, prototypes and micro-apps for brands, content and digital systems.",
      toolsCta: "Work with Lynx Visual Division",
      openTool: "Open tool",
      faqLead: "Clear answers so the tool feels professional, direct and useful.",
      loginTitle: "Google login under construction.",
      loginCopy:
        "Soon you’ll be able to save audits, compare progress and manage multiple businesses from your Lynx Visual Division dashboard.",
      loginOk: "Got it",
      analyzing: "Analyzing commercial system...",
      analysisBrand: "Lynx Visual Division intelligence layer",
      scanSteps: ["Scanning offer...", "Detecting leaks...", "Calculating priorities...", "Generating plan..."],
      pdf: "Download PDF report",
      whatsapp: "Send via WhatsApp",
      premiumDiag: "Book premium audit",
      ctaTitle: "Want to turn this audit into real implementation?",
      ctaText:
        "Download the PDF, review it with your team and send us the report on WhatsApp. Lynx Visual Division can help turn these leaks into an action plan: funnel, automation, content, metrics, landing pages and digital systems.",
      localNote: "Your information is not sent to any server. Everything runs locally in your browser.",
      popupBlocked: "Your browser blocked the popup. Allow popups to generate the PDF.",
      needResults: "Calculate the audit first to generate the PDF.",
      chartNote: "The chart updates automatically after calculating (Chart.js).",
      resultHeadings: {
        general: "General analysis",
        radar: "Dimension radar",
        priorities: "Top 3 leaks (priorities)",
        dimensions: "Dimension analysis",
        redFlags: "Detected red flags",
        plan7: "7-day plan",
        plan15: "15-day plan",
      },
      tools: [
        { badge: "Brand", desc: "Visual QR code generator for brands, campaigns and digital assets." },
        { badge: "Productivity", desc: "Gamified system for habits, personal focus and reducing negative cycles." },
        { badge: "Gaming", desc: "Visual RPG dice tool with a cyberpunk look and practical table utility." },
        { badge: "Prototype", desc: "Visual casino/cyberpunk experience prototype with digital collectibles." },
        { badge: "Experience", desc: "Interactive astrology experience with personalized visual readings." },
        { badge: "Content", desc: "Simulated comment generator for content, prototypes and campaigns." },
      ],
    },
  };

  let currentLang = localStorage.getItem("radar-lang") || "es";
  let currentRoute = "ecom";
  let lastResult = null;

  function selectedValue(q) {
    const input = $(`input[name="q${q}"]:checked`);
    return input ? Number(input.value) : null;
  }

  function answeredCount() {
    let count = 0;
    for (let i = 1; i <= 24; i += 1) {
      if (selectedValue(i) !== null) count += 1;
    }
    return count;
  }

  function updateProgress() {
    const answered = answeredCount();
    const pct = Math.round((answered / 24) * 100);
    const progressText = $("#progress-text");
    const questionsLeft = $("#questions-left");
    const fill = $("#progress-fill");
    const bar = $(".progress__bar");

    if (progressText) progressText.textContent = `${pct}% ${currentLang === "en" ? "complete" : "completado"}`;
    if (questionsLeft) questionsLeft.textContent = `${24 - answered} ${currentLang === "en" ? "left" : "pendientes"}`;
    if (fill) fill.style.width = `${pct}%`;
    if (bar) bar.setAttribute("aria-valuenow", String(pct));
  }

  function getLevel(score) {
    if (score < 45) return { name: currentLang === "en" ? "Emerging" : "Emergente", cls: "level-emergente" };
    if (score < 65) return { name: currentLang === "en" ? "Unstable" : "Inestable", cls: "level-inestable" };
    if (score < 82) return { name: currentLang === "en" ? "Growing" : "En crecimiento", cls: "level-crecimiento" };
    return { name: currentLang === "en" ? "Scalable" : "Escalable", cls: "level-escalable" };
  }

  function dimLabel(dimKey, lang = currentLang) {
    return DIMENSION_LABELS[lang][dimKey] || dimKey;
  }

  function scoreBand(score) {
    if (score < 45) return "low";
    if (score < 75) return "mid";
    return "high";
  }

  function routeLabel(route = currentRoute, lang = currentLang) {
    return DIAG[lang].route[route] || route;
  }

  function scoreDimension(dim) {
    const values = dim.questions.map(selectedValue).filter((v) => v !== null);
    if (values.length !== dim.questions.length) return null;
    const rawAvg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.round(((rawAvg - 1) / 4) * 100);
  }

  function getFlags() {
    const flags = [];
    const add = (code, q, condition, value) => {
      if (condition) flags.push({ code, q, value });
    };
    add("slow_lead", 10, selectedValue(10) !== null && selectedValue(10) <= 2, selectedValue(10));
    add("friction", 13, selectedValue(13) === 1, selectedValue(13));
    add("delivery", 17, selectedValue(17) !== null && selectedValue(17) <= 2, selectedValue(17));
    add("scale_collapse", 20, selectedValue(20) !== null && selectedValue(20) <= 2, selectedValue(20));
    add("margin", 21, selectedValue(21) === 1, selectedValue(21));
    return flags;
  }

  function generalDiagnosisText(level, score, flags, route, lang) {
    const d = DIAG[lang];
    const flagText = flags.length
      ? lang === "en"
        ? `The system also triggered ${flags.length} red flag${flags.length === 1 ? "" : "s"}, so the score includes a penalty for risks that can hurt conversion, delivery or profitability.`
        : `Además, el sistema activó ${flags.length} bandera${flags.length === 1 ? "" : "s"} roja${flags.length === 1 ? "" : "s"}, por eso el score incluye una penalización por riesgos que pueden afectar conversión, entrega o rentabilidad.`
      : d.noFlags;

    if (lang === "en") {
      return `
        <p>Your ${routeLabel(route, lang)} system scored <strong>${score}/100</strong> and is currently classified as <strong>${level.name}</strong>. ${d.levelFrame[level.name]}</p>
        <p>${d.scoreMeaning(score)} This reading is based on your actual answers across offer, acquisition, conversion, retention, operations and metrics, not on a static checklist.</p>
        <p>${flagText} The best next move is to address the three weakest dimensions first, because those are the places where additional traffic, content or sales effort is most likely to leak value.</p>
      `;
    }

    return `
      <p>Tu sistema de ${routeLabel(route, lang)} obtuvo <strong>${score}/100</strong> y queda clasificado como <strong>${level.name}</strong>. ${d.levelFrame[level.name]}</p>
      <p>${d.scoreMeaning(score)} Esta lectura se construye desde tus respuestas reales en oferta, adquisición, conversión, retención, operación y métricas; no desde un texto genérico.</p>
      <p>${flagText} El mejor siguiente movimiento es trabajar primero las tres dimensiones más débiles, porque ahí es donde más se escapa valor cuando intentas vender, pautar o escalar.</p>
    `;
  }

  function dimensionInsight(dimKey, dimScore, route, lang) {
    const d = DIAG[lang];
    const band = scoreBand(dimScore);
    const label = dimLabel(dimKey, lang);
    const routePart = lang === "en"
      ? `For a ${routeLabel(route, lang)} business, this dimension influences how quickly a prospect understands, trusts and moves through the commercial system.`
      : `Para un negocio de ${routeLabel(route, lang)}, esta dimensión afecta qué tan rápido un prospecto entiende, confía y avanza por el sistema comercial.`;
    const action = lang === "en"
      ? `Score: <strong>${dimScore}/100</strong>. ${d.dim[dimKey][band]} ${routePart}`
      : `Score: <strong>${dimScore}/100</strong>. ${d.dim[dimKey][band]} ${routePart}`;
    return `<article class="insight-item"><h5>${label}</h5><p>${action}</p></article>`;
  }

  function priorityNarrative(dimKey, dimScore, flags, route, lang) {
    const d = DIAG[lang];
    const band = scoreBand(dimScore);
    const relatedFlags = flags.filter((flag) => {
      const map = {
        slow_lead: "conversion",
        friction: "conversion",
        delivery: "operacion",
        scale_collapse: "operacion",
        margin: "metricas",
      };
      return map[flag.code] === dimKey;
    });
    const flagNote = relatedFlags.length
      ? relatedFlags.map((flag) => d.flags[flag.code]).join(" ")
      : lang === "en"
        ? "No critical red flag is attached directly to this dimension, so the priority comes mainly from its relative score."
        : "No hay una bandera roja crítica asociada directamente a esta dimensión, así que la prioridad nace principalmente de su score relativo.";
    const routeNote = lang === "en"
      ? `In ${routeLabel(route, lang)}, improving this area should make the rest of the funnel easier to measure and optimize.`
      : `En ${routeLabel(route, lang)}, mejorar esta área debería facilitar que el resto del embudo sea más medible y optimizable.`;

    return `${d.priorityIntro} ${d.dim[dimKey][band]} ${flagNote} ${routeNote}`;
  }

  function redFlagNarratives(flags, lang) {
    const d = DIAG[lang];
    if (!flags.length) return `<article class="insight-item"><p>${d.noFlags}</p></article>`;
    return flags
      .map((flag) => `<article class="insight-item"><h5>${lang === "en" ? "Question" : "Pregunta"} ${flag.q}</h5><p>${d.flags[flag.code]}</p></article>`)
      .join("");
  }

  function generatePlan(days, topDims, scoresByDim, flags, route, lang) {
    const isSeven = days === 7;
    const title = isSeven ? (lang === "en" ? "7-day stabilization sprint" : "Sprint de estabilización de 7 días") : (lang === "en" ? "15-day implementation sprint" : "Sprint de implementación de 15 días");
    const intro = isSeven
      ? lang === "en"
        ? "Goal: stop the most visible leaks quickly, create a minimum control layer and produce assets that can be used immediately by sales, content or operations."
        : "Objetivo: detener las fugas más visibles rápido, crear una capa mínima de control y producir activos que ventas, contenido u operación puedan usar de inmediato."
      : lang === "en"
        ? "Goal: turn the first fixes into a repeatable system with owners, metrics and a practical improvement loop."
        : "Objetivo: convertir los primeros ajustes en un sistema repetible con responsables, métricas y un ciclo práctico de mejora.";

    const steps = topDims.map((dim, index) => {
      const label = dimLabel(dim.key, lang);
      const base = DIAG[lang].dim[dim.key][scoreBand(scoresByDim[dim.key])];
      if (lang === "en") {
        return `
          <li>
            <strong>Day ${isSeven ? index + 1 : index * 3 + 1}-${isSeven ? index + 2 : index * 3 + 3}: ${label}.</strong>
            Action: create or improve one concrete asset for this leak. Output: a revised message, process, dashboard field, follow-up script or operating checklist. Impact: ${base}
          </li>
        `;
      }
      return `
        <li>
          <strong>Día ${isSeven ? index + 1 : index * 3 + 1}-${isSeven ? index + 2 : index * 3 + 3}: ${label}.</strong>
          Acción: crear o mejorar un activo concreto para esta fuga. Entregable: mensaje revisado, proceso, campo de tablero, guion de seguimiento o checklist operativo. Impacto: ${base}
        </li>
      `;
    }).join("");

    const flagStep = flags.length
      ? lang === "en"
        ? `<li><strong>Risk control.</strong> Review the red flags and assign one owner and one deadline to each. Output: a visible risk list. Impact: fewer hidden losses while the system scales.</li>`
        : `<li><strong>Control de riesgos.</strong> Revisa las banderas rojas y asigna un responsable y una fecha a cada una. Entregable: lista visible de riesgos. Impacto: menos pérdidas ocultas mientras el sistema escala.</li>`
      : lang === "en"
        ? `<li><strong>Optimization checkpoint.</strong> Since no critical red flags appeared, use the time to document assumptions and define the next test. Output: one experiment backlog. Impact: better decisions without adding complexity.</li>`
        : `<li><strong>Punto de optimización.</strong> Como no aparecieron banderas rojas críticas, usa el tiempo para documentar supuestos y definir el siguiente test. Entregable: backlog de experimentos. Impacto: mejores decisiones sin añadir complejidad.</li>`;

    return `
      <div class="plan-block">
        <h5>${title}</h5>
        <p>${intro}</p>
        <ol>${steps}${flagStep}</ol>
      </div>
    `;
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
  }

  function setHtml(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
  }

  function applyResult(result) {
    const level = getLevel(result.total);
    const levelText = `${currentLang === "en" ? "Level" : "Nivel"}: ${level.name}`;

    setText("#score-total", result.total);
    setText("#score-level", levelText);
    setText("#flags-count", result.flags.length);
    setText("#prio-1", result.priorities[0] ? dimLabel(result.priorities[0].key, currentLang) : "—");

    setText("#preview-score", result.total);
    setText("#preview-level", level.name);
    setText("#preview-priority-1", result.priorities[0] ? dimLabel(result.priorities[0].key, currentLang) : "—");
    setText("#preview-priority-2", result.priorities[1] ? dimLabel(result.priorities[1].key, currentLang) : "—");
    setText("#preview-priority-3", result.priorities[2] ? dimLabel(result.priorities[2].key, currentLang) : "—");

    const levelEl = $("#score-level");
    if (levelEl) levelEl.className = `kpi__hint level-badge ${level.cls}`;

    DIMENSIONS.forEach((dim) => setText(`#s-${dim.key}`, result.dimScores[dim.key]));

    setHtml("#diag-general", generalDiagnosisText(level, result.total, result.flags, result.route, currentLang));
    setHtml(
      "#dimension-insights",
      DIMENSIONS.map((dim) => dimensionInsight(dim.key, result.dimScores[dim.key], result.route, currentLang)).join("")
    );
    setHtml("#red-flags", redFlagNarratives(result.flags, currentLang));
    const redFlagsCard = $("#red-flags-card");
    if (redFlagsCard) redFlagsCard.hidden = false;

    result.priorities.forEach((p, index) => {
      setText(`#prio-title-${index + 1}`, `${dimLabel(p.key, currentLang)} (${p.score}/100)`);
      setText(`#prio-text-${index + 1}`, priorityNarrative(p.key, p.score, result.flags, result.route, currentLang));
    });

    setHtml("#plan-7", generatePlan(7, result.priorities, result.dimScores, result.flags, result.route, currentLang));
    setHtml("#plan-15", generatePlan(15, result.priorities, result.dimScores, result.flags, result.route, currentLang));

    const results = $("#results");
    if (results) {
      results.hidden = false;
      results.classList.remove("is-visible");
      requestAnimationFrame(() => results.classList.add("is-visible"));
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function calculateResult() {
    const missing = [];
    for (let i = 1; i <= 24; i += 1) {
      if (selectedValue(i) === null) missing.push(i);
    }
    if (missing.length) {
      const first = $(`[data-q="q${missing[0]}"]`);
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      alert(currentLang === "en" ? `Please answer all questions. Missing: ${missing.join(", ")}` : `Responde todas las preguntas. Faltan: ${missing.join(", ")}`);
      return null;
    }

    const answers = {};
    for (let i = 1; i <= 24; i += 1) answers[`q${i}`] = selectedValue(i);

    const dimScores = {};
    let total = 0;
    DIMENSIONS.forEach((dim) => {
      const score = scoreDimension(dim);
      dimScores[dim.key] = score;
      total += score * dim.weight;
    });

    const flags = getFlags();
    total = Math.max(0, Math.round(total - flags.length * 2));
    const priorities = DIMENSIONS
      .map((dim) => ({ key: dim.key, label: dim.label, score: dimScores[dim.key] }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    return { total, dimScores, flags, priorities, answers, route: currentRoute, generatedAt: new Date() };
  }

  function runAnalysis(next) {
    const scan = $("#analysis-scan");
    const step = $("#analysis-step");
    const btn = $("#btn-calc");
    const steps = I18N[currentLang].scanSteps;
    const duration = 1400 + Math.round(Math.random() * 300);
    let index = 0;

    if (scan) scan.hidden = false;
    if (step) step.textContent = steps[0];
    if (btn) btn.disabled = true;

    const interval = window.setInterval(() => {
      index = (index + 1) % steps.length;
      if (step) step.textContent = steps[index];
    }, 360);

    window.setTimeout(() => {
      window.clearInterval(interval);
      if (scan) scan.hidden = true;
      if (btn) btn.disabled = false;
      next();
    }, duration);
  }

  function handleCalculate() {
    const result = calculateResult();
    if (!result) return;
    lastResult = result;
    runAnalysis(() => applyResult(result));
  }

  function resetQuiz() {
    $$("input[type='radio']").forEach((input) => {
      input.checked = false;
    });
    const results = $("#results");
    if (results) results.hidden = true;
    const redFlagsCard = $("#red-flags-card");
    if (redFlagsCard) redFlagsCard.hidden = true;
    lastResult = null;
    updateProgress();
    ["preview-score", "preview-level", "preview-priority-1", "preview-priority-2", "preview-priority-3"].forEach((id) => setText(`#${id}`, "—"));
  }

  function setRoute(route) {
    currentRoute = route;
    const ecom = $("#route-ecom");
    const services = $("#route-services");
    if (ecom && services) {
      ecom.classList.toggle("is-active", route === "ecom");
      services.classList.toggle("is-active", route === "services");
      ecom.setAttribute("aria-selected", String(route === "ecom"));
      services.setAttribute("aria-selected", String(route === "services"));
    }
  }

  function whatsappUrl() {
    const text = encodeURIComponent(PREMIUM_MESSAGE);
    return WHATSAPP_NUMBER.trim() ? `https://wa.me/${WHATSAPP_NUMBER.trim()}?text=${text}` : `https://wa.me/?text=${text}`;
  }

  function wireWhatsapp() {
    ["#cta-whatsapp", "#cta-whatsapp-top", "#cta-whatsapp-results", "#cta-premium-results"].forEach((selector) => {
      const el = $(selector);
      if (!el) return;
      el.href = whatsappUrl();
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  function openLogin() {
    const modal = $("#login-modal");
    if (modal) modal.hidden = false;
  }

  function closeLogin() {
    const modal = $("#login-modal");
    if (modal) modal.hidden = true;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("radar-lang", lang);
    document.documentElement.lang = I18N[lang].htmlLang;

    $$(".lang-switch button").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.lang === lang));
    const t = I18N[lang];

    $$(".nav a[href='#como-funciona'], .mobile-menu__inner a[href='#como-funciona']").forEach((el) => (el.textContent = t.navHow));
    $$(".nav a[href='#tools'], .mobile-menu__inner a[href='#tools']").forEach((el) => (el.textContent = t.navTools));
    $$("a[href='#radar'].btn, .mobile-menu__inner a[href='#radar']").forEach((el) => (el.textContent = t.navStart));
    $$("a[href='#cta'].btn").forEach((el) => (el.textContent = t.navPremium));
    const pill = $(".pill span:last-child");
    if (pill) pill.textContent = t.heroPill;
    const heroTitle = $(".hero h1");
    if (heroTitle) heroTitle.innerHTML = t.heroTitle;
    const heroLead = $(".hero__lead");
    if (heroLead) heroLead.innerHTML = t.heroLead;
    const howTitle = $("#como-funciona h2");
    if (howTitle) howTitle.textContent = t.howTitle;
    const radarIntro = $("#radar .section__head p");
    if (radarIntro) radarIntro.textContent = t.radarIntro;
    const routeTitle = $(".route__title");
    if (routeTitle) routeTitle.textContent = t.routeTitle;
    const calc = $("#btn-calc");
    if (calc) calc.textContent = t.calc;
    const reset = $("#btn-reset");
    if (reset) reset.textContent = t.reset;
    const resultsTitle = $(".results__headline h3");
    if (resultsTitle) resultsTitle.textContent = t.resultsTitle;
    const toolsTitle = $("#tools h2");
    if (toolsTitle) toolsTitle.textContent = t.toolsTitle;
    const toolsLead = $("#tools .section__head p");
    if (toolsLead) toolsLead.textContent = t.toolsLead;
    const toolsCta = $("#tools .section__head .btn");
    if (toolsCta) toolsCta.textContent = t.toolsCta;
    $$(".tool-card__link").forEach((el) => (el.textContent = t.openTool));
    $$(".tool-card").forEach((card, index) => {
      const item = t.tools[index];
      if (!item) return;
      const badge = $(".tool-card__badge", card);
      const desc = $("p", card);
      if (badge) badge.textContent = item.badge;
      if (desc) desc.textContent = item.desc;
    });
    const faqLead = $("#faq .section__head p");
    if (faqLead) faqLead.textContent = t.faqLead;
    setText("#login-title", t.loginTitle);
    setText("#login-copy", t.loginCopy);
    const loginOk = $("#login-modal .btn--gold");
    if (loginOk) loginOk.textContent = t.loginOk;
    setText(".analysis-scan__label", t.analyzing);
    setText(".analysis-scan__brand", t.analysisBrand);
    setText("#btn-download-cta", t.pdf);
    setText("#heading-general", t.resultHeadings.general);
    setText("#heading-radar", t.resultHeadings.radar);
    setText("#heading-priorities", t.resultHeadings.priorities);
    setText("#heading-dimensions", t.resultHeadings.dimensions);
    setText("#heading-red-flags", t.resultHeadings.redFlags);
    setText("#heading-plan-7", t.resultHeadings.plan7);
    setText("#heading-plan-15", t.resultHeadings.plan15);
    setText("#chart-note", t.chartNote);
    $$(".scores-mini div").forEach((row, index) => {
      const dim = DIMENSIONS[index];
      const label = $("span", row);
      if (dim && label) label.textContent = dimLabel(dim.key, lang).split(" & ")[0];
    });
    setText("#cta-whatsapp-results", t.whatsapp);
    setText("#cta-premium-results", t.premiumDiag);
    const salesTitle = $(".sales-cta h4");
    if (salesTitle) salesTitle.textContent = t.ctaTitle;
    const salesText = $(".sales-cta p");
    if (salesText) salesText.textContent = t.ctaText;
    const localNote = $(".app-footer span:last-child");
    if (localNote) localNote.textContent = t.localNote;
    updateProgress();
    if (lastResult) applyResult(lastResult);
  }

  function revealOnScroll() {
    const targets = $$(".section, .qblock, .card, .tool-card, .results__grid > article");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  function init() {
    $("#btn-menu")?.addEventListener("click", () => {
      const menu = $("#mobile-menu");
      const btn = $("#btn-menu");
      const isOpen = menu && !menu.hidden;
      if (menu) menu.hidden = isOpen;
      if (btn) btn.setAttribute("aria-expanded", String(!isOpen));
    });

    $("#mobile-menu")?.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        $("#mobile-menu").hidden = true;
        $("#btn-menu")?.setAttribute("aria-expanded", "false");
      }
    });

    $("#route-ecom")?.addEventListener("click", () => setRoute("ecom"));
    $("#route-services")?.addEventListener("click", () => setRoute("services"));
    $("#btn-calc")?.addEventListener("click", handleCalculate);
    $("#btn-reset")?.addEventListener("click", resetQuiz);
    $("#btn-download-cta")?.addEventListener("click", () => {
      if (typeof window.openRadarPdfReport === "function") {
        window.openRadarPdfReport();
      } else {
        $("#btn-download")?.click();
      }
    });
    $("#quiz")?.addEventListener("change", updateProgress);

    $("#btn-login")?.addEventListener("click", openLogin);
    $("#btn-login-mobile")?.addEventListener("click", openLogin);
    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeLogin));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLogin();
    });

    $$(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang || "es"));
    });

    wireWhatsapp();
    updateProgress();
    applyLanguage(currentLang);
    revealOnScroll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
