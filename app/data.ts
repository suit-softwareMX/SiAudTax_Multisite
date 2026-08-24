export const services = [
  { n:"01", title:"Auditoría y aseguramiento", body:"Evaluación independiente, control y confianza sobre la información financiera y los procesos críticos.", items:["Auditoría de estados financieros","Auditoría fiscal y de cumplimiento","Revisión de controles y procesos","Peritajes contables y financieros"] },
  { n:"02", title:"Impuestos", body:"Planeación, cumplimiento y acompañamiento fiscal con perspectiva local e internacional.", items:["Cumplimiento tributario","Planeación fiscal responsable","Devoluciones y saldos a favor","Atención ante autoridades"] },
  { n:"03", title:"Consultoría financiera", body:"Análisis y acompañamiento para transformar información compleja en decisiones claras.", items:["Diagnóstico financiero","Contabilidad y reportes de gestión","Optimización de procesos","Outsourcing administrativo"] },
  { n:"04", title:"Aduanas y comercio exterior", body:"Asesoría para operar cadenas regionales con cumplimiento, eficiencia y control de riesgos.", items:["Diagnóstico aduanero","Cumplimiento regulatorio","Revisión documental","Estrategia de comercio exterior"] },
];

export const perspectives = [
  {category:"Auditoría",title:"Controles internos que preparan a una empresa para crecer",body:"Cinco áreas que conviene revisar antes de ampliar operaciones, incorporar inversión o profesionalizar la gestión."},
  {category:"Impuestos",title:"Cumplimiento fiscal sin perder la visión del negocio",body:"Cómo integrar calendario, evidencia y responsables para reducir contingencias y tomar decisiones oportunas."},
  {category:"Gestión",title:"Información financiera útil para la dirección",body:"Qué debe contener un reporte mensual para convertir datos contables en conversaciones estratégicas."},
];

export const localSites = {
  mexico:{
    label:"México", image:"/images/mexico.jpg", kicker:"Rigor global. Precisión en México.", hero:"La confianza global, con conocimiento local.",
    intro:"Una firma preparada para acompañar decisiones relevantes en el mercado mexicano, con la perspectiva de una red internacional.",
    firm:"La firma en México", firmBody:"Combinamos conocimiento profundo del entorno empresarial mexicano con estándares compartidos de independencia, precisión y servicio.",
    practices:["Auditoría financiera y fiscal","Impuestos y cumplimiento","Consultoría financiera","Aduanas y comercio exterior"],
    partners:[{name:"Mariana Ortega",role:"Socia directora",image:"/images/mariana.jpg"},{name:"Ricardo Salinas",role:"Socio de auditoría",image:"/images/ricardo.jpg"}],
    address:"Corina 130, Col. Del Carmen Coyoacán, C.P. 04100, Ciudad de México",phone:"+52 55 5554 0921",email:"contacto.mx@auditaxes.com"
  },
  salvador:{
    label:"El Salvador", image:"/images/salvador.jpg", kicker:"Rigor global. Precisión en El Salvador.", hero:"Una perspectiva regional, arraigada en El Salvador.",
    intro:"Acompañamos a organizaciones que operan en El Salvador con criterio local, coordinación regional y una mirada clara hacia el crecimiento.",
    firm:"La firma en El Salvador", firmBody:"Nuestra práctica local conecta la realidad del mercado salvadoreño con la experiencia multidisciplinaria de AUDITAXES Global.",
    practices:["Auditoría y aseguramiento","Impuestos y cumplimiento","Consultoría de negocios","Comercio exterior y aduanas"],
    partners:[{name:"Sofía Benítez",role:"Socia directora",image:"/images/sofia.jpg"},{name:"Diego Acosta",role:"Socio de impuestos",image:"/images/diego.jpg"}],
    address:"San Salvador, El Salvador · Dirección local por confirmar",phone:"+503 0000 0000",email:"contacto.sv@auditaxes.com"
  }
} as const;

export const countries = [
  ["mexico","México",23.6345,-102.5528,true],["guatemala","Guatemala",15.7835,-90.2308,false],["el-salvador","El Salvador",13.7942,-88.8965,true],
  ["costa-rica","Costa Rica",9.7489,-83.7534,false],["panama","Panamá",8.538,-80.7821,false],["belize","Belice",17.1899,-88.4976,false],
  ["colombia","Colombia",4.5709,-74.2973,false],["peru","Perú",-9.19,-75.0152,false],["argentina","Argentina",-38.4161,-63.6167,false],
  ["dominican-republic","República Dominicana",18.7357,-70.1627,false],["venezuela","Venezuela",6.4238,-66.5897,false],["united-kingdom","Reino Unido",55.3781,-3.436,false],
  ["paraguay","Paraguay",-23.4425,-58.4438,false]
] as const;
