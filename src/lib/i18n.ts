/**
 * ScamShield internationalisation.
 * 8 languages: English, French, Spanish, Arabic, Hindi, Chinese, Punjabi, Tagalog.
 */

export const LANGUAGES = {
  en: { name: 'English',  nativeName: 'English',   speechLang: 'en-US',  dir: 'ltr', locale: 'en' },
  fr: { name: 'French',   nativeName: 'Français',  speechLang: 'fr-FR',  dir: 'ltr', locale: 'fr' },
  es: { name: 'Spanish',  nativeName: 'Español',   speechLang: 'es-ES',  dir: 'ltr', locale: 'es' },
  ar: { name: 'Arabic',   nativeName: 'العربية',   speechLang: 'ar-SA',  dir: 'rtl', locale: 'ar' },
  hi: { name: 'Hindi',    nativeName: 'हिन्दी',    speechLang: 'hi-IN',  dir: 'ltr', locale: 'hi' },
  zh: { name: 'Chinese',  nativeName: '中文',       speechLang: 'zh-CN',  dir: 'ltr', locale: 'zh' },
  pa: { name: 'Punjabi',  nativeName: 'ਪੰਜਾਬੀ',    speechLang: 'pa-IN',  dir: 'ltr', locale: 'pa' },
  tl: { name: 'Tagalog',  nativeName: 'Tagalog',   speechLang: 'fil-PH', dir: 'ltr', locale: 'tl' },
} as const

export type LangCode = keyof typeof LANGUAGES

export interface Translations {
  nav: {
    analysis: string; liveCall: string; history: string; profile: string
    settings: string; help: string; dashboard: string; switchPersona: string
  }
  analysis: {
    cardHeader: string
    analyzingAs: string       // "Analyzing as {name}"
    modeText: string; modeUrl: string; modePhoto: string; modeDoc: string
    textPlaceholder: string; urlPlaceholder: string
    dropImage: string; dropImageSub: string
    dropDoc: string; dropDocSub: string
    readyToAnalyze: string    // appended after formatBytes
    analyzeBtn: string; analyzing: string
    quickTests: string
    progressSteps: [string, string, string, string]
    comparingTo: string       // "Comparing to {name}'s profile…"
    resultHeader: string
    looksSafe: string; scamDetected: string
    scoredAgainst: string     // "Scored against {name}'s profile"
    whyMatters: string        // "Why this matters for {name}"
    whatToDo: string
    copy: string; rerun: string; rawJson: string
    readyTitle: string        // "Ready to protect {name}"
    readySubtitle: string
    lowRisk: string; mediumRisk: string; highRisk: string
    feedbackDisclaimer: string  // "This alert may be incorrect."
    feedbackQuestion: string    // "Is this message legitimate?"
    feedbackYes: string         // "YES – this is legitimate"
    feedbackUnsure: string      // "I'm not sure"
    feedbackThanks: string      // "Thanks for your feedback"
  }
  liveCall: {
    title: string; subtitle: string
    liveLabel: string; readyLabel: string; recBadge: string
    transcriptLabel: string; analysedEvery: string
    listenMsg: string; readyMsg: string
    alertsLabel: string; noAlerts: string; alertsCount: string
    startBtn: string; stopBtn: string; resetTitle: string
    tip1Title: string; tip1Body: string
    tip2Title: string; tip2Body: string
    tip3Title: string; tip3Body: string
  }
  settings: {
    title: string; viewingAs: string
    appearance: string; theme: string; themeDesc: string
    dark: string; light: string
    language: string; languageDesc: string
    accessibility: string; textSize: string; textSizeDesc: string
    normal: string; large: string; extraLarge: string
    reduceMotion: string; reduceMotionDesc: string
    highContrast: string; highContrastDesc: string
    notifications: string
    scanComplete: string; scanCompleteDesc: string
    highRiskAlert: string; highRiskAlertDesc: string
    weeklyDigest: string; weeklyDigestDesc: string
    protection: string     // "Protection for {name}"
    textScanning: string; emailAnalysis: string; linkChecking: string
    paymentAlerts: string; phoneMonitoring: string
    dataPrivacy: string; exportData: string; clearHistory: string
    privacyNote: string
    version: string
  }
  history: {
    title: string; subtitle: string
    today: string; yesterday: string
    level: string; status: string
    blocked: string; cleared: string; flagged: string
  }
  profile: {
    title: string; memberSince: string
    scansThisMonth: string; threatsBlocked: string; safeRate: string
    commsPatterns: string; highlights: string; editProfile: string
  }
  common: {
    loading: string; error: string; close: string
    alerts: string; beta: string
  }
}

/* ─────────────────────────────────────────────────────────────────── */

const en: Translations = {
  nav: {
    analysis: 'Analysis', liveCall: 'Live Call', history: 'History', profile: 'Profile',
    settings: 'Settings', help: 'Help', dashboard: 'Dashboard', switchPersona: 'Switch persona →',
  },
  analysis: {
    cardHeader: 'New Scan',
    analyzingAs: 'Analyzing as',
    modeText: 'Text', modeUrl: 'URL', modePhoto: 'Photo', modeDoc: 'Doc',
    textPlaceholder: 'Paste suspicious message, email, DM, or conversation…',
    urlPlaceholder: 'https://suspicious-site.com/…',
    dropImage: 'Drop screenshot here', dropImageSub: 'or click to upload · PNG, JPG, WEBP',
    dropDoc: 'Drop document here', dropDocSub: 'or click to upload · PDF, TXT, CSV, HTML',
    readyToAnalyze: 'Ready to analyze',
    analyzeBtn: 'Analyze', analyzing: 'Analyzing…',
    quickTests: 'Quick Tests',
    progressSteps: ['Loading behavioral profile', 'Comparing message patterns', 'Scoring risk indicators', 'Generating explanation'],
    comparingTo: "Comparing to {name}'s behavioral profile…",
    resultHeader: 'Analysis Result',
    looksSafe: 'Looks safe', scamDetected: 'Scam detected',
    scoredAgainst: "Scored against {name}'s profile",
    whyMatters: 'Why this matters for {name}',
    whatToDo: 'What to do',
    copy: 'Copy', rerun: 'Re-run', rawJson: 'Raw JSON output',
    readyTitle: 'Ready to protect {name}',
    readySubtitle: 'Paste a message, link, or upload a file on the left and click Analyze.',
    lowRisk: 'LOW RISK', mediumRisk: 'MEDIUM RISK', highRisk: 'HIGH RISK',
    feedbackDisclaimer: 'This alert may be incorrect.',
    feedbackQuestion: 'Is this message legitimate?',
    feedbackYes: 'YES – this is legitimate',
    feedbackUnsure: "I'm not sure",
    feedbackThanks: 'Thanks for your feedback',
  },
  liveCall: {
    title: 'Live Call Protection',
    subtitle: 'Put a suspicious call on speaker. ScamShield listens and alerts in real time — audio never leaves your device.',
    liveLabel: 'LIVE MONITORING', readyLabel: 'Ready to monitor', recBadge: 'REC',
    transcriptLabel: 'Live Transcript', analysedEvery: 'analysed every 5 s',
    listenMsg: 'Listening — speak now…', readyMsg: 'Start monitoring to see transcript',
    alertsLabel: 'Risk Alerts', noAlerts: 'No alerts yet', alertsCount: 'alerts',
    startBtn: 'Start Monitoring', stopBtn: 'Stop', resetTitle: 'Clear & reset',
    tip1Title: 'Any phone works', tip1Body: 'Put the suspicious call on speaker, hold it near your laptop mic.',
    tip2Title: 'Alerts in ~5 s', tip2Body: 'Each 5-second chunk is analysed separately so you get warnings fast.',
    tip3Title: 'Audio stays local', tip3Body: 'Only the converted text reaches the server — no audio is ever uploaded.',
  },
  settings: {
    title: 'Settings', viewingAs: 'Viewing as',
    appearance: 'Appearance', theme: 'Theme', themeDesc: 'Choose how the dashboard looks',
    dark: 'Dark', light: 'Light',
    language: 'Language', languageDesc: 'Choose your preferred display and speech language',
    accessibility: 'Accessibility', textSize: 'Text size', textSizeDesc: 'Larger text makes the dashboard easier to read',
    normal: 'Normal', large: 'Large', extraLarge: 'Extra large',
    reduceMotion: 'Reduce motion', reduceMotionDesc: 'Turns off animations — helpful for motion sensitivity',
    highContrast: 'High contrast', highContrastDesc: 'Increases border and text contrast for better visibility',
    notifications: 'Notifications',
    scanComplete: 'Scan complete', scanCompleteDesc: 'Alert when an analysis finishes',
    highRiskAlert: 'High risk detected', highRiskAlertDesc: 'Immediate alert for 75+ risk scores',
    weeklyDigest: 'Weekly digest', weeklyDigestDesc: 'Summary of scans and blocked threats each week',
    protection: 'Protection for {name}',
    textScanning: 'Text message scanning', emailAnalysis: 'Email analysis', linkChecking: 'Link checking',
    paymentAlerts: 'Payment request alerts', phoneMonitoring: 'Phone call monitoring',
    dataPrivacy: 'Data & Privacy', exportData: 'Export data', clearHistory: 'Clear scan history',
    privacyNote: 'ScamShield stores your behavioral profile and scan history locally in your browser session. No data is sent to external servers without your consent.',
    version: 'ScamShield · GenAI Genesis 2026 · Demo build',
  },
  history: {
    title: 'Scan History', subtitle: 'Your recent scans and results',
    today: 'Today', yesterday: 'Yesterday',
    level: 'Level', status: 'Status',
    blocked: 'Blocked', cleared: 'Cleared', flagged: 'Flagged',
  },
  profile: {
    title: 'Profile',
    memberSince: 'Member since', scansThisMonth: 'Scans this month',
    threatsBlocked: 'Threats blocked', safeRate: 'Safe rate',
    commsPatterns: 'Communication patterns', highlights: 'Profile highlights', editProfile: 'Edit profile',
  },
  common: { loading: 'Loading…', error: 'Error', close: 'Close', alerts: 'alerts', beta: 'Beta' },
}

const fr: Translations = {
  nav: {
    analysis: 'Analyse', liveCall: 'Appel en direct', history: 'Historique', profile: 'Profil',
    settings: 'Paramètres', help: 'Aide', dashboard: 'Tableau de bord', switchPersona: 'Changer de persona →',
  },
  analysis: {
    cardHeader: 'Nouveau scan',
    analyzingAs: 'Analyse en tant que',
    modeText: 'Texte', modeUrl: 'URL', modePhoto: 'Photo', modeDoc: 'Doc',
    textPlaceholder: 'Collez un message suspect, un email, un DM ou une conversation…',
    urlPlaceholder: 'https://site-suspect.com/…',
    dropImage: 'Déposez une capture d\'écran ici', dropImageSub: 'ou cliquez pour télécharger · PNG, JPG, WEBP',
    dropDoc: 'Déposez un document ici', dropDocSub: 'ou cliquez pour télécharger · PDF, TXT, CSV, HTML',
    readyToAnalyze: 'Prêt à analyser',
    analyzeBtn: 'Analyser', analyzing: 'Analyse…',
    quickTests: 'Tests rapides',
    progressSteps: ['Chargement du profil comportemental', 'Comparaison des modèles', 'Calcul des indicateurs de risque', 'Génération de l\'explication'],
    comparingTo: 'Comparaison avec le profil de {name}…',
    resultHeader: 'Résultat de l\'analyse',
    looksSafe: 'Semble sûr', scamDetected: 'Arnaque détectée',
    scoredAgainst: 'Évalué par rapport au profil de {name}',
    whyMatters: 'Pourquoi c\'est important pour {name}',
    whatToDo: 'Que faire',
    copy: 'Copier', rerun: 'Relancer', rawJson: 'Sortie JSON brute',
    readyTitle: 'Prêt à protéger {name}',
    readySubtitle: 'Collez un message, un lien ou téléchargez un fichier à gauche et cliquez sur Analyser.',
    lowRisk: 'RISQUE FAIBLE', mediumRisk: 'RISQUE MOYEN', highRisk: 'RISQUE ÉLEVÉ',
    feedbackDisclaimer: 'Cette alerte peut être incorrecte.',
    feedbackQuestion: 'Ce message est-il légitime ?',
    feedbackYes: 'OUI – c\'est légitime',
    feedbackUnsure: 'Je ne suis pas sûr',
    feedbackThanks: 'Merci pour votre retour',
  },
  liveCall: {
    title: 'Protection d\'appel en direct',
    subtitle: 'Mettez un appel suspect sur haut-parleur. ScamShield écoute et alerte en temps réel — l\'audio ne quitte jamais votre appareil.',
    liveLabel: 'SURVEILLANCE EN DIRECT', readyLabel: 'Prêt à surveiller', recBadge: 'REC',
    transcriptLabel: 'Transcription en direct', analysedEvery: 'analysé toutes les 5 s',
    listenMsg: 'Écoute — parlez maintenant…', readyMsg: 'Démarrez pour voir la transcription',
    alertsLabel: 'Alertes de risque', noAlerts: 'Aucune alerte', alertsCount: 'alertes',
    startBtn: 'Démarrer la surveillance', stopBtn: 'Arrêter', resetTitle: 'Effacer et réinitialiser',
    tip1Title: 'Tout téléphone fonctionne', tip1Body: 'Mettez l\'appel suspect sur haut-parleur, près du micro de votre ordinateur.',
    tip2Title: 'Alertes en ~5 s', tip2Body: 'Chaque segment de 5 secondes est analysé séparément pour des avertissements rapides.',
    tip3Title: 'Audio reste local', tip3Body: 'Seul le texte converti atteint le serveur — aucun audio n\'est jamais téléchargé.',
  },
  settings: {
    title: 'Paramètres', viewingAs: 'Connecté en tant que',
    appearance: 'Apparence', theme: 'Thème', themeDesc: 'Choisissez l\'apparence du tableau de bord',
    dark: 'Sombre', light: 'Clair',
    language: 'Langue', languageDesc: 'Choisissez votre langue d\'affichage et de reconnaissance vocale',
    accessibility: 'Accessibilité', textSize: 'Taille du texte', textSizeDesc: 'Un texte plus grand facilite la lecture',
    normal: 'Normal', large: 'Grand', extraLarge: 'Très grand',
    reduceMotion: 'Réduire les animations', reduceMotionDesc: 'Désactive les animations — utile en cas de sensibilité au mouvement',
    highContrast: 'Contraste élevé', highContrastDesc: 'Augmente le contraste des bordures et du texte',
    notifications: 'Notifications',
    scanComplete: 'Analyse terminée', scanCompleteDesc: 'Alerte quand une analyse est terminée',
    highRiskAlert: 'Risque élevé détecté', highRiskAlertDesc: 'Alerte immédiate pour les scores de risque ≥ 75',
    weeklyDigest: 'Résumé hebdomadaire', weeklyDigestDesc: 'Résumé des analyses et des menaces bloquées chaque semaine',
    protection: 'Protection pour {name}',
    textScanning: 'Analyse des SMS', emailAnalysis: 'Analyse des emails', linkChecking: 'Vérification des liens',
    paymentAlerts: 'Alertes de paiement', phoneMonitoring: 'Surveillance des appels téléphoniques',
    dataPrivacy: 'Données et confidentialité', exportData: 'Exporter les données', clearHistory: 'Effacer l\'historique',
    privacyNote: 'ScamShield stocke votre profil comportemental et votre historique localement dans votre navigateur. Aucune donnée n\'est envoyée à des serveurs externes sans votre consentement.',
    version: 'ScamShield · GenAI Genesis 2026 · Version démo',
  },
  history: {
    title: 'Historique des scans', subtitle: 'Vos analyses récentes',
    today: 'Aujourd\'hui', yesterday: 'Hier',
    level: 'Niveau', status: 'Statut',
    blocked: 'Bloqué', cleared: 'Autorisé', flagged: 'Signalé',
  },
  profile: {
    title: 'Profil',
    memberSince: 'Membre depuis', scansThisMonth: 'Scans ce mois',
    threatsBlocked: 'Menaces bloquées', safeRate: 'Taux de sécurité',
    commsPatterns: 'Modèles de communication', highlights: 'Points forts du profil', editProfile: 'Modifier le profil',
  },
  common: { loading: 'Chargement…', error: 'Erreur', close: 'Fermer', alerts: 'alertes', beta: 'Bêta' },
}

const es: Translations = {
  nav: {
    analysis: 'Análisis', liveCall: 'Llamada en vivo', history: 'Historial', profile: 'Perfil',
    settings: 'Configuración', help: 'Ayuda', dashboard: 'Panel', switchPersona: 'Cambiar persona →',
  },
  analysis: {
    cardHeader: 'Nuevo escaneo',
    analyzingAs: 'Analizando como',
    modeText: 'Texto', modeUrl: 'URL', modePhoto: 'Foto', modeDoc: 'Doc',
    textPlaceholder: 'Pega un mensaje sospechoso, correo electrónico, DM o conversación…',
    urlPlaceholder: 'https://sitio-sospechoso.com/…',
    dropImage: 'Suelta la captura de pantalla aquí', dropImageSub: 'o haz clic para subir · PNG, JPG, WEBP',
    dropDoc: 'Suelta el documento aquí', dropDocSub: 'o haz clic para subir · PDF, TXT, CSV, HTML',
    readyToAnalyze: 'Listo para analizar',
    analyzeBtn: 'Analizar', analyzing: 'Analizando…',
    quickTests: 'Pruebas rápidas',
    progressSteps: ['Cargando perfil de comportamiento', 'Comparando patrones', 'Calculando indicadores de riesgo', 'Generando explicación'],
    comparingTo: 'Comparando con el perfil de {name}…',
    resultHeader: 'Resultado del análisis',
    looksSafe: 'Parece seguro', scamDetected: 'Estafa detectada',
    scoredAgainst: 'Puntuado contra el perfil de {name}',
    whyMatters: 'Por qué es importante para {name}',
    whatToDo: 'Qué hacer',
    copy: 'Copiar', rerun: 'Repetir', rawJson: 'Salida JSON sin formato',
    readyTitle: 'Listo para proteger a {name}',
    readySubtitle: 'Pega un mensaje, enlace o sube un archivo a la izquierda y haz clic en Analizar.',
    lowRisk: 'RIESGO BAJO', mediumRisk: 'RIESGO MEDIO', highRisk: 'RIESGO ALTO',
    feedbackDisclaimer: 'Esta alerta puede ser incorrecta.',
    feedbackQuestion: '¿Este mensaje es legítimo?',
    feedbackYes: 'SÍ – esto es legítimo',
    feedbackUnsure: 'No estoy seguro',
    feedbackThanks: 'Gracias por tu comentario',
  },
  liveCall: {
    title: 'Protección de llamadas en vivo',
    subtitle: 'Pon la llamada sospechosa en altavoz. ScamShield escucha y alerta en tiempo real — el audio nunca sale de tu dispositivo.',
    liveLabel: 'MONITOREO EN VIVO', readyLabel: 'Listo para monitorear', recBadge: 'REC',
    transcriptLabel: 'Transcripción en vivo', analysedEvery: 'analizado cada 5 s',
    listenMsg: 'Escuchando — habla ahora…', readyMsg: 'Inicia para ver la transcripción',
    alertsLabel: 'Alertas de riesgo', noAlerts: 'Sin alertas aún', alertsCount: 'alertas',
    startBtn: 'Iniciar monitoreo', stopBtn: 'Detener', resetTitle: 'Borrar y reiniciar',
    tip1Title: 'Cualquier teléfono funciona', tip1Body: 'Pon la llamada en altavoz cerca del micrófono de tu computadora.',
    tip2Title: 'Alertas en ~5 s', tip2Body: 'Cada fragmento de 5 segundos se analiza por separado para avisos rápidos.',
    tip3Title: 'El audio se queda local', tip3Body: 'Solo el texto convertido llega al servidor — no se sube ningún audio.',
  },
  settings: {
    title: 'Configuración', viewingAs: 'Viendo como',
    appearance: 'Apariencia', theme: 'Tema', themeDesc: 'Elige cómo se ve el panel',
    dark: 'Oscuro', light: 'Claro',
    language: 'Idioma', languageDesc: 'Elige tu idioma preferido de visualización y reconocimiento de voz',
    accessibility: 'Accesibilidad', textSize: 'Tamaño de texto', textSizeDesc: 'Un texto más grande facilita la lectura',
    normal: 'Normal', large: 'Grande', extraLarge: 'Extra grande',
    reduceMotion: 'Reducir animaciones', reduceMotionDesc: 'Desactiva las animaciones — útil para sensibilidad al movimiento',
    highContrast: 'Alto contraste', highContrastDesc: 'Aumenta el contraste de bordes y texto',
    notifications: 'Notificaciones',
    scanComplete: 'Escaneo completo', scanCompleteDesc: 'Alerta cuando un análisis termina',
    highRiskAlert: 'Riesgo alto detectado', highRiskAlertDesc: 'Alerta inmediata para puntuaciones de riesgo ≥ 75',
    weeklyDigest: 'Resumen semanal', weeklyDigestDesc: 'Resumen de escaneos y amenazas bloqueadas cada semana',
    protection: 'Protección para {name}',
    textScanning: 'Escaneo de mensajes de texto', emailAnalysis: 'Análisis de correo electrónico', linkChecking: 'Verificación de enlaces',
    paymentAlerts: 'Alertas de solicitudes de pago', phoneMonitoring: 'Monitoreo de llamadas telefónicas',
    dataPrivacy: 'Datos y privacidad', exportData: 'Exportar datos', clearHistory: 'Borrar historial',
    privacyNote: 'ScamShield almacena tu perfil de comportamiento e historial localmente en tu navegador. No se envían datos a servidores externos sin tu consentimiento.',
    version: 'ScamShield · GenAI Genesis 2026 · Demo',
  },
  history: {
    title: 'Historial de escaneos', subtitle: 'Tus análisis recientes',
    today: 'Hoy', yesterday: 'Ayer',
    level: 'Nivel', status: 'Estado',
    blocked: 'Bloqueado', cleared: 'Despejado', flagged: 'Marcado',
  },
  profile: {
    title: 'Perfil',
    memberSince: 'Miembro desde', scansThisMonth: 'Escaneos este mes',
    threatsBlocked: 'Amenazas bloqueadas', safeRate: 'Tasa de seguridad',
    commsPatterns: 'Patrones de comunicación', highlights: 'Puntos destacados', editProfile: 'Editar perfil',
  },
  common: { loading: 'Cargando…', error: 'Error', close: 'Cerrar', alerts: 'alertas', beta: 'Beta' },
}

const ar: Translations = {
  nav: {
    analysis: 'التحليل', liveCall: 'المكالمة المباشرة', history: 'السجل', profile: 'الملف الشخصي',
    settings: 'الإعدادات', help: 'المساعدة', dashboard: 'لوحة التحكم', switchPersona: 'تغيير الشخصية →',
  },
  analysis: {
    cardHeader: 'فحص جديد',
    analyzingAs: 'تحليل باسم',
    modeText: 'نص', modeUrl: 'رابط', modePhoto: 'صورة', modeDoc: 'مستند',
    textPlaceholder: 'الصق رسالة مشبوهة أو بريد إلكتروني أو محادثة هنا…',
    urlPlaceholder: 'https://موقع-مشبوه.com/…',
    dropImage: 'أفلت لقطة الشاشة هنا', dropImageSub: 'أو انقر للرفع · PNG, JPG, WEBP',
    dropDoc: 'أفلت المستند هنا', dropDocSub: 'أو انقر للرفع · PDF, TXT, CSV, HTML',
    readyToAnalyze: 'جاهز للتحليل',
    analyzeBtn: 'تحليل', analyzing: 'جارٍ التحليل…',
    quickTests: 'اختبارات سريعة',
    progressSteps: ['تحميل الملف الشخصي السلوكي', 'مقارنة أنماط الرسائل', 'تقييم مؤشرات المخاطر', 'إنشاء الشرح'],
    comparingTo: 'المقارنة مع ملف {name} الشخصي…',
    resultHeader: 'نتيجة التحليل',
    looksSafe: 'يبدو آمناً', scamDetected: 'تم اكتشاف احتيال',
    scoredAgainst: 'تم التقييم مقابل ملف {name}',
    whyMatters: 'لماذا يهم هذا بالنسبة لـ {name}',
    whatToDo: 'ماذا تفعل',
    copy: 'نسخ', rerun: 'إعادة', rawJson: 'JSON الخام',
    readyTitle: 'جاهز لحماية {name}',
    readySubtitle: 'الصق رسالة أو رابطاً أو ارفع ملفاً على اليسار ثم انقر تحليل.',
    lowRisk: 'خطر منخفض', mediumRisk: 'خطر متوسط', highRisk: 'خطر مرتفع',
    feedbackDisclaimer: 'قد تكون هذه التنبيه غير صحيح.',
    feedbackQuestion: 'هل هذه الرسالة شرعية؟',
    feedbackYes: 'نعم – هذه رسالة شرعية',
    feedbackUnsure: 'لست متأكداً',
    feedbackThanks: 'شكراً على ملاحظتك',
  },
  liveCall: {
    title: 'حماية المكالمات المباشرة',
    subtitle: 'ضع المكالمة المشبوهة على السماعة. ScamShield يستمع وينبّه في الوقت الفعلي — الصوت لا يغادر جهازك أبداً.',
    liveLabel: 'مراقبة مباشرة', readyLabel: 'جاهز للمراقبة', recBadge: 'تسجيل',
    transcriptLabel: 'النص المباشر', analysedEvery: 'يُحلَّل كل 5 ثوانٍ',
    listenMsg: 'جارٍ الاستماع — تحدث الآن…', readyMsg: 'ابدأ المراقبة لرؤية النص',
    alertsLabel: 'تنبيهات المخاطر', noAlerts: 'لا تنبيهات حتى الآن', alertsCount: 'تنبيهات',
    startBtn: 'بدء المراقبة', stopBtn: 'إيقاف', resetTitle: 'مسح وإعادة ضبط',
    tip1Title: 'يعمل مع أي هاتف', tip1Body: 'ضع المكالمة على السماعة بالقرب من ميكروفون الكمبيوتر.',
    tip2Title: 'تنبيهات خلال ~5 ثوانٍ', tip2Body: 'يُحلَّل كل مقطع من 5 ثوانٍ بشكل منفصل للحصول على تحذيرات سريعة.',
    tip3Title: 'الصوت يبقى محلياً', tip3Body: 'النص المحوَّل فقط يصل إلى الخادم — لا يُرفع أي صوت.',
  },
  settings: {
    title: 'الإعدادات', viewingAs: 'تصفح بوصفك',
    appearance: 'المظهر', theme: 'السمة', themeDesc: 'اختر كيف تبدو لوحة التحكم',
    dark: 'داكن', light: 'فاتح',
    language: 'اللغة', languageDesc: 'اختر لغة العرض والتعرف على الكلام',
    accessibility: 'إمكانية الوصول', textSize: 'حجم النص', textSizeDesc: 'النص الأكبر يسهّل القراءة',
    normal: 'عادي', large: 'كبير', extraLarge: 'كبير جداً',
    reduceMotion: 'تقليل الحركة', reduceMotionDesc: 'إيقاف الرسوم المتحركة — مفيد للحساسية من الحركة',
    highContrast: 'تباين عالٍ', highContrastDesc: 'يزيد من تباين الحدود والنص',
    notifications: 'الإشعارات',
    scanComplete: 'اكتمل الفحص', scanCompleteDesc: 'تنبيه عند اكتمال التحليل',
    highRiskAlert: 'خطر مرتفع', highRiskAlertDesc: 'تنبيه فوري عند درجات خطر ≥ 75',
    weeklyDigest: 'ملخص أسبوعي', weeklyDigestDesc: 'ملخص الفحوصات والتهديدات المحجوبة',
    protection: 'الحماية لـ {name}',
    textScanning: 'فحص الرسائل النصية', emailAnalysis: 'تحليل البريد الإلكتروني', linkChecking: 'التحقق من الروابط',
    paymentAlerts: 'تنبيهات طلبات الدفع', phoneMonitoring: 'مراقبة المكالمات الهاتفية',
    dataPrivacy: 'البيانات والخصوصية', exportData: 'تصدير البيانات', clearHistory: 'مسح السجل',
    privacyNote: 'يخزن ScamShield ملفك الشخصي السلوكي وسجل الفحص محلياً في متصفحك. لا ترسل أي بيانات إلى خوادم خارجية دون موافقتك.',
    version: 'ScamShield · GenAI Genesis 2026 · نسخة تجريبية',
  },
  history: {
    title: 'سجل الفحص', subtitle: 'فحوصاتك ونتائجك الأخيرة',
    today: 'اليوم', yesterday: 'أمس',
    level: 'المستوى', status: 'الحالة',
    blocked: 'محجوب', cleared: 'آمن', flagged: 'مُعلَّم',
  },
  profile: {
    title: 'الملف الشخصي',
    memberSince: 'عضو منذ', scansThisMonth: 'فحوصات هذا الشهر',
    threatsBlocked: 'التهديدات المحجوبة', safeRate: 'معدل الأمان',
    commsPatterns: 'أنماط التواصل', highlights: 'أبرز ما في الملف', editProfile: 'تعديل الملف',
  },
  common: { loading: 'جارٍ التحميل…', error: 'خطأ', close: 'إغلاق', alerts: 'تنبيهات', beta: 'تجريبي' },
}

const hi: Translations = {
  nav: {
    analysis: 'विश्लेषण', liveCall: 'लाइव कॉल', history: 'इतिहास', profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स', help: 'सहायता', dashboard: 'डैशबोर्ड', switchPersona: 'व्यक्तित्व बदलें →',
  },
  analysis: {
    cardHeader: 'नया स्कैन',
    analyzingAs: 'के रूप में विश्लेषण',
    modeText: 'टेक्स्ट', modeUrl: 'URL', modePhoto: 'फोटो', modeDoc: 'दस्तावेज़',
    textPlaceholder: 'संदिग्ध संदेश, ईमेल, DM या बातचीत यहाँ पेस्ट करें…',
    urlPlaceholder: 'https://संदिग्ध-साइट.com/…',
    dropImage: 'स्क्रीनशॉट यहाँ छोड़ें', dropImageSub: 'या अपलोड करने के लिए क्लिक करें · PNG, JPG, WEBP',
    dropDoc: 'दस्तावेज़ यहाँ छोड़ें', dropDocSub: 'या अपलोड करने के लिए क्लिक करें · PDF, TXT, CSV, HTML',
    readyToAnalyze: 'विश्लेषण के लिए तैयार',
    analyzeBtn: 'विश्लेषण करें', analyzing: 'विश्लेषण हो रहा है…',
    quickTests: 'त्वरित परीक्षण',
    progressSteps: ['व्यवहार प्रोफ़ाइल लोड हो रही है', 'संदेश पैटर्न की तुलना', 'जोखिम संकेतक स्कोर करना', 'स्पष्टीकरण तैयार हो रहा है'],
    comparingTo: '{name} की व्यवहार प्रोफ़ाइल से तुलना…',
    resultHeader: 'विश्लेषण परिणाम',
    looksSafe: 'सुरक्षित लगता है', scamDetected: 'धोखाधड़ी का पता चला',
    scoredAgainst: '{name} की प्रोफ़ाइल के विरुद्ध स्कोर',
    whyMatters: '{name} के लिए यह क्यों महत्वपूर्ण है',
    whatToDo: 'क्या करें',
    copy: 'कॉपी', rerun: 'दोबारा चलाएं', rawJson: 'कच्चा JSON आउटपुट',
    readyTitle: '{name} की सुरक्षा के लिए तैयार',
    readySubtitle: 'बाईं तरफ संदेश, लिंक पेस्ट करें या फ़ाइल अपलोड करें और विश्लेषण करें पर क्लिक करें।',
    lowRisk: 'कम जोखिम', mediumRisk: 'मध्यम जोखिम', highRisk: 'उच्च जोखिम',
    feedbackDisclaimer: 'यह अलर्ट गलत हो सकता है।',
    feedbackQuestion: 'क्या यह संदेश वैध है?',
    feedbackYes: 'हाँ – यह वैध है',
    feedbackUnsure: 'मुझे यकीन नहीं है',
    feedbackThanks: 'आपकी प्रतिक्रिया के लिए धन्यवाद',
  },
  liveCall: {
    title: 'लाइव कॉल सुरक्षा',
    subtitle: 'संदिग्ध कॉल को स्पीकर पर रखें। ScamShield सुनता है और तुरंत सचेत करता है — ऑडियो आपके डिवाइस से कभी नहीं जाता।',
    liveLabel: 'लाइव निगरानी', readyLabel: 'निगरानी के लिए तैयार', recBadge: 'REC',
    transcriptLabel: 'लाइव ट्रांसक्रिप्ट', analysedEvery: 'हर 5 सेकंड में विश्लेषण',
    listenMsg: 'सुन रहा है — अब बोलें…', readyMsg: 'ट्रांसक्रिप्ट देखने के लिए निगरानी शुरू करें',
    alertsLabel: 'जोखिम अलर्ट', noAlerts: 'अभी तक कोई अलर्ट नहीं', alertsCount: 'अलर्ट',
    startBtn: 'निगरानी शुरू करें', stopBtn: 'रोकें', resetTitle: 'साफ़ करें और रीसेट करें',
    tip1Title: 'कोई भी फोन काम करता है', tip1Body: 'संदिग्ध कॉल को स्पीकर पर रखें, लैपटॉप माइक के पास।',
    tip2Title: '~5 सेकंड में अलर्ट', tip2Body: 'हर 5 सेकंड के खंड का अलग से विश्लेषण होता है।',
    tip3Title: 'ऑडियो स्थानीय रहता है', tip3Body: 'केवल परिवर्तित टेक्स्ट सर्वर तक पहुँचता है — कोई ऑडियो अपलोड नहीं होता।',
  },
  settings: {
    title: 'सेटिंग्स', viewingAs: 'इस रूप में देख रहे हैं',
    appearance: 'दिखावट', theme: 'थीम', themeDesc: 'डैशबोर्ड का स्वरूप चुनें',
    dark: 'डार्क', light: 'लाइट',
    language: 'भाषा', languageDesc: 'अपनी पसंदीदा प्रदर्शन और वाक् पहचान भाषा चुनें',
    accessibility: 'अभिगम्यता', textSize: 'टेक्स्ट आकार', textSizeDesc: 'बड़ा टेक्स्ट पढ़ना आसान बनाता है',
    normal: 'सामान्य', large: 'बड़ा', extraLarge: 'अत्यधिक बड़ा',
    reduceMotion: 'एनिमेशन कम करें', reduceMotionDesc: 'एनिमेशन बंद करता है — गति संवेदनशीलता के लिए उपयोगी',
    highContrast: 'उच्च कंट्रास्ट', highContrastDesc: 'बॉर्डर और टेक्स्ट कंट्रास्ट बढ़ाता है',
    notifications: 'सूचनाएं',
    scanComplete: 'स्कैन पूर्ण', scanCompleteDesc: 'विश्लेषण समाप्त होने पर अलर्ट',
    highRiskAlert: 'उच्च जोखिम का पता चला', highRiskAlertDesc: '75+ जोखिम स्कोर के लिए तत्काल अलर्ट',
    weeklyDigest: 'साप्ताहिक सारांश', weeklyDigestDesc: 'हर सप्ताह स्कैन और अवरुद्ध खतरों का सारांश',
    protection: '{name} के लिए सुरक्षा',
    textScanning: 'टेक्स्ट संदेश स्कैनिंग', emailAnalysis: 'ईमेल विश्लेषण', linkChecking: 'लिंक जाँच',
    paymentAlerts: 'भुगतान अनुरोध अलर्ट', phoneMonitoring: 'फोन कॉल निगरानी',
    dataPrivacy: 'डेटा और गोपनीयता', exportData: 'डेटा निर्यात करें', clearHistory: 'स्कैन इतिहास साफ़ करें',
    privacyNote: 'ScamShield आपकी व्यवहार प्रोफ़ाइल और स्कैन इतिहास आपके ब्राउज़र में स्थानीय रूप से संग्रहीत करता है।',
    version: 'ScamShield · GenAI Genesis 2026 · डेमो',
  },
  history: {
    title: 'स्कैन इतिहास', subtitle: 'आपके हाल के स्कैन और परिणाम',
    today: 'आज', yesterday: 'कल',
    level: 'स्तर', status: 'स्थिति',
    blocked: 'अवरुद्ध', cleared: 'सुरक्षित', flagged: 'चिह्नित',
  },
  profile: {
    title: 'प्रोफ़ाइल',
    memberSince: 'सदस्य बने', scansThisMonth: 'इस महीने स्कैन',
    threatsBlocked: 'अवरुद्ध खतरे', safeRate: 'सुरक्षा दर',
    commsPatterns: 'संचार पैटर्न', highlights: 'प्रोफ़ाइल विशेषताएं', editProfile: 'प्रोफ़ाइल संपादित करें',
  },
  common: { loading: 'लोड हो रहा है…', error: 'त्रुटि', close: 'बंद करें', alerts: 'अलर्ट', beta: 'बीटा' },
}

const zh: Translations = {
  nav: {
    analysis: '分析', liveCall: '实时通话', history: '历史', profile: '个人资料',
    settings: '设置', help: '帮助', dashboard: '控制台', switchPersona: '切换角色 →',
  },
  analysis: {
    cardHeader: '新扫描',
    analyzingAs: '正在以此身份分析',
    modeText: '文字', modeUrl: '链接', modePhoto: '图片', modeDoc: '文档',
    textPlaceholder: '粘贴可疑消息、邮件、私信或对话…',
    urlPlaceholder: 'https://可疑网站.com/…',
    dropImage: '将截图拖放到此处', dropImageSub: '或点击上传 · PNG, JPG, WEBP',
    dropDoc: '将文档拖放到此处', dropDocSub: '或点击上传 · PDF, TXT, CSV, HTML',
    readyToAnalyze: '准备分析',
    analyzeBtn: '分析', analyzing: '分析中…',
    quickTests: '快速测试',
    progressSteps: ['加载行为档案', '比较消息模式', '评估风险指标', '生成解释'],
    comparingTo: '正在与{name}的行为档案比较…',
    resultHeader: '分析结果',
    looksSafe: '看起来安全', scamDetected: '检测到诈骗',
    scoredAgainst: '根据{name}的档案评分',
    whyMatters: '这对{name}为何重要',
    whatToDo: '该怎么做',
    copy: '复制', rerun: '重新运行', rawJson: '原始JSON输出',
    readyTitle: '准备好保护{name}',
    readySubtitle: '在左侧粘贴消息或链接，或上传文件，然后点击分析。',
    lowRisk: '低风险', mediumRisk: '中等风险', highRisk: '高风险',
    feedbackDisclaimer: '此警报可能有误。',
    feedbackQuestion: '这条消息是合法的吗？',
    feedbackYes: '是的 – 这是合法的',
    feedbackUnsure: '我不确定',
    feedbackThanks: '感谢您的反馈',
  },
  liveCall: {
    title: '实时通话保护',
    subtitle: '将可疑通话开启免提。ScamShield实时监听并发出警报 — 音频永远不会离开您的设备。',
    liveLabel: '实时监控', readyLabel: '准备监控', recBadge: '录制',
    transcriptLabel: '实时转录', analysedEvery: '每5秒分析一次',
    listenMsg: '正在监听 — 请说话…', readyMsg: '开始监控以查看转录',
    alertsLabel: '风险警报', noAlerts: '暂无警报', alertsCount: '警报',
    startBtn: '开始监控', stopBtn: '停止', resetTitle: '清除并重置',
    tip1Title: '任何手机都可使用', tip1Body: '将可疑通话开启免提，靠近笔记本电脑麦克风。',
    tip2Title: '约5秒内发出警报', tip2Body: '每5秒的片段单独分析，快速获得警告。',
    tip3Title: '音频保留在本地', tip3Body: '只有转换后的文本到达服务器 — 不会上传任何音频。',
  },
  settings: {
    title: '设置', viewingAs: '正在以此身份查看',
    appearance: '外观', theme: '主题', themeDesc: '选择控制台的外观',
    dark: '深色', light: '浅色',
    language: '语言', languageDesc: '选择您偏好的显示和语音识别语言',
    accessibility: '无障碍', textSize: '字体大小', textSizeDesc: '较大的字体使控制台更易阅读',
    normal: '正常', large: '大', extraLarge: '超大',
    reduceMotion: '减少动画', reduceMotionDesc: '关闭动画 — 适合对运动敏感的用户',
    highContrast: '高对比度', highContrastDesc: '增加边框和文字的对比度',
    notifications: '通知',
    scanComplete: '扫描完成', scanCompleteDesc: '分析完成时发出警报',
    highRiskAlert: '检测到高风险', highRiskAlertDesc: '风险评分≥75时立即警报',
    weeklyDigest: '每周摘要', weeklyDigestDesc: '每周扫描和阻止威胁的摘要',
    protection: '{name}的保护',
    textScanning: '短信扫描', emailAnalysis: '邮件分析', linkChecking: '链接检查',
    paymentAlerts: '付款请求警报', phoneMonitoring: '电话监控',
    dataPrivacy: '数据与隐私', exportData: '导出数据', clearHistory: '清除扫描历史',
    privacyNote: 'ScamShield将您的行为档案和扫描历史本地存储在浏览器中。未经您同意，不会向外部服务器发送任何数据。',
    version: 'ScamShield · GenAI Genesis 2026 · 演示版',
  },
  history: {
    title: '扫描历史', subtitle: '您最近的扫描和结果',
    today: '今天', yesterday: '昨天',
    level: '级别', status: '状态',
    blocked: '已阻止', cleared: '已清除', flagged: '已标记',
  },
  profile: {
    title: '个人资料',
    memberSince: '会员自', scansThisMonth: '本月扫描次数',
    threatsBlocked: '已阻止威胁', safeRate: '安全率',
    commsPatterns: '通信模式', highlights: '档案亮点', editProfile: '编辑资料',
  },
  common: { loading: '加载中…', error: '错误', close: '关闭', alerts: '警报', beta: '测试版' },
}

const pa: Translations = {
  nav: {
    analysis: 'ਵਿਸ਼ਲੇਸ਼ਣ', liveCall: 'ਲਾਈਵ ਕਾਲ', history: 'ਇਤਿਹਾਸ', profile: 'ਪ੍ਰੋਫਾਈਲ',
    settings: 'ਸੈਟਿੰਗਾਂ', help: 'ਮਦਦ', dashboard: 'ਡੈਸ਼ਬੋਰਡ', switchPersona: 'ਵਿਅਕਤੀਤਵ ਬਦਲੋ →',
  },
  analysis: {
    cardHeader: 'ਨਵੀਂ ਸਕੈਨ',
    analyzingAs: 'ਇਸ ਤਰ੍ਹਾਂ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਹੇ ਹਾਂ',
    modeText: 'ਟੈਕਸਟ', modeUrl: 'URL', modePhoto: 'ਫੋਟੋ', modeDoc: 'ਦਸਤਾਵੇਜ਼',
    textPlaceholder: 'ਸ਼ੱਕੀ ਸੁਨੇਹਾ, ਈਮੇਲ, ਜਾਂ ਗੱਲਬਾਤ ਇੱਥੇ ਪੇਸਟ ਕਰੋ…',
    urlPlaceholder: 'https://ਸ਼ੱਕੀ-ਸਾਈਟ.com/…',
    dropImage: 'ਸਕਰੀਨਸ਼ੌਟ ਇੱਥੇ ਛੱਡੋ', dropImageSub: 'ਜਾਂ ਅਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ · PNG, JPG, WEBP',
    dropDoc: 'ਦਸਤਾਵੇਜ਼ ਇੱਥੇ ਛੱਡੋ', dropDocSub: 'ਜਾਂ ਅਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ · PDF, TXT, CSV, HTML',
    readyToAnalyze: 'ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਤਿਆਰ',
    analyzeBtn: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ', analyzing: 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ…',
    quickTests: 'ਤੇਜ਼ ਟੈਸਟ',
    progressSteps: ['ਵਿਵਹਾਰ ਪ੍ਰੋਫਾਈਲ ਲੋਡ ਹੋ ਰਹੀ ਹੈ', 'ਸੁਨੇਹਾ ਪੈਟਰਨ ਦੀ ਤੁਲਨਾ', 'ਜੋਖਮ ਸੂਚਕ ਸਕੋਰ ਕਰਨਾ', 'ਵਿਆਖਿਆ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ'],
    comparingTo: '{name} ਦੀ ਵਿਵਹਾਰ ਪ੍ਰੋਫਾਈਲ ਨਾਲ ਤੁਲਨਾ…',
    resultHeader: 'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ',
    looksSafe: 'ਸੁਰੱਖਿਅਤ ਲੱਗਦਾ ਹੈ', scamDetected: 'ਧੋਖਾਧੜੀ ਦਾ ਪਤਾ ਲੱਗਾ',
    scoredAgainst: '{name} ਦੀ ਪ੍ਰੋਫਾਈਲ ਅਨੁਸਾਰ ਸਕੋਰ',
    whyMatters: '{name} ਲਈ ਇਹ ਕਿਉਂ ਮਹੱਤਵਪੂਰਨ ਹੈ',
    whatToDo: 'ਕੀ ਕਰਨਾ ਹੈ',
    copy: 'ਕਾਪੀ', rerun: 'ਦੁਬਾਰਾ ਚਲਾਓ', rawJson: 'ਕੱਚਾ JSON',
    readyTitle: '{name} ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਤਿਆਰ',
    readySubtitle: 'ਖੱਬੇ ਪਾਸੇ ਸੁਨੇਹਾ ਜਾਂ ਲਿੰਕ ਪੇਸਟ ਕਰੋ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ ਤੇ ਕਲਿੱਕ ਕਰੋ।',
    lowRisk: 'ਘੱਟ ਜੋਖਮ', mediumRisk: 'ਮੱਧਮ ਜੋਖਮ', highRisk: 'ਉੱਚ ਜੋਖਮ',
    feedbackDisclaimer: 'ਇਹ ਅਲਰਟ ਗਲਤ ਹੋ ਸਕਦਾ ਹੈ।',
    feedbackQuestion: 'ਕੀ ਇਹ ਸੁਨੇਹਾ ਜਾਇਜ਼ ਹੈ?',
    feedbackYes: 'ਹਾਂ – ਇਹ ਜਾਇਜ਼ ਹੈ',
    feedbackUnsure: 'ਮੈਨੂੰ ਯਕੀਨ ਨਹੀਂ',
    feedbackThanks: 'ਤੁਹਾਡੀ ਪ੍ਰਤੀਕਿਰਿਆ ਲਈ ਧੰਨਵਾਦ',
  },
  liveCall: {
    title: 'ਲਾਈਵ ਕਾਲ ਸੁਰੱਖਿਆ',
    subtitle: 'ਸ਼ੱਕੀ ਕਾਲ ਨੂੰ ਸਪੀਕਰ ਤੇ ਰੱਖੋ। ScamShield ਸੁਣਦਾ ਹੈ ਅਤੇ ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਸੁਚੇਤ ਕਰਦਾ ਹੈ।',
    liveLabel: 'ਲਾਈਵ ਨਿਗਰਾਨੀ', readyLabel: 'ਨਿਗਰਾਨੀ ਲਈ ਤਿਆਰ', recBadge: 'REC',
    transcriptLabel: 'ਲਾਈਵ ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ', analysedEvery: 'ਹਰ 5 ਸਕਿੰਟ ਵਿੱਚ ਵਿਸ਼ਲੇਸ਼ਣ',
    listenMsg: 'ਸੁਣ ਰਿਹਾ ਹੈ — ਹੁਣ ਬੋਲੋ…', readyMsg: 'ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਦੇਖਣ ਲਈ ਨਿਗਰਾਨੀ ਸ਼ੁਰੂ ਕਰੋ',
    alertsLabel: 'ਜੋਖਮ ਅਲਰਟ', noAlerts: 'ਅਜੇ ਕੋਈ ਅਲਰਟ ਨਹੀਂ', alertsCount: 'ਅਲਰਟ',
    startBtn: 'ਨਿਗਰਾਨੀ ਸ਼ੁਰੂ ਕਰੋ', stopBtn: 'ਰੋਕੋ', resetTitle: 'ਸਾਫ਼ ਕਰੋ ਅਤੇ ਰੀਸੈਟ ਕਰੋ',
    tip1Title: 'ਕੋਈ ਵੀ ਫੋਨ ਕੰਮ ਕਰਦਾ ਹੈ', tip1Body: 'ਸ਼ੱਕੀ ਕਾਲ ਨੂੰ ਸਪੀਕਰ ਤੇ ਲੈਪਟਾਪ ਮਾਈਕ ਦੇ ਨੇੜੇ ਰੱਖੋ।',
    tip2Title: '~5 ਸਕਿੰਟ ਵਿੱਚ ਅਲਰਟ', tip2Body: 'ਹਰ 5 ਸਕਿੰਟ ਦਾ ਹਿੱਸਾ ਵੱਖਰੇ ਤੌਰ ਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।',
    tip3Title: 'ਆਡੀਓ ਸਥਾਨਕ ਰਹਿੰਦਾ ਹੈ', tip3Body: 'ਕੇਵਲ ਬਦਲਿਆ ਟੈਕਸਟ ਸਰਵਰ ਤੱਕ ਪਹੁੰਚਦਾ ਹੈ — ਕੋਈ ਆਡੀਓ ਅਪਲੋਡ ਨਹੀਂ ਹੁੰਦਾ।',
  },
  settings: {
    title: 'ਸੈਟਿੰਗਾਂ', viewingAs: 'ਇਸ ਤਰ੍ਹਾਂ ਦੇਖ ਰਹੇ ਹਾਂ',
    appearance: 'ਦਿੱਖ', theme: 'ਥੀਮ', themeDesc: 'ਡੈਸ਼ਬੋਰਡ ਦੀ ਦਿੱਖ ਚੁਣੋ',
    dark: 'ਹਨੇਰਾ', light: 'ਰੌਸ਼ਨ',
    language: 'ਭਾਸ਼ਾ', languageDesc: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਡਿਸਪਲੇ ਅਤੇ ਵਾਕ ਪਛਾਣ ਭਾਸ਼ਾ ਚੁਣੋ',
    accessibility: 'ਪਹੁੰਚਯੋਗਤਾ', textSize: 'ਟੈਕਸਟ ਆਕਾਰ', textSizeDesc: 'ਵੱਡਾ ਟੈਕਸਟ ਪੜ੍ਹਨਾ ਆਸਾਨ ਬਣਾਉਂਦਾ ਹੈ',
    normal: 'ਸਾਧਾਰਨ', large: 'ਵੱਡਾ', extraLarge: 'ਬਹੁਤ ਵੱਡਾ',
    reduceMotion: 'ਐਨੀਮੇਸ਼ਨ ਘਟਾਓ', reduceMotionDesc: 'ਐਨੀਮੇਸ਼ਨ ਬੰਦ ਕਰਦਾ ਹੈ',
    highContrast: 'ਉੱਚ ਕੰਟ੍ਰਾਸਟ', highContrastDesc: 'ਬਾਰਡਰ ਅਤੇ ਟੈਕਸਟ ਕੰਟ੍ਰਾਸਟ ਵਧਾਉਂਦਾ ਹੈ',
    notifications: 'ਸੂਚਨਾਵਾਂ',
    scanComplete: 'ਸਕੈਨ ਪੂਰੀ', scanCompleteDesc: 'ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ ਹੋਣ ਤੇ ਅਲਰਟ',
    highRiskAlert: 'ਉੱਚ ਜੋਖਮ ਦਾ ਪਤਾ ਲੱਗਾ', highRiskAlertDesc: '75+ ਜੋਖਮ ਸਕੋਰ ਲਈ ਤੁਰੰਤ ਅਲਰਟ',
    weeklyDigest: 'ਹਫ਼ਤਾਵਾਰ ਸਾਰ', weeklyDigestDesc: 'ਹਰ ਹਫ਼ਤੇ ਸਕੈਨ ਅਤੇ ਰੋਕੇ ਖ਼ਤਰਿਆਂ ਦਾ ਸਾਰ',
    protection: '{name} ਲਈ ਸੁਰੱਖਿਆ',
    textScanning: 'ਟੈਕਸਟ ਸੁਨੇਹਾ ਸਕੈਨਿੰਗ', emailAnalysis: 'ਈਮੇਲ ਵਿਸ਼ਲੇਸ਼ਣ', linkChecking: 'ਲਿੰਕ ਜਾਂਚ',
    paymentAlerts: 'ਭੁਗਤਾਨ ਬੇਨਤੀ ਅਲਰਟ', phoneMonitoring: 'ਫੋਨ ਕਾਲ ਨਿਗਰਾਨੀ',
    dataPrivacy: 'ਡੇਟਾ ਅਤੇ ਗੋਪਨੀਯਤਾ', exportData: 'ਡੇਟਾ ਨਿਰਯਾਤ ਕਰੋ', clearHistory: 'ਸਕੈਨ ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰੋ',
    privacyNote: 'ScamShield ਤੁਹਾਡੀ ਵਿਵਹਾਰ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸਕੈਨ ਇਤਿਹਾਸ ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਥਾਨਕ ਤੌਰ ਤੇ ਸੰਭਾਲਦਾ ਹੈ।',
    version: 'ScamShield · GenAI Genesis 2026 · ਡੈਮੋ',
  },
  history: {
    title: 'ਸਕੈਨ ਇਤਿਹਾਸ', subtitle: 'ਤੁਹਾਡੀਆਂ ਤਾਜ਼ਾ ਸਕੈਨਾਂ ਅਤੇ ਨਤੀਜੇ',
    today: 'ਅੱਜ', yesterday: 'ਕੱਲ੍ਹ',
    level: 'ਪੱਧਰ', status: 'ਸਥਿਤੀ',
    blocked: 'ਰੋਕਿਆ', cleared: 'ਸੁਰੱਖਿਅਤ', flagged: 'ਚਿੰਨ੍ਹਿਤ',
  },
  profile: {
    title: 'ਪ੍ਰੋਫਾਈਲ',
    memberSince: 'ਮੈਂਬਰ ਬਣੇ', scansThisMonth: 'ਇਸ ਮਹੀਨੇ ਸਕੈਨ',
    threatsBlocked: 'ਰੋਕੇ ਖ਼ਤਰੇ', safeRate: 'ਸੁਰੱਖਿਆ ਦਰ',
    commsPatterns: 'ਸੰਚਾਰ ਪੈਟਰਨ', highlights: 'ਪ੍ਰੋਫਾਈਲ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ', editProfile: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ',
  },
  common: { loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…', error: 'ਗਲਤੀ', close: 'ਬੰਦ ਕਰੋ', alerts: 'ਅਲਰਟ', beta: 'ਬੀਟਾ' },
}

const tl: Translations = {
  nav: {
    analysis: 'Pagsusuri', liveCall: 'Live na Tawag', history: 'Kasaysayan', profile: 'Profile',
    settings: 'Mga Setting', help: 'Tulong', dashboard: 'Dashboard', switchPersona: 'Palitan ang persona →',
  },
  analysis: {
    cardHeader: 'Bagong Scan',
    analyzingAs: 'Sinusuri bilang',
    modeText: 'Teksto', modeUrl: 'URL', modePhoto: 'Larawan', modeDoc: 'Dokumento',
    textPlaceholder: 'I-paste ang kahina-hinalang mensahe, email, DM, o pag-uusap…',
    urlPlaceholder: 'https://kahina-hinalang-site.com/…',
    dropImage: 'I-drop ang screenshot dito', dropImageSub: 'o mag-click para mag-upload · PNG, JPG, WEBP',
    dropDoc: 'I-drop ang dokumento dito', dropDocSub: 'o mag-click para mag-upload · PDF, TXT, CSV, HTML',
    readyToAnalyze: 'Handa nang suriin',
    analyzeBtn: 'Suriin', analyzing: 'Sinusuri…',
    quickTests: 'Mabilis na Pagsubok',
    progressSteps: ['Nino-load ang profile ng gawi', 'Inihahambing ang mga pattern', 'Sinusukat ang mga tagapagpahiwatig ng panganib', 'Ginagawa ang paliwanag'],
    comparingTo: 'Inihahambing sa profile ni {name}…',
    resultHeader: 'Resulta ng Pagsusuri',
    looksSafe: 'Mukhang ligtas', scamDetected: 'Natukoy ang scam',
    scoredAgainst: 'Na-score laban sa profile ni {name}',
    whyMatters: 'Bakit ito mahalaga para kay {name}',
    whatToDo: 'Ano ang gagawin',
    copy: 'Kopyahin', rerun: 'Ulitin', rawJson: 'Raw na JSON output',
    readyTitle: 'Handa na para protektahan si {name}',
    readySubtitle: 'I-paste ang mensahe o link sa kaliwa at i-click ang Suriin.',
    lowRisk: 'MABABANG PANGANIB', mediumRisk: 'KATAMTAMANG PANGANIB', highRisk: 'MATAAS NA PANGANIB',
    feedbackDisclaimer: 'Maaaring mali ang alerto na ito.',
    feedbackQuestion: 'Lehitimo ba ang mensaheng ito?',
    feedbackYes: 'OO – lehitimo ito',
    feedbackUnsure: 'Hindi ako sigurado',
    feedbackThanks: 'Salamat sa iyong feedback',
  },
  liveCall: {
    title: 'Proteksyon ng Live na Tawag',
    subtitle: 'Ilagay ang kahina-hinalang tawag sa speaker. Nakikinig ang ScamShield at nagbababala sa real time — hindi kailanman umaalis ang audio sa iyong device.',
    liveLabel: 'LIVE NA PAGMAMATYAG', readyLabel: 'Handa nang magmatyag', recBadge: 'REC',
    transcriptLabel: 'Live na Transcript', analysedEvery: 'sinusuri tuwing 5 s',
    listenMsg: 'Nakikinig — magsalita na…', readyMsg: 'Simulan ang pagmamatyag para makita ang transcript',
    alertsLabel: 'Mga Babala ng Panganib', noAlerts: 'Wala pang mga babala', alertsCount: 'mga babala',
    startBtn: 'Simulan ang Pagmamatyag', stopBtn: 'Itigil', resetTitle: 'I-clear at i-reset',
    tip1Title: 'Gumagana ang anumang telepono', tip1Body: 'Ilagay ang kahina-hinalang tawag sa speaker malapit sa mic ng laptop.',
    tip2Title: 'Mga babala sa ~5 s', tip2Body: 'Bawat 5-segundong bahagi ay sinusuri nang hiwalay para sa mabilis na mga babala.',
    tip3Title: 'Nananatiling lokal ang audio', tip3Body: 'Ang na-convert na teksto lamang ang umaabot sa server — walang audio ang kailanman ina-upload.',
  },
  settings: {
    title: 'Mga Setting', viewingAs: 'Tinitingnan bilang',
    appearance: 'Hitsura', theme: 'Tema', themeDesc: 'Piliin kung paano magmukhang ang dashboard',
    dark: 'Madilim', light: 'Maliwanag',
    language: 'Wika', languageDesc: 'Piliin ang iyong gustong wika sa pagdisplay at pagsasalita',
    accessibility: 'Accessibility', textSize: 'Laki ng teksto', textSizeDesc: 'Ang mas malaking teksto ay nagpapadali ng pagbabasa',
    normal: 'Normal', large: 'Malaki', extraLarge: 'Napakalaki',
    reduceMotion: 'Bawasan ang galaw', reduceMotionDesc: 'Pinapatay ang mga animation',
    highContrast: 'Mataas na kontrasto', highContrastDesc: 'Pinapataas ang kontrasto ng hangganan at teksto',
    notifications: 'Mga Abiso',
    scanComplete: 'Kumpleto na ang scan', scanCompleteDesc: 'Mag-alerto kapag natapos ang pagsusuri',
    highRiskAlert: 'Natukoy ang mataas na panganib', highRiskAlertDesc: 'Agarang alerto para sa mga risk score na 75+',
    weeklyDigest: 'Lingguhang buod', weeklyDigestDesc: 'Buod ng mga scan at na-block na banta bawat linggo',
    protection: 'Proteksyon para kay {name}',
    textScanning: 'Pag-scan ng text message', emailAnalysis: 'Pagsusuri ng email', linkChecking: 'Pag-check ng link',
    paymentAlerts: 'Mga babala sa kahilingan ng bayad', phoneMonitoring: 'Pagmamatyag ng tawag sa telepono',
    dataPrivacy: 'Data at Privacy', exportData: 'I-export ang data', clearHistory: 'I-clear ang kasaysayan ng scan',
    privacyNote: 'Iniimbak ng ScamShield ang iyong profile ng gawi at kasaysayan ng scan nang lokal sa iyong browser. Walang data ang ipinapadala sa mga panlabas na server nang walang iyong pahintulot.',
    version: 'ScamShield · GenAI Genesis 2026 · Demo',
  },
  history: {
    title: 'Kasaysayan ng Scan', subtitle: 'Ang iyong mga kamakailang scan at resulta',
    today: 'Ngayon', yesterday: 'Kahapon',
    level: 'Antas', status: 'Katayuan',
    blocked: 'Na-block', cleared: 'Ligtas', flagged: 'Minarkahan',
  },
  profile: {
    title: 'Profile',
    memberSince: 'Miyembro mula', scansThisMonth: 'Mga scan ngayong buwan',
    threatsBlocked: 'Mga banta na na-block', safeRate: 'Rate ng kaligtasan',
    commsPatterns: 'Mga pattern ng komunikasyon', highlights: 'Mga highlight ng profile', editProfile: 'I-edit ang profile',
  },
  common: { loading: 'Naglo-load…', error: 'Error', close: 'Isara', alerts: 'mga babala', beta: 'Beta' },
}

export const translations: Record<LangCode, Translations> = { en, fr, es, ar, hi, zh, pa, tl }
