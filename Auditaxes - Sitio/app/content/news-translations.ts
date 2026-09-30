import type { NewsDetail } from "./news-details";

type TranslatedDetail = Pick<NewsDetail, "summary" | "sections">;
type TranslatedLocale = "en" | "pt" | "fr";

export const newsTranslations: Record<string, Record<TranslatedLocale, TranslatedDetail>> = {
  "economic-substance-law": {
    en: {
      summary: "Law 526 of 2026 introduces economic substance requirements for certain foreign-source passive income earned by multinational groups in Panama.",
      sections: [
        { paragraphs: ["Panama's tax system has evolved to preserve its constitutional principles while responding to international transparency standards. In this context, Law 526 of May 28, 2026 amended the Tax Code and will take effect in 2027."] },
        { heading: "Scope", paragraphs: ["The rules apply to entities incorporated or domiciled in Panama that belong to multinational groups and receive foreign-source passive income."], bullets: ["Dividends or profit distributions.", "Interest and royalties.", "Capital gains.", "Income from real and movable property."] },
        { heading: "Economic substance conditions", bullets: ["Maintain qualified, remunerated personnel and suitable premises in Panama.", "Make strategic decisions locally and assume operational risks in Panama.", "Incur adequate operating costs and expenses related to the income-producing assets."] },
        { heading: "Special regimes and outsourcing", paragraphs: ["Entities mainly holding passive investments or real estate have a reduced requirement. The law also permits Panamanian service providers to perform substance functions, subject to pending regulations."] },
        { heading: "Consequences and recommendations", paragraphs: ["Entities unable to demonstrate substance may face a 15% tax on net taxable income, in addition to penalties, surcharges and interest. Affected organizations should review their structures, operations, documentation and local resources before the rules enter into force."] }
      ]
    },
    pt: {
      summary: "A Lei 526 de 2026 introduz requisitos de substância econômica para determinadas rendas passivas de fonte estrangeira obtidas por grupos multinacionais no Panamá.",
      sections: [
        { paragraphs: ["O sistema tributário panamenho evoluiu para preservar seus princípios constitucionais e responder aos padrões internacionais de transparência. Nesse contexto, a Lei 526, de 28 de maio de 2026, alterou o Código Fiscal e entrará em vigor em 2027."] },
        { heading: "Âmbito de aplicação", paragraphs: ["A norma alcança entidades constituídas ou domiciliadas no Panamá que pertençam a grupos multinacionais e obtenham rendas passivas de fonte estrangeira."], bullets: ["Dividendos ou participações nos lucros.", "Juros e royalties.", "Ganhos de capital.", "Rendas de capital imobiliário e mobiliário."] },
        { heading: "Condições de substância econômica", bullets: ["Manter no Panamá pessoal qualificado e remunerado, além de instalações adequadas.", "Tomar localmente as decisões estratégicas e assumir os riscos das operações.", "Incorrer em custos e despesas operacionais adequados e relacionados aos ativos geradores de renda."] },
        { heading: "Regimes especiais e terceirização", paragraphs: ["Entidades dedicadas principalmente à participação passiva em sociedades ou imóveis possuem um requisito reduzido. A lei também permite contratar prestadores panamenhos, sujeito à regulamentação pendente."] },
        { heading: "Consequências e recomendações", paragraphs: ["Entidades que não comprovem substância poderão ficar sujeitas a uma alíquota de 15% sobre a renda líquida tributável, além de multas, acréscimos e juros. É recomendável revisar desde já estruturas, operações, documentação e recursos locais."] }
      ]
    },
    fr: {
      summary: "La loi 526 de 2026 introduit des exigences de substance économique pour certains revenus passifs de source étrangère perçus par des groupes multinationaux au Panama.",
      sections: [
        { paragraphs: ["Le système fiscal panaméen a évolué afin de préserver ses principes constitutionnels tout en répondant aux normes internationales de transparence. Dans ce contexte, la loi 526 du 28 mai 2026 a modifié le Code fiscal et entrera en vigueur en 2027."] },
        { heading: "Champ d’application", paragraphs: ["La règle vise les entités constituées ou domiciliées au Panama qui appartiennent à des groupes multinationaux et perçoivent des revenus passifs de source étrangère."], bullets: ["Dividendes ou participations aux bénéfices.", "Intérêts et redevances.", "Plus-values.", "Revenus de capitaux immobiliers et mobiliers."] },
        { heading: "Conditions de substance économique", bullets: ["Disposer au Panama d’un personnel qualifié et rémunéré ainsi que de locaux adaptés.", "Prendre localement les décisions stratégiques et assumer les risques opérationnels.", "Engager des coûts et dépenses d’exploitation adéquats liés aux actifs générateurs de revenus."] },
        { heading: "Régimes spéciaux et externalisation", paragraphs: ["Les entités principalement consacrées à la détention passive de participations ou de biens immobiliers bénéficient d’une exigence réduite. La loi autorise aussi le recours à des prestataires panaméens, sous réserve de la réglementation à venir."] },
        { heading: "Conséquences et recommandations", paragraphs: ["Les entités qui ne démontrent pas leur substance peuvent être soumises à un taux de 15 % sur le revenu net imposable, en plus des amendes, majorations et intérêts. Il convient d’examiner dès maintenant les structures, opérations, documents et ressources locales."] }
      ]
    }
  },
  "pep-controls": {
    en: {
      summary: "Resolution S-008-2026 strengthens the identification, assessment and monitoring of Politically Exposed Persons, their relatives and close associates.",
      sections: [
        { paragraphs: ["The Superintendency of Non-Financial Entities issued comprehensive guidance requiring stronger, effective and properly documented procedures for business relationships involving politically exposed persons."] },
        { heading: "Key measures", bullets: ["Update due diligence forms.", "Verify information through reliable sources.", "Analyze the origin of funds and wealth.", "Apply enhanced due diligence and continuous monitoring.", "Provide ongoing staff training."] },
        { paragraphs: ["A person is treated as a PEP while holding office and for two years after leaving it, without preventing enhanced controls from continuing when risk warrants it. Organizations must understand their customers, beneficial owners and economic profiles rather than merely checking lists.", "Besides meeting a regulatory duty, the guidance helps strengthen transparency, protect corporate reputation and prepare organizations for inspections."] }
      ]
    },
    pt: {
      summary: "A Resolução S-008-2026 reforça a identificação, a avaliação e o monitoramento de Pessoas Politicamente Expostas, seus familiares e colaboradores próximos.",
      sections: [
        { paragraphs: ["A Superintendência de Sujeitos Não Financeiros publicou um guia integral que exige procedimentos mais sólidos, efetivos e devidamente documentados nas relações comerciais com pessoas politicamente expostas."] },
        { heading: "Principais medidas", bullets: ["Atualizar os formulários de devida diligência.", "Verificar informações em fontes confiáveis.", "Analisar a origem dos recursos e do patrimônio.", "Aplicar devida diligência ampliada e monitoramento contínuo.", "Capacitar permanentemente a equipe."] },
        { paragraphs: ["Uma pessoa é considerada PEP durante o exercício do cargo e por dois anos após o desligamento, sem impedir a manutenção de controles reforçados quando o risco exigir. A organização deve conhecer clientes, beneficiários finais e seus perfis econômicos, e não apenas consultar listas.", "Além de cumprir uma obrigação regulatória, o guia fortalece a transparência, protege a reputação corporativa e prepara a organização para inspeções."] }
      ]
    },
    fr: {
      summary: "La résolution S-008-2026 renforce l’identification, l’évaluation et le suivi des personnes politiquement exposées, de leurs proches et de leurs collaborateurs.",
      sections: [
        { paragraphs: ["La Surintendance des entités non financières a publié un guide complet exigeant des procédures plus solides, efficaces et documentées pour les relations d’affaires impliquant des personnes politiquement exposées."] },
        { heading: "Principales mesures", bullets: ["Mettre à jour les formulaires de diligence raisonnable.", "Vérifier les informations auprès de sources fiables.", "Analyser l’origine des fonds et du patrimoine.", "Appliquer une diligence renforcée et un suivi continu.", "Former régulièrement le personnel."] },
        { paragraphs: ["Une personne est considérée comme PPE pendant l’exercice de ses fonctions et durant les deux années suivantes, sans exclure le maintien de contrôles renforcés si le risque l’exige. Il faut connaître le client, le bénéficiaire effectif et son profil économique, au-delà d’une simple consultation de listes.", "En plus de répondre à une obligation réglementaire, ce guide renforce la transparence, protège la réputation de l’entreprise et prépare l’organisation aux inspections."] }
      ]
    }
  },
  "mef-route": {
    en: {
      summary: "The MEF presented spending restraint, supplier payment and financing measures designed to stabilize Panama's public finances.",
      sections: [
        { paragraphs: ["The Government launched a $1.387 billion spending restraint plan. Although it was a first step toward reducing the deficit, the authorities acknowledged that the 2% fiscal target could not be met during that period.", "The plan also covers $877 million in accounts payable to suppliers, with the expectation that the funds will support operations and employment across large, medium-sized and small businesses."] },
        { heading: "Growth outlook", paragraphs: ["The MEF maintained a 2.5% growth forecast and expected a later acceleration driven by public and private investment. It also emphasized recovering investment-grade status and improving revenue collection without raising taxes."] },
        { heading: "Financing and fiscal discipline", paragraphs: ["Up to $6 billion in financing was presented as advance authorization to meet maturities and obligations, not as an automatic increase in debt. Local Treasury note issues and working-capital credit facilities were considered."], bullets: ["Adjust budgets and public expenditure with technical support.", "Pay only properly documented claims.", "Review the fiscal-rule framework.", "Maintain transparent communication with rating agencies and investors."] }
      ]
    },
    pt: {
      summary: "O MEF apresentou medidas de contenção de gastos, pagamento a fornecedores e financiamento para estabilizar as finanças públicas do Panamá.",
      sections: [
        { paragraphs: ["O Governo iniciou um plano de contenção de gastos de 1,387 bilhão de dólares. Embora seja um primeiro passo para reduzir o déficit, as autoridades reconheceram que a meta fiscal de 2% não poderia ser atingida naquele período.", "O plano também contempla 877 milhões de dólares em contas a pagar a fornecedores, com a expectativa de apoiar as operações e os empregos de empresas grandes, médias e pequenas."] },
        { heading: "Perspectivas de crescimento", paragraphs: ["O MEF manteve a projeção de crescimento de 2,5% e previu uma aceleração posterior impulsionada pelos investimentos público e privado. Também destacou a recuperação do grau de investimento e a melhoria da arrecadação sem aumento de impostos."] },
        { heading: "Financiamento e disciplina fiscal", paragraphs: ["O financiamento de até 6 bilhões de dólares foi apresentado como autorização antecipada para atender vencimentos e obrigações, e não como aumento automático da dívida. Foram consideradas emissões locais de notas do Tesouro e linhas de crédito para capital de giro."], bullets: ["Ajustar dotações e gastos públicos com apoio técnico.", "Pagar apenas contas devidamente documentadas.", "Revisar a estrutura da regra fiscal.", "Manter comunicação transparente com agências de classificação e investidores."] }
      ]
    },
    fr: {
      summary: "Le MEF a présenté des mesures de maîtrise des dépenses, de paiement des fournisseurs et de financement afin de stabiliser les finances publiques du Panama.",
      sections: [
        { paragraphs: ["Le gouvernement a lancé un plan de maîtrise des dépenses de 1,387 milliard de dollars. Bien qu’il s’agisse d’une première étape vers la réduction du déficit, les autorités ont reconnu que l’objectif budgétaire de 2 % ne pourrait pas être atteint durant cette période.", "Le plan prévoit aussi le règlement de 877 millions de dollars dus aux fournisseurs afin de soutenir l’activité et l’emploi des grandes, moyennes et petites entreprises."] },
        { heading: "Perspectives de croissance", paragraphs: ["Le MEF a maintenu une prévision de croissance de 2,5 % et anticipé une accélération portée par l’investissement public et privé. Il a également souligné la nécessité de retrouver la catégorie investissement et d’améliorer les recettes sans augmenter les impôts."] },
        { heading: "Financement et discipline budgétaire", paragraphs: ["Le financement pouvant atteindre 6 milliards de dollars a été présenté comme une autorisation préalable pour honorer les échéances et obligations, et non comme une hausse automatique de la dette. Des émissions locales de bons du Trésor et des lignes de crédit ont été envisagées."], bullets: ["Ajuster les crédits et les dépenses publiques avec un appui technique.", "Ne payer que les créances dûment documentées.", "Revoir l’architecture de la règle budgétaire.", "Maintenir une communication transparente avec les agences de notation et les investisseurs."] }
      ]
    }
  },
  "ssnf-sanctions-news": {
    en: {
      summary: "The SSNF has imposed financial penalties for failures involving registration, due diligence, record retention and training.",
      sections: [
        { paragraphs: ["The Superintendency of Non-Financial Entities imposed fines starting at $5,000 on companies and individuals that failed to meet prevention-framework obligations. More than 36 companies had been penalized since 2021."] },
        { heading: "Observed breaches", bullets: ["Failure to register with the SSNF under Law 124 of 2020.", "Weaknesses in due diligence, updating and record retention.", "Failure to provide information requested by the authority.", "Deficient employee knowledge and training policies.", "Insufficient controls against money laundering and terrorist financing."] },
        { paragraphs: ["Penalties were also reported in construction, the Colón Free Trade Zone and law firms, including breaches involving beneficial ownership, risk-based controls and preventive freezing measures."] }
      ]
    },
    pt: {
      summary: "A SSNF aplicou sanções financeiras por falhas de registro, devida diligência, conservação de informações e capacitação.",
      sections: [
        { paragraphs: ["A Superintendência de Sujeitos Não Financeiros aplicou multas a partir de 5 mil dólares a pessoas jurídicas e naturais que descumpriram obrigações do regime preventivo. Mais de 36 empresas haviam sido sancionadas desde 2021."] },
        { heading: "Descumprimentos observados", bullets: ["Não se registrar na SSNF conforme a Lei 124 de 2020.", "Deficiências na devida diligência, atualização e guarda de informações.", "Não entregar informações solicitadas pela autoridade.", "Falhas nas políticas de conhecimento e capacitação dos empregados.", "Controles insuficientes contra lavagem de dinheiro e financiamento do terrorismo."] },
        { paragraphs: ["Também foram relatadas sanções na construção civil, na Zona Livre de Colón e em escritórios de advocacia, inclusive por falhas relativas a beneficiários finais, controles baseados em risco e congelamento preventivo."] }
      ]
    },
    fr: {
      summary: "La SSNF a imposé des sanctions financières pour des manquements en matière d’enregistrement, de diligence raisonnable, de conservation des données et de formation.",
      sections: [
        { paragraphs: ["La Surintendance des entités non financières a infligé des amendes à partir de 5 000 dollars aux personnes morales et physiques qui n’avaient pas respecté leurs obligations préventives. Plus de 36 entreprises avaient été sanctionnées depuis 2021."] },
        { heading: "Manquements constatés", bullets: ["Absence d’enregistrement auprès de la SSNF conformément à la loi 124 de 2020.", "Lacunes dans la diligence raisonnable, la mise à jour et la conservation des informations.", "Non-transmission des informations demandées par l’autorité.", "Défaillances des politiques de connaissance et de formation des employés.", "Contrôles insuffisants contre le blanchiment et le financement du terrorisme."] },
        { paragraphs: ["Des sanctions ont également concerné le bâtiment, la zone franche de Colón et des cabinets d’avocats, notamment pour des manquements liés aux bénéficiaires effectifs, à l’approche fondée sur les risques et au gel préventif."] }
      ]
    }
  },
  "reduce-fiscal-deficit": {
    en: {
      summary: "An analysis of the spending, debt, revenue and financing measures proposed to correct Panama's fiscal deficit.",
      sections: [
        { paragraphs: ["A $1.387 billion spending restraint plan launched the fiscal stabilization effort amid revenue below budget and a difficult 2% deficit target.", "The Government also announced payments to suppliers and technical support so public entities could adjust their budgets without unnecessarily harming productive activity."] },
        { heading: "Development and financing", paragraphs: ["The authorities projected faster growth supported by investment and measures to regain investment-grade status. Advance financing authorization could address maturities, while local issues would reduce the immediate need to access international markets."] },
        { heading: "Responsible implementation", paragraphs: ["Improving revenue under existing rules, controlling expenditure, executing the budget correctly and adjusting the public payroll responsibly are complementary measures. Their effectiveness will depend on discipline, transparency and policy continuity."] }
      ]
    },
    pt: {
      summary: "Uma análise das medidas de gasto, dívida, arrecadação e financiamento propostas para corrigir o déficit fiscal do Panamá.",
      sections: [
        { paragraphs: ["Um plano de contenção de gastos de 1,387 bilhão de dólares deu início ao esforço de estabilização fiscal, em um contexto de receitas abaixo do orçamento e de uma difícil meta de déficit de 2%.", "O Governo também anunciou pagamentos a fornecedores e apoio técnico para que as entidades ajustem seus orçamentos sem prejudicar desnecessariamente a atividade produtiva."] },
        { heading: "Desenvolvimento e financiamento", paragraphs: ["As autoridades projetaram uma aceleração econômica apoiada em investimentos e em ações para recuperar o grau de investimento. A autorização antecipada de financiamento permitiria atender vencimentos, enquanto emissões locais reduziriam a necessidade imediata de recorrer aos mercados internacionais."] },
        { heading: "Execução responsável", paragraphs: ["Melhorar a arrecadação com as regras vigentes, controlar os gastos, executar corretamente o orçamento e ajustar responsavelmente a folha pública são medidas complementares. A eficácia dependerá de disciplina, transparência e continuidade."] }
      ]
    },
    fr: {
      summary: "Une analyse des mesures de dépenses, de dette, de recettes et de financement proposées pour corriger le déficit budgétaire du Panama.",
      sections: [
        { paragraphs: ["Un plan de maîtrise des dépenses de 1,387 milliard de dollars a lancé l’effort de stabilisation dans un contexte de recettes inférieures aux prévisions et d’objectif de déficit de 2 % difficile à respecter.", "Le gouvernement a également annoncé le règlement des fournisseurs et un appui technique afin que les organismes ajustent leurs crédits sans nuire inutilement à l’activité productive."] },
        { heading: "Développement et financement", paragraphs: ["Les autorités ont prévu une accélération économique soutenue par l’investissement et par des mesures destinées à retrouver la catégorie investissement. Une autorisation préalable de financement permettrait de couvrir les échéances, tandis que des émissions locales réduiraient le recours immédiat aux marchés internationaux."] },
        { heading: "Une mise en œuvre responsable", paragraphs: ["Améliorer les recettes avec les règles existantes, maîtriser les dépenses, exécuter correctement le budget et ajuster les effectifs publics de manière responsable sont des mesures complémentaires. Leur efficacité dépendra de la discipline, de la transparence et de la continuité."] }
      ]
    }
  },
  "ssnf-sanctions-article": {
    en: {
      summary: "Registration with the SSNF and the maintenance of preventive controls are essential obligations for non-financial regulated entities.",
      sections: [{ paragraphs: ["The SSNF may impose $5,000 fines for failure to complete the registration required by Law 124 of 2020 and its regulations.", "Registration is not merely administrative: it forms part of responsible risk management for money laundering, terrorist financing and proliferation financing.", "Keeping regulations up to date, documenting controls and periodically reviewing their application reduces exposure to penalties and supports a safer business environment. The authority will continue supervising and auditing the non-financial sector."] }]
    },
    pt: {
      summary: "O registro na SSNF e a manutenção de controles preventivos são obrigações essenciais para os sujeitos não financeiros.",
      sections: [{ paragraphs: ["A SSNF pode aplicar multas de 5 mil dólares pela falta do registro exigido pela Lei 124 de 2020 e sua regulamentação.", "O registro não é apenas um procedimento administrativo: ele integra a gestão responsável dos riscos de lavagem de dinheiro, financiamento do terrorismo e financiamento da proliferação.", "Manter a regulamentação atualizada, documentar os controles e revisar periodicamente sua aplicação reduz a exposição a sanções e contribui para um ambiente de negócios mais seguro. A autoridade continuará supervisionando e auditando o setor não financeiro."] }]
    },
    fr: {
      summary: "L’enregistrement auprès de la SSNF et le maintien de contrôles préventifs sont des obligations essentielles pour les entités non financières assujetties.",
      sections: [{ paragraphs: ["La SSNF peut infliger une amende de 5 000 dollars en cas de non-respect de l’enregistrement exigé par la loi 124 de 2020 et ses règlements.", "L’enregistrement n’est pas une simple formalité : il participe à la gestion responsable des risques de blanchiment, de financement du terrorisme et de la prolifération.", "Se tenir informé de la réglementation, documenter les contrôles et vérifier périodiquement leur application réduit l’exposition aux sanctions et favorise un environnement d’affaires plus sûr. L’autorité poursuivra ses contrôles du secteur non financier."] }]
    }
  },
  "electronic-invoicing": {
    en: {
      summary: "Electronic invoicing improves the capture, retention, validation and reconciliation of accounting records.",
      sections: [
        { paragraphs: ["An electronic invoice is a legally valid digital tax document signed electronically to ensure authenticity, integrity and non-repudiation. In Panama, the DGI-administered system offers benefits to companies and consumers."] },
        { heading: "Recording efficiency", bullets: ["Review invoices captured by the system and download the CAFE document.", "Extract details into structured files and import them into an ERP.", "Issue invoices from the ERP when it is connected to the electronic invoicing platform."] },
        { heading: "Accessible and secure documents", paragraphs: ["Supporting documents can be stored in the cloud, on electronic devices or alongside the ERP transaction. This reduces paper, physical storage and the risk of loss or deterioration while enabling remote access."] },
        { heading: "Validation and reconciliation", paragraphs: ["QR codes help verify authenticity, while reports of issued and received documents facilitate accounts receivable, accounts payable and inventory reconciliations."] }
      ]
    },
    pt: {
      summary: "A faturação eletrônica melhora a captura, conservação, validação e conciliação dos registros contábeis.",
      sections: [
        { paragraphs: ["A fatura eletrônica é um documento fiscal digital juridicamente válido, assinado eletronicamente para garantir autenticidade, integridade e não repúdio. No Panamá, o sistema administrado pela DGI oferece benefícios para empresas e consumidores."] },
        { heading: "Eficiência no registro", bullets: ["Consultar as faturas captadas pelo sistema e baixar o CAFE.", "Extrair os detalhes para arquivos estruturados e importá-los no ERP.", "Emitir faturas a partir do ERP quando houver integração com a plataforma eletrônica."] },
        { heading: "Documentos acessíveis e seguros", paragraphs: ["Os documentos podem ser guardados na nuvem, em dispositivos eletrônicos ou junto à transação do ERP. Isso reduz papel, espaço físico e o risco de perda ou deterioração, além de facilitar o acesso remoto."] },
        { heading: "Validação e conciliação", paragraphs: ["O código QR permite verificar a autenticidade, enquanto os relatórios de documentos emitidos e recebidos facilitam as conciliações de contas a receber, contas a pagar e estoques."] }
      ]
    },
    fr: {
      summary: "La facturation électronique améliore la saisie, la conservation, la validation et le rapprochement des écritures comptables.",
      sections: [
        { paragraphs: ["La facture électronique est un document fiscal numérique juridiquement valable, signé électroniquement afin d’en garantir l’authenticité, l’intégrité et la non-répudiation. Au Panama, le système géré par la DGI offre des avantages aux entreprises comme aux consommateurs."] },
        { heading: "Efficacité de l’enregistrement", bullets: ["Consulter les factures reçues par le système et télécharger le CAFE.", "Extraire les détails dans des fichiers structurés et les importer dans l’ERP.", "Émettre des factures depuis l’ERP lorsqu’il est connecté à la plateforme électronique."] },
        { heading: "Documents accessibles et sécurisés", paragraphs: ["Les pièces justificatives peuvent être conservées dans le cloud, sur des appareils électroniques ou avec la transaction ERP. Cela réduit le papier, le stockage physique et le risque de perte ou de détérioration, tout en facilitant l’accès à distance."] },
        { heading: "Validation et rapprochement", paragraphs: ["Le code QR permet de vérifier l’authenticité, tandis que les rapports de documents émis et reçus facilitent les rapprochements des créances, dettes et stocks."] }
      ]
    }
  },
  "ifrs-18": {
    en: {
      summary: "IFRS 18 aims to make companies' financial performance more transparent, comparable and useful to investors.",
      sections: [
        { paragraphs: ["The IASB completed a new standard on presentation and disclosures in financial statements. IFRS 18 will affect all entities reporting under IFRS and will replace IAS 1 while retaining many of its requirements."] },
        { heading: "Three major improvements", bullets: ["Greater comparability in the statement of profit or loss.", "More transparency in management-defined performance measures.", "More useful grouping of financial information."] },
        { paragraphs: ["The standard will be mandatory for annual periods beginning on or after January 1, 2027, with early application permitted. Implementation effort will depend on each company's current reporting practices and technology systems."] }
      ]
    },
    pt: {
      summary: "A IFRS 18 busca tornar o desempenho financeiro das empresas mais transparente, comparável e útil para os investidores.",
      sections: [
        { paragraphs: ["O IASB concluiu uma nova norma sobre apresentação e divulgações nas demonstrações financeiras. A IFRS 18 afetará todas as entidades que reportam segundo as IFRS e substituirá a IAS 1, preservando muitos de seus requisitos."] },
        { heading: "Três melhorias principais", bullets: ["Maior comparabilidade na demonstração do resultado.", "Mais transparência nas medidas de desempenho definidas pela administração.", "Agrupamento mais útil das informações financeiras."] },
        { paragraphs: ["A norma será obrigatória para períodos anuais iniciados em ou após 1º de janeiro de 2027, com aplicação antecipada permitida. O esforço de implementação dependerá das práticas de reporte e dos sistemas tecnológicos atuais de cada empresa."] }
      ]
    },
    fr: {
      summary: "IFRS 18 vise à rendre la performance financière des entreprises plus transparente, comparable et utile aux investisseurs.",
      sections: [
        { paragraphs: ["L’IASB a achevé une nouvelle norme relative à la présentation et aux informations à fournir dans les états financiers. IFRS 18 concernera toutes les entités appliquant les IFRS et remplacera IAS 1, tout en conservant nombre de ses exigences."] },
        { heading: "Trois améliorations majeures", bullets: ["Une meilleure comparabilité du compte de résultat.", "Une transparence accrue des indicateurs de performance définis par la direction.", "Un regroupement plus utile de l’information financière."] },
        { paragraphs: ["La norme sera obligatoire pour les exercices ouverts à compter du 1er janvier 2027, avec une application anticipée autorisée. L’effort de mise en œuvre dépendra des pratiques de reporting et des systèmes technologiques actuels de chaque entreprise."] }
      ]
    }
  },
  "fatf-fifth-round": {
    en: {
      summary: "The FATF Fifth Round raises the standard: compliance will be assessed by its practical effectiveness, not merely by the formal existence of rules.",
      sections: [
        { paragraphs: ["The new mutual evaluation round, launched in 2024–2025 and extending toward 2027, will examine whether anti-money laundering, counter-terrorist financing and counter-proliferation systems produce concrete results."] },
        { heading: "From formal compliance to effectiveness", bullets: ["Capacity to identify and manage specific risks.", "Effective financial and non-financial supervision.", "Transparency of beneficial ownership.", "Proper operation of financial intelligence.", "Adaptation to emerging threats and typologies."] },
        { heading: "National preparation", paragraphs: ["Countries will need to update policies, strengthen risk-based management, improve reporting, coordinate institutions and develop technical and technological capabilities. Poor results may affect reputation, financial confidence and economic stability."] },
        { heading: "Implications for the private sector", paragraphs: ["Organizations will have to demonstrate that their programs are genuinely applied, due diligence is verifiable, controls work and monitoring is continuous. Compliance therefore becomes a strategic component of sustainability and reputation."] }
      ]
    },
    pt: {
      summary: "A Quinta Rodada do GAFI eleva o padrão: o compliance será avaliado por sua efetividade prática, e não apenas pela existência formal de normas.",
      sections: [
        { paragraphs: ["A nova rodada de avaliações mútuas, iniciada em 2024–2025 e projetada até 2027, examinará se os sistemas contra lavagem de dinheiro, financiamento do terrorismo e proliferação produzem resultados concretos."] },
        { heading: "Do cumprimento formal à efetividade", bullets: ["Capacidade de identificar e gerir riscos específicos.", "Supervisão financeira e não financeira efetiva.", "Transparência sobre beneficiários finais.", "Funcionamento adequado da inteligência financeira.", "Adaptação a ameaças e tipologias emergentes."] },
        { heading: "Preparação nacional", paragraphs: ["Os países deverão atualizar políticas, fortalecer a gestão baseada em riscos, melhorar os relatórios, coordenar instituições e desenvolver capacidades técnicas e tecnológicas. Um resultado insatisfatório pode afetar a reputação, a confiança financeira e a estabilidade econômica."] },
        { heading: "Implicações para o setor privado", paragraphs: ["As organizações terão de demonstrar que seus programas são realmente aplicados, que a devida diligência é verificável, que os controles funcionam e que o monitoramento é contínuo. O compliance torna-se, assim, um componente estratégico de sustentabilidade e reputação."] }
      ]
    },
    fr: {
      summary: "Le cinquième cycle du GAFI relève le niveau d’exigence : la conformité sera évaluée selon son efficacité concrète, et non uniquement selon l’existence formelle de règles.",
      sections: [
        { paragraphs: ["Le nouveau cycle d’évaluations mutuelles, lancé en 2024–2025 et projeté jusqu’en 2027, vérifiera si les dispositifs de lutte contre le blanchiment, le financement du terrorisme et la prolifération produisent des résultats concrets."] },
        { heading: "De la conformité formelle à l’efficacité", bullets: ["Capacité à identifier et gérer les risques propres au pays.", "Efficacité de la supervision financière et non financière.", "Transparence des bénéficiaires effectifs.", "Bon fonctionnement du renseignement financier.", "Adaptation aux menaces et typologies émergentes."] },
        { heading: "Préparation nationale", paragraphs: ["Les pays devront actualiser leurs politiques, renforcer la gestion fondée sur les risques, améliorer les rapports, coordonner les institutions et développer leurs capacités techniques et technologiques. Un résultat insuffisant peut affecter la réputation, la confiance financière et la stabilité économique."] },
        { heading: "Conséquences pour le secteur privé", paragraphs: ["Les organisations devront démontrer que leurs programmes sont réellement appliqués, que la diligence est vérifiable, que les contrôles fonctionnent et que le suivi est continu. La conformité devient ainsi un élément stratégique de durabilité et de réputation."] }
      ]
    }
  }
};

