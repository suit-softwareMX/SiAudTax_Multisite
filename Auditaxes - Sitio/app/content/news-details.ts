export type NewsKind = "news" | "article";

export type NewsDetail = {
  date: string;
  kind: NewsKind;
  sourceUrl: string;
  summary: string;
  sections: Array<{ heading?: string; paragraphs?: string[]; bullets?: string[] }>;
};

// Una sola fuente de datos alimenta el listado y la vista de detalle. De esta
// forma, sumar una publicación no requiere crear una página o plantilla nueva.
export const newsDetails: Record<string, NewsDetail> = {
  "economic-substance-law": {
    date: "2026-06-18",
    kind: "news",
    sourceUrl: "https://auditaxespa.com/es/posts/ley-de-sustancia-econmica",
    summary: "La Ley 526 de 2026 introduce requisitos de sustancia económica para determinadas rentas pasivas de fuente extranjera obtenidas por grupos multinacionales en Panamá.",
    sections: [
      { paragraphs: ["El sistema tributario panameño ha evolucionado para mantener sus principios constitucionales y, al mismo tiempo, responder a los estándares internacionales de transparencia. En ese contexto se promulgó la Ley 526 del 28 de mayo de 2026, que modifica el Código Fiscal y comenzará a regir en 2027."] },
      { heading: "Ámbito de aplicación", paragraphs: ["La norma alcanza a entidades constituidas o domiciliadas en Panamá que pertenezcan a grupos multinacionales y obtengan rentas pasivas de fuente extranjera."], bullets: ["Dividendos o participaciones en utilidades.", "Intereses y regalías.", "Ganancias de capital.", "Rentas de capital inmobiliario y mobiliario."] },
      { heading: "Condiciones de sustancia económica", bullets: ["Contar en Panamá con personal calificado, remunerado e instalaciones físicas adecuadas.", "Tomar localmente las decisiones estratégicas y asumir los riesgos de las operaciones.", "Incurrir en costos y gastos operativos adecuados y relacionados con los activos que producen la renta."] },
      { heading: "Regímenes y tercerización", paragraphs: ["Las entidades dedicadas principalmente a la tenencia pasiva de participaciones o bienes inmuebles tienen un requisito reducido. La ley también permite contratar proveedores panameños para cumplir funciones de sustancia, sujeto a la reglamentación pendiente."] },
      { heading: "Consecuencias y recomendaciones", paragraphs: ["Las entidades que no acrediten sustancia económica podrán quedar sujetas a una tarifa del 15% sobre la renta neta gravable, además de multas, recargos e intereses. Conviene revisar desde ahora la estructura, operaciones, documentación y recursos locales de cada entidad alcanzada."] }
    ]
  },
  "pep-controls": {
    date: "2026-04-09",
    kind: "news",
    sourceUrl: "https://auditaxespa.com/es/posts/superintendencia-fortalece-los-controles-para-la-identificacin-y-gestin-de-personas-expuestas-polticamente",
    summary: "La Resolución S-008-2026 refuerza la identificación, evaluación y seguimiento de Personas Expuestas Políticamente, sus familiares y colaboradores cercanos.",
    sections: [
      { paragraphs: ["La Superintendencia de Sujetos no Financieros publicó una guía integral que exige procedimientos más sólidos, efectivos y documentados para las relaciones comerciales que involucren a personas con exposición política."] },
      { heading: "Principales medidas", bullets: ["Actualizar formularios de debida diligencia.", "Verificar información en fuentes confiables.", "Analizar el origen de fondos y patrimonio.", "Aplicar debida diligencia ampliada y monitoreo continuo.", "Capacitar permanentemente al personal."] },
      { paragraphs: ["Una persona se considera PEP durante el ejercicio de su cargo y por dos años después de su separación, sin impedir que se mantengan controles reforzados si el riesgo lo requiere. El objetivo no es solo consultar listas, sino conocer al cliente, al beneficiario final y su perfil económico, y detectar operaciones o estructuras inusuales.", "Además de atender una obligación normativa, la guía permite fortalecer la transparencia, proteger la reputación corporativa y preparar a la organización ante inspecciones."] }
    ]
  },
  "mef-route": {
    date: "2025-11-21",
    kind: "news",
    sourceUrl: "https://auditaxespa.com/es/posts/ruta-del-mef",
    summary: "El MEF presentó medidas de contención del gasto, pago a proveedores y financiamiento para estabilizar las finanzas públicas panameñas.",
    sections: [
      { paragraphs: ["El Gobierno inició un plan de contención del gasto por 1,387 millones de dólares. Aunque es un primer paso para reducir el déficit, las autoridades reconocieron que la meta fiscal del 2% no podría alcanzarse en ese periodo.", "El plan también contempla atender cuentas por pagar a proveedores por 877 millones de dólares, con la expectativa de que esos recursos ayuden a sostener operaciones y empleo en empresas grandes, medianas y pequeñas."] },
      { heading: "Perspectivas de crecimiento", paragraphs: ["El MEF mantuvo una proyección de crecimiento de 2.5% y anticipó una aceleración posterior impulsada por inversión pública y privada. También señaló la necesidad de recuperar el grado de inversión y mejorar la recaudación sin elevar impuestos."] },
      { heading: "Financiamiento y disciplina fiscal", paragraphs: ["La estrategia de financiamiento de hasta 6,000 millones de dólares fue planteada como una autorización anticipada para atender vencimientos y obligaciones, no como un aumento automático de la deuda. Se consideraron emisiones locales de notas del Tesoro y líneas de crédito para capital de trabajo."], bullets: ["Ajustar partidas y gasto público con apoyo técnico a entidades y ministerios.", "Pagar únicamente cuentas documentadas y sustentadas.", "Revisar la arquitectura de la regla fiscal.", "Mantener comunicación transparente con calificadoras e inversionistas."] }
    ]
  },
  "ssnf-sanctions-news": {
    date: "2025-08-14",
    kind: "news",
    sourceUrl: "https://auditaxespa.com/es/posts/ssnf-impone-sanciones",
    summary: "La SSNF ha aplicado sanciones económicas por incumplimientos de registro, debida diligencia, conservación de información y capacitación.",
    sections: [
      { paragraphs: ["La Superintendencia de Sujetos No Financieros impuso multas desde 5,000 dólares a personas jurídicas y naturales que incumplieron obligaciones del régimen de prevención. Más de 36 empresas habían sido sancionadas desde 2021."] },
      { heading: "Incumplimientos observados", bullets: ["No registrarse ante la SSNF conforme a la Ley 124 de 2020.", "Deficiencias en debida diligencia, actualización y resguardo de información.", "No entregar información solicitada por la autoridad.", "Fallas en las políticas de conocimiento y capacitación del empleado.", "Controles insuficientes frente al blanqueo de capitales y el financiamiento del terrorismo."] },
      { paragraphs: ["También se reportaron sanciones en el sector construcción, la Zona Libre de Colón y firmas de abogados, incluyendo incumplimientos relacionados con beneficiarios finales, enfoque basado en riesgo y congelamiento preventivo."] }
    ]
  },
  "reduce-fiscal-deficit": {
    date: "2025-03-04",
    kind: "article",
    sourceUrl: "https://auditaxespa.com/es/posts/reducir-deficit-fiscal",
    summary: "Análisis de las medidas de gasto, deuda, recaudación y financiamiento propuestas para corregir el déficit fiscal de Panamá.",
    sections: [
      { paragraphs: ["El plan de contención del gasto por 1,387 millones de dólares abrió el esfuerzo de estabilización fiscal, en un contexto de ingresos inferiores a los presupuestados y una meta de déficit del 2% difícil de cumplir.", "El Gobierno también anunció el pago de obligaciones con proveedores y apoyo técnico para que las entidades ajusten sus partidas sin comprometer innecesariamente la actividad productiva."] },
      { heading: "Desarrollo y financiamiento", paragraphs: ["Las autoridades proyectaron una aceleración económica apoyada en mayor inversión, junto con acciones para recuperar el grado de inversión. La preautorización de financiamiento permitiría atender vencimientos con anticipación, mientras las emisiones locales reducirían la necesidad de acudir de inmediato a mercados internacionales."] },
      { heading: "Una ejecución responsable", paragraphs: ["Mejorar la recaudación con las reglas vigentes, controlar el gasto, ejecutar correctamente el presupuesto y ajustar responsablemente la planilla estatal son piezas complementarias. La efectividad dependerá de la disciplina, transparencia y continuidad de las decisiones públicas."] }
    ]
  },
  "ssnf-sanctions-article": {
    date: "2024-12-12",
    kind: "article",
    sourceUrl: "https://auditaxespa.com/es/posts/sanciones-ssnf",
    summary: "El registro ante la SSNF y el mantenimiento de controles preventivos son obligaciones esenciales para los sujetos no financieros.",
    sections: [
      { paragraphs: ["La SSNF puede imponer multas de 5,000 dólares por no cumplir con el registro exigido por la Ley 124 de 2020 y su reglamentación.", "El registro no es solo un trámite: forma parte de la gestión responsable de riesgos vinculados con blanqueo de capitales, financiamiento del terrorismo y proliferación de armas de destrucción masiva.", "Mantenerse al día con la normativa, documentar los controles y revisar periódicamente su aplicación reduce la exposición a sanciones y contribuye a un entorno de negocios más seguro. La autoridad continuará sus tareas de supervisión y auditoría del sector no financiero."] }
    ]
  },
  "electronic-invoicing": {
    date: "2024-09-26",
    kind: "article",
    sourceUrl: "https://auditaxespa.com/es/posts/beneficios-facturacion-electronica",
    summary: "La facturación electrónica mejora la captura, conservación, validación y conciliación de los registros contables.",
    sections: [
      { paragraphs: ["La factura electrónica es un documento fiscal digital con validez legal, firmado electrónicamente para asegurar autenticidad, integridad y no repudio. En Panamá, el sistema administrado por la DGI ofrece beneficios para empresas y consumidores."] },
      { heading: "Eficiencia de registro", bullets: ["Consultar facturas captadas por el sistema y descargar el CAFE.", "Extraer detalles a archivos estructurados e importarlos al ERP.", "Emitir facturas desde el ERP cuando exista integración con el facturador electrónico."] },
      { heading: "Documentos accesibles y seguros", paragraphs: ["Los soportes pueden guardarse en la nube, en dispositivos electrónicos o junto a la transacción del ERP. Esto reduce papel, espacio físico y el riesgo de pérdida o deterioro, además de facilitar la consulta remota."] },
      { heading: "Validación y conciliación", paragraphs: ["El código QR permite comprobar autenticidad, mientras los reportes de documentos emitidos y recibidos facilitan conciliaciones de cuentas por cobrar, cuentas por pagar e inventarios."] }
    ]
  },
  "ifrs-18": {
    date: "2024-06-11",
    kind: "article",
    sourceUrl: "https://auditaxespa.com/es/posts/norma-niif",
    summary: "La NIIF 18 busca que el rendimiento financiero de las empresas sea más transparente, comparable y útil para los inversores.",
    sections: [
      { paragraphs: ["El IASB concluyó una nueva norma de presentación e información a revelar en los estados financieros. La NIIF 18 afectará a todas las entidades que reporten bajo NIIF y sustituirá a la NIC 1, aunque conserva muchos de sus requerimientos."] },
      { heading: "Tres mejoras principales", bullets: ["Mayor comparabilidad del estado de resultados.", "Más transparencia en las mediciones de rendimiento definidas por la administración.", "Agrupación más útil de la información financiera."] },
      { paragraphs: ["La norma será obligatoria para periodos anuales que comiencen a partir del 1 de enero de 2027, con aplicación anticipada permitida. El esfuerzo de implementación dependerá de las prácticas de reporte y los sistemas tecnológicos actuales de cada empresa."] }
    ]
  },
  "fatf-fifth-round": {
    date: "2024-02-19",
    kind: "article",
    sourceUrl: "https://auditaxespa.com/es/posts/quinta-ronda-gafi-y-preparacion-nacional",
    summary: "La Quinta Ronda del GAFI eleva el estándar: el cumplimiento se evaluará por su efectividad práctica y no solo por la existencia formal de normas.",
    sections: [
      { paragraphs: ["La nueva ronda de evaluaciones mutuas, iniciada en 2024–2025 y proyectada hacia 2027, examinará si los sistemas contra el lavado de activos, financiamiento del terrorismo y proliferación producen resultados concretos."] },
      { heading: "De la forma a la efectividad", bullets: ["Capacidad para identificar y gestionar riesgos específicos.", "Efectividad de la supervisión financiera y no financiera.", "Transparencia sobre beneficiarios finales.", "Funcionamiento de la inteligencia financiera.", "Adaptación ante amenazas y tipologías emergentes."] },
      { heading: "Preparación nacional", paragraphs: ["Los países deberán actualizar políticas, fortalecer la gestión basada en riesgos, mejorar reportes, coordinar instituciones y desarrollar capacidades técnicas y tecnológicas. Un resultado deficiente puede afectar la reputación, la confianza financiera y la estabilidad económica."] },
      { heading: "Implicaciones para el sector privado", paragraphs: ["Las organizaciones tendrán que demostrar que sus programas se aplican realmente, que la debida diligencia es verificable, que los controles funcionan y que existe monitoreo continuo. El cumplimiento se convierte así en un componente estratégico de sostenibilidad y reputación."] }
    ]
  }
};
