type Locale = "en" | "fr" | "es";

const translations: Record<string, Record<Locale, string>> = {
  // ── Navigation ──────────────────────────────────────────────────────
  "nav.dashboard": {
    en: "Dashboard",
    fr: "Tableau de bord",
    es: "Panel de control",
  },
  "nav.newProject": {
    en: "New project",
    fr: "Nouveau projet",
    es: "Nuevo proyecto",
  },
  "nav.dealAnalyzer": {
    en: "Deal Analyzer",
    fr: "Analyse de projet",
    es: "Analizador de trato",
  },
  "nav.learn": {
    en: "Learn",
    fr: "Apprendre",
    es: "Aprender",
  },
  "nav.overview": {
    en: "Overview",
    fr: "Vue d'ensemble",
    es: "Resumen general",
  },
  "nav.budget": {
    en: "Budget",
    fr: "Budget",
    es: "Presupuesto",
  },
  "nav.schedule": {
    en: "Schedule",
    fr: "Calendrier",
    es: "Cronograma",
  },
  "nav.financials": {
    en: "Financials",
    fr: "Finances",
    es: "Finanzas",
  },
  "nav.team": {
    en: "Team",
    fr: "\u00c9quipe",
    es: "Equipo",
  },
  "nav.documents": {
    en: "Documents",
    fr: "Documents",
    es: "Documentos",
  },
  "nav.photos": {
    en: "Photos",
    fr: "Photos",
    es: "Fotos",
  },
  "nav.dailyLog": {
    en: "Daily log",
    fr: "Journal de chantier",
    es: "Bit\u00e1cora diaria",
  },
  "nav.inspections": {
    en: "Inspections",
    fr: "Inspections",
    es: "Inspecciones",
  },
  "nav.punchList": {
    en: "Punch list",
    fr: "Liste de r\u00e9serves",
    es: "Lista de pendientes",
  },
  "nav.aiAssistant": {
    en: "AI assistant",
    fr: "Assistant IA",
    es: "Asistente IA",
  },

  // ── Common Actions ──────────────────────────────────────────────────
  "action.save": {
    en: "Save",
    fr: "Enregistrer",
    es: "Guardar",
  },
  "action.cancel": {
    en: "Cancel",
    fr: "Annuler",
    es: "Cancelar",
  },
  "action.add": {
    en: "Add",
    fr: "Ajouter",
    es: "Agregar",
  },
  "action.edit": {
    en: "Edit",
    fr: "Modifier",
    es: "Editar",
  },
  "action.delete": {
    en: "Delete",
    fr: "Supprimer",
    es: "Eliminar",
  },
  "action.close": {
    en: "Close",
    fr: "Fermer",
    es: "Cerrar",
  },
  "action.generate": {
    en: "Generate",
    fr: "G\u00e9n\u00e9rer",
    es: "Generar",
  },
  "action.print": {
    en: "Print",
    fr: "Imprimer",
    es: "Imprimir",
  },
  "action.upload": {
    en: "Upload",
    fr: "T\u00e9l\u00e9charger",
    es: "Subir",
  },

  // ── Status ──────────────────────────────────────────────────────────
  "status.active": {
    en: "Active",
    fr: "Actif",
    es: "Activo",
  },
  "status.completed": {
    en: "Completed",
    fr: "Termin\u00e9",
    es: "Completado",
  },
  "status.onTrack": {
    en: "On track",
    fr: "En bonne voie",
    es: "En curso",
  },
  "status.overBudget": {
    en: "Over budget",
    fr: "D\u00e9passement de budget",
    es: "Sobre presupuesto",
  },
  "status.underBudget": {
    en: "Under budget",
    fr: "Sous le budget",
    es: "Bajo presupuesto",
  },
  "status.notStarted": {
    en: "Not started",
    fr: "Non commenc\u00e9",
    es: "No iniciado",
  },
  "status.open": {
    en: "Open",
    fr: "Ouvert",
    es: "Abierto",
  },
  "status.resolved": {
    en: "Resolved",
    fr: "R\u00e9solu",
    es: "Resuelto",
  },
  "status.inProgress": {
    en: "In progress",
    fr: "En cours",
    es: "En progreso",
  },

  // ── Phases ──────────────────────────────────────────────────────────
  "phase.define": {
    en: "Define",
    fr: "D\u00e9finir",
    es: "Definir",
  },
  "phase.finance": {
    en: "Finance",
    fr: "Financer",
    es: "Financiar",
  },
  "phase.land": {
    en: "Land",
    fr: "Terrain",
    es: "Terreno",
  },
  "phase.design": {
    en: "Design",
    fr: "Conception",
    es: "Dise\u00f1o",
  },
  "phase.approve": {
    en: "Approve",
    fr: "Autorisation",
    es: "Aprobaci\u00f3n",
  },
  "phase.assemble": {
    en: "Assemble",
    fr: "\u00c9quipe",
    es: "Equipo",
  },
  "phase.build": {
    en: "Build",
    fr: "Construction",
    es: "Construcci\u00f3n",
  },
  "phase.verify": {
    en: "Verify",
    fr: "V\u00e9rification",
    es: "Verificaci\u00f3n",
  },
  "phase.operate": {
    en: "Operate",
    fr: "Exploitation",
    es: "Operaci\u00f3n",
  },

  // ── Budget ──────────────────────────────────────────────────────────
  "budget.totalBudget": {
    en: "Total budget",
    fr: "Budget total",
    es: "Presupuesto total",
  },
  "budget.spent": {
    en: "Spent to date",
    fr: "D\u00e9pens\u00e9 \u00e0 ce jour",
    es: "Gastado a la fecha",
  },
  "budget.remaining": {
    en: "Remaining",
    fr: "Restant",
    es: "Restante",
  },
  "budget.variance": {
    en: "Variance",
    fr: "\u00c9cart",
    es: "Variaci\u00f3n",
  },

  // ── Common Labels ───────────────────────────────────────────────────
  "label.progress": {
    en: "Progress",
    fr: "Progression",
    es: "Progreso",
  },
  "label.loading": {
    en: "Loading...",
    fr: "Chargement...",
    es: "Cargando...",
  },
  "label.noData": {
    en: "No data yet",
    fr: "Pas encore de donn\u00e9es",
    es: "A\u00fan no hay datos",
  },
  "label.week": {
    en: "Week",
    fr: "Semaine",
    es: "Semana",
  },
  "label.day": {
    en: "Day",
    fr: "Jour",
    es: "D\u00eda",
  },

  // ── Weather ─────────────────────────────────────────────────────────
  "weather.sunny": {
    en: "Sunny",
    fr: "Ensoleill\u00e9",
    es: "Soleado",
  },
  "weather.partlyCloudy": {
    en: "Partly cloudy",
    fr: "Partiellement nuageux",
    es: "Parcialmente nublado",
  },
  "weather.cloudy": {
    en: "Cloudy",
    fr: "Nuageux",
    es: "Nublado",
  },
  "weather.rain": {
    en: "Rain",
    fr: "Pluie",
    es: "Lluvia",
  },
  "weather.storm": {
    en: "Storm",
    fr: "Orage",
    es: "Tormenta",
  },

  // ── Auth ─────────────────────────────────────────────────────────────
  "auth.signIn": {
    en: "Sign in",
    fr: "Se connecter",
    es: "Iniciar sesi\u00f3n",
  },
  "auth.signUp": {
    en: "Sign up",
    fr: "S'inscrire",
    es: "Registrarse",
  },
  "auth.forgotPassword": {
    en: "Forgot password?",
    fr: "Mot de passe oubli\u00e9 ?",
    es: "\u00bfOlvidaste tu contrase\u00f1a?",
  },
  "auth.createAccount": {
    en: "Create an account",
    fr: "Cr\u00e9er un compte",
    es: "Crear una cuenta",
  },
  "auth.email": {
    en: "Email address",
    fr: "Adresse e-mail",
    es: "Correo electr\u00f3nico",
  },
  "auth.password": {
    en: "Password",
    fr: "Mot de passe",
    es: "Contrase\u00f1a",
  },
  "auth.name": {
    en: "Full name",
    fr: "Nom complet",
    es: "Nombre completo",
  },
  "auth.confirmPassword": {
    en: "Confirm password",
    fr: "Confirmer le mot de passe",
    es: "Confirmar contrase\u00f1a",
  },
  "auth.welcomeBack": {
    en: "Welcome back",
    fr: "Bon retour",
    es: "Bienvenido",
  },
  "auth.signInContinue": {
    en: "Sign in to continue building",
    fr: "Connectez-vous pour continuer",
    es: "Inicia sesi\u00f3n para continuar",
  },
  "auth.getStarted": {
    en: "Get started",
    fr: "Commencer",
    es: "Comenzar",
  },
  "auth.buildFirst": {
    en: "Start your first build today",
    fr: "Commencez votre premier projet aujourd'hui",
    es: "Comienza tu primer proyecto hoy",
  },
  "auth.minChars": {
    en: "Minimum 6 characters",
    fr: "Minimum 6 caract\u00e8res",
    es: "M\u00ednimo 6 caracteres",
  },
  "auth.tooShort": {
    en: "Too short",
    fr: "Trop court",
    es: "Muy corta",
  },
  "auth.fair": {
    en: "Fair \u2014 add numbers or symbols for a stronger password",
    fr: "Correct \u2014 ajoutez des chiffres ou symboles",
    es: "Regular \u2014 a\u00f1ade n\u00fameros o s\u00edmbolos",
  },
  "auth.strong": {
    en: "Strong password",
    fr: "Mot de passe fort",
    es: "Contrase\u00f1a fuerte",
  },
  "auth.agreeTerms": {
    en: "I agree to the",
    fr: "J'accepte les",
    es: "Acepto los",
  },
  "auth.terms": {
    en: "Terms of Service",
    fr: "Conditions d'utilisation",
    es: "T\u00e9rminos de servicio",
  },
  "auth.and": {
    en: "and",
    fr: "et",
    es: "y",
  },
  "auth.privacy": {
    en: "Privacy Policy",
    fr: "Politique de confidentialit\u00e9",
    es: "Pol\u00edtica de privacidad",
  },
  "auth.creating": {
    en: "Creating account...",
    fr: "Cr\u00e9ation du compte...",
    es: "Creando cuenta...",
  },
  "auth.signingIn": {
    en: "Signing in...",
    fr: "Connexion...",
    es: "Iniciando sesi\u00f3n...",
  },
  "auth.noAccount": {
    en: "New to Keystone?",
    fr: "Nouveau sur Keystone ?",
    es: "\u00bfNuevo en Keystone?",
  },
  "auth.haveAccount": {
    en: "Already have an account?",
    fr: "Vous avez d\u00e9j\u00e0 un compte ?",
    es: "\u00bfYa tienes una cuenta?",
  },
  "auth.resetPassword": {
    en: "Reset your password",
    fr: "R\u00e9initialiser votre mot de passe",
    es: "Restablecer contrase\u00f1a",
  },
  "auth.resetInstructions": {
    en: "Enter your email and we'll send you a link to reset your password.",
    fr: "Entrez votre e-mail et nous vous enverrons un lien de r\u00e9initialisation.",
    es: "Ingresa tu correo y te enviaremos un enlace para restablecer tu contrase\u00f1a.",
  },
  "auth.sendResetLink": {
    en: "Send reset link",
    fr: "Envoyer le lien",
    es: "Enviar enlace",
  },
  "auth.sending": {
    en: "Sending...",
    fr: "Envoi...",
    es: "Enviando...",
  },
  "auth.checkInbox": {
    en: "Check your inbox",
    fr: "V\u00e9rifiez votre bo\u00eete de r\u00e9ception",
    es: "Revisa tu bandeja de entrada",
  },
  "auth.resetSent": {
    en: "If an account exists for that email, you'll receive a password reset link.",
    fr: "Si un compte existe pour cet e-mail, vous recevrez un lien de r\u00e9initialisation.",
    es: "Si existe una cuenta con ese correo, recibir\u00e1s un enlace de restablecimiento.",
  },
  "auth.backToSignIn": {
    en: "Back to sign in",
    fr: "Retour \u00e0 la connexion",
    es: "Volver a iniciar sesi\u00f3n",
  },
  "auth.yourPassword": {
    en: "Your password",
    fr: "Votre mot de passe",
    es: "Tu contrase\u00f1a",
  },

  // ── Dashboard ────────────────────────────────────────────────────────
  "dashboard.greeting.morning": {
    en: "Good morning",
    fr: "Bonjour",
    es: "Buenos d\u00edas",
  },
  "dashboard.greeting.afternoon": {
    en: "Good afternoon",
    fr: "Bon apr\u00e8s-midi",
    es: "Buenas tardes",
  },
  "dashboard.greeting.evening": {
    en: "Good evening",
    fr: "Bonsoir",
    es: "Buenas noches",
  },
  "dashboard.yourJourney": {
    en: "Your construction journey",
    fr: "Votre parcours de construction",
    es: "Tu camino de construcci\u00f3n",
  },
  "dashboard.getStarted": {
    en: "Get started with your first project",
    fr: "Lancez votre premier projet",
    es: "Comienza tu primer proyecto",
  },
  "dashboard.learnFundamentals": {
    en: "Learn the fundamentals",
    fr: "Apprendre les bases",
    es: "Aprende los fundamentos",
  },
  "dashboard.startProject": {
    en: "Start a project",
    fr: "D\u00e9marrer un projet",
    es: "Iniciar un proyecto",
  },
  "dashboard.didYouKnow": {
    en: "Did you know?",
    fr: "Le saviez-vous\u00a0?",
    es: "\u00bfSab\u00edas que?",
  },
  "dashboard.noProjects": {
    en: "No projects yet",
    fr: "Aucun projet pour le moment",
    es: "A\u00fan no hay proyectos",
  },
  "dashboard.activeProjects": {
    en: "Active Projects",
    fr: "Projets actifs",
    es: "Proyectos activos",
  },

  // ── Settings ─────────────────────────────────────────────────────────
  "settings.title": {
    en: "Settings",
    fr: "Param\u00e8tres",
    es: "Configuraci\u00f3n",
  },
  "settings.profile": {
    en: "Profile",
    fr: "Profil",
    es: "Perfil",
  },
  "settings.security": {
    en: "Security",
    fr: "S\u00e9curit\u00e9",
    es: "Seguridad",
  },
  "settings.plan": {
    en: "Plan",
    fr: "Forfait",
    es: "Plan",
  },
  "settings.notifications": {
    en: "Notifications",
    fr: "Notifications",
    es: "Notificaciones",
  },
  "settings.data": {
    en: "Data",
    fr: "Donn\u00e9es",
    es: "Datos",
  },
  "settings.language": {
    en: "Language",
    fr: "Langue",
    es: "Idioma",
  },
  "settings.displayName": {
    en: "Display name",
    fr: "Nom d'affichage",
    es: "Nombre para mostrar",
  },
  "settings.timezone": {
    en: "Timezone",
    fr: "Fuseau horaire",
    es: "Zona horaria",
  },
  "settings.currency": {
    en: "Currency",
    fr: "Devise",
    es: "Moneda",
  },
  "settings.saveChanges": {
    en: "Save changes",
    fr: "Enregistrer les modifications",
    es: "Guardar cambios",
  },
  "settings.changePassword": {
    en: "Change password",
    fr: "Changer le mot de passe",
    es: "Cambiar contrase\u00f1a",
  },
  "settings.deleteAccount": {
    en: "Delete account",
    fr: "Supprimer le compte",
    es: "Eliminar cuenta",
  },
  "settings.currentPlan": {
    en: "Current plan",
    fr: "Forfait actuel",
    es: "Plan actual",
  },
  "settings.upgrade": {
    en: "Upgrade",
    fr: "Passer au niveau sup\u00e9rieur",
    es: "Mejorar plan",
  },
  "settings.downgrade": {
    en: "Downgrade",
    fr: "R\u00e9trograder",
    es: "Reducir plan",
  },

  // ── Common ───────────────────────────────────────────────────────────
  "common.search": {
    en: "Search",
    fr: "Rechercher",
    es: "Buscar",
  },
  "common.back": {
    en: "Back",
    fr: "Retour",
    es: "Volver",
  },
  "common.next": {
    en: "Next",
    fr: "Suivant",
    es: "Siguiente",
  },
  "common.confirm": {
    en: "Confirm",
    fr: "Confirmer",
    es: "Confirmar",
  },
  "common.yes": {
    en: "Yes",
    fr: "Oui",
    es: "S\u00ed",
  },
  "common.no": {
    en: "No",
    fr: "Non",
    es: "No",
  },
  "common.or": {
    en: "or",
    fr: "ou",
    es: "o",
  },
  "common.and": {
    en: "and",
    fr: "et",
    es: "y",
  },
  "common.showMore": {
    en: "Show more",
    fr: "Afficher plus",
    es: "Mostrar m\u00e1s",
  },
  "common.showLess": {
    en: "Show less",
    fr: "Afficher moins",
    es: "Mostrar menos",
  },
  "common.viewAll": {
    en: "View all",
    fr: "Tout afficher",
    es: "Ver todo",
  },
  "common.export": {
    en: "Export",
    fr: "Exporter",
    es: "Exportar",
  },
  "common.share": {
    en: "Share",
    fr: "Partager",
    es: "Compartir",
  },
  "common.refresh": {
    en: "Refresh",
    fr: "Actualiser",
    es: "Actualizar",
  },
  "common.createdAt": {
    en: "Created at",
    fr: "Cr\u00e9\u00e9 le",
    es: "Creado el",
  },
  "common.updatedAt": {
    en: "Updated at",
    fr: "Mis \u00e0 jour le",
    es: "Actualizado el",
  },
  "common.noResults": {
    en: "No results",
    fr: "Aucun r\u00e9sultat",
    es: "Sin resultados",
  },

  // ── Project ──────────────────────────────────────────────────────────
  "project.overview": {
    en: "Overview",
    fr: "Vue d'ensemble",
    es: "Resumen general",
  },
  "project.budget": {
    en: "Budget",
    fr: "Budget",
    es: "Presupuesto",
  },
  "project.schedule": {
    en: "Schedule",
    fr: "Calendrier",
    es: "Cronograma",
  },
  "project.financials": {
    en: "Financials",
    fr: "Finances",
    es: "Finanzas",
  },
  "project.team": {
    en: "Team",
    fr: "\u00c9quipe",
    es: "Equipo",
  },
  "project.documents": {
    en: "Documents",
    fr: "Documents",
    es: "Documentos",
  },
  "project.photos": {
    en: "Photos",
    fr: "Photos",
    es: "Fotos",
  },
  "project.dailyLog": {
    en: "Daily log",
    fr: "Journal de chantier",
    es: "Bit\u00e1cora diaria",
  },
  "project.inspections": {
    en: "Inspections",
    fr: "Inspections",
    es: "Inspecciones",
  },
  "project.punchList": {
    en: "Punch list",
    fr: "Liste de r\u00e9serves",
    es: "Lista de pendientes",
  },
  "project.monitor": {
    en: "Monitor",
    fr: "Suivi",
    es: "Monitoreo",
  },
  "project.aiAssistant": {
    en: "AI assistant",
    fr: "Assistant IA",
    es: "Asistente IA",
  },
  "project.fileVault": {
    en: "File vault",
    fr: "Coffre-fort de fichiers",
    es: "B\u00f3veda de archivos",
  },
  "project.portfolio": {
    en: "Vault",
    fr: "Coffre",
    es: "B\u00f3veda",
  },
  "project.newProject": {
    en: "New project",
    fr: "Nouveau projet",
    es: "Nuevo proyecto",
  },

  // ── Sidebar Section Headers ────────────────────────────────────────
  "nav.group.main": {
    en: "Main",
    fr: "Principal",
    es: "Principal",
  },
  "nav.group.planning": {
    en: "Planning",
    fr: "Planification",
    es: "Planificaci\u00f3n",
  },
  "nav.group.execution": {
    en: "Execution",
    fr: "Ex\u00e9cution",
    es: "Ejecuci\u00f3n",
  },
  "nav.group.quality": {
    en: "Quality",
    fr: "Qualit\u00e9",
    es: "Calidad",
  },
  "nav.group.tools": {
    en: "Tools",
    fr: "Outils",
    es: "Herramientas",
  },

  // ── Contractor Portal ───────────────────────────────────────────────
  "contractor.toDo": { en: "To Do", fr: "A faire", es: "Por hacer" },
  "contractor.inProgress": { en: "In Progress", fr: "En cours", es: "En curso" },
  "contractor.pendingReview": { en: "Pending Review", fr: "En attente de validation", es: "Pendiente de revision" },
  "contractor.completed": { en: "Completed", fr: "Termine", es: "Completado" },
  "contractor.startTask": { en: "Start task", fr: "Demarrer la tache", es: "Iniciar tarea" },
  "contractor.submitReview": { en: "Submit for review", fr: "Soumettre pour validation", es: "Enviar para revision" },
  "contractor.markComplete": { en: "Mark complete", fr: "Marquer comme termine", es: "Marcar completo" },
  "contractor.photoRequired": { en: "Photo proof required", fr: "Photo requise", es: "Foto requerida" },
  "contractor.needsApproval": { en: "Needs approval", fr: "Validation requise", es: "Necesita aprobacion" },
  "contractor.waitingApproval": { en: "Waiting for owner approval", fr: "En attente de validation du proprietaire", es: "Esperando aprobacion del propietario" },
  "contractor.noTasks": { en: "No tasks assigned yet.", fr: "Aucune tache assignee pour le moment.", es: "No hay tareas asignadas aun." },
  "contractor.noTasksSub": { en: "Your project owner will assign tasks here.", fr: "Le proprietaire du projet assignera des taches ici.", es: "El propietario del proyecto asignara tareas aqui." },
  "contractor.addNote": { en: "Add a note about the work completed...", fr: "Ajoutez une note sur le travail effectue...", es: "Agrega una nota sobre el trabajo realizado..." },
  "contractor.messageOwner": { en: "Message the owner...", fr: "Envoyer un message au proprietaire...", es: "Enviar mensaje al propietario..." },
  "contractor.submitting": { en: "Submitting...", fr: "Envoi...", es: "Enviando..." },
  "contractor.starting": { en: "Starting...", fr: "Demarrage...", es: "Iniciando..." },
  "contractor.linkInvalid": { en: "This link is invalid or has been revoked.", fr: "Ce lien est invalide ou a ete revoque.", es: "Este enlace es invalido o ha sido revocado." },
  "contractor.linkUnavailable": { en: "Link unavailable", fr: "Lien indisponible", es: "Enlace no disponible" },
  "contractor.poweredBy": { en: "Powered by Keystone", fr: "Propulse par Keystone", es: "Desarrollado por Keystone" },
  "contractor.returned": { en: "Returned", fr: "Retourne", es: "Devuelto" },
  "contractor.photosAttached": { en: "photos attached", fr: "photos jointes", es: "fotos adjuntas" },
  "contractor.due": { en: "Due", fr: "Echeance", es: "Vence" },
  "contractor.urgent": { en: "Urgent", fr: "Urgent", es: "Urgente" },
  "contractor.critical": { en: "Critical", fr: "Critique", es: "Critico" },
  "contractor.phase": { en: "phase", fr: "phase", es: "fase" },

  // ── Not Found ───────────────────────────────────────────────────────
  "notfound.title": {
    en: "Page not found",
    fr: "Page non trouv\u00e9e",
    es: "P\u00e1gina no encontrada",
  },
  "notfound.message": {
    en: "The page you are looking for does not exist or has been moved. Let us get you back on track.",
    fr: "La page que vous recherchez n'existe pas ou a \u00e9t\u00e9 d\u00e9plac\u00e9e.",
    es: "La p\u00e1gina que buscas no existe o ha sido movida.",
  },
  "notfound.dashboard": {
    en: "Go to Dashboard",
    fr: "Aller au tableau de bord",
    es: "Ir al panel",
  },
  "notfound.home": {
    en: "Home",
    fr: "Accueil",
    es: "Inicio",
  },

  // ── Search ─────────────────────────────────────────────────────────
  "search.placeholder": {
    en: "Search projects, contacts, budget items, tasks...",
    fr: "Rechercher projets, contacts, budget, t\u00e2ches...",
    es: "Buscar proyectos, contactos, presupuesto, tareas...",
  },
  "search.noResults": {
    en: "No results found for",
    fr: "Aucun r\u00e9sultat pour",
    es: "Sin resultados para",
  },
  "search.navigate": {
    en: "Arrow keys to navigate",
    fr: "Fl\u00e8ches pour naviguer",
    es: "Flechas para navegar",
  },
  "search.select": {
    en: "Enter to select",
    fr: "Entr\u00e9e pour s\u00e9lectionner",
    es: "Enter para seleccionar",
  },
  "search.close": {
    en: "Esc to close",
    fr: "\u00c9chap pour fermer",
    es: "Esc para cerrar",
  },

  // ── Notifications ────────────────────────────────────────────────────
  "notif.budgetAlerts": {
    en: "Budget alerts",
    fr: "Alertes budg\u00e9taires",
    es: "Alertas de presupuesto",
  },
  "notif.milestoneReminders": {
    en: "Milestone reminders",
    fr: "Rappels d'\u00e9tapes cl\u00e9s",
    es: "Recordatorios de hitos",
  },
  "notif.dailySummary": {
    en: "Daily summary",
    fr: "R\u00e9sum\u00e9 quotidien",
    es: "Resumen diario",
  },
  "notif.punchListUpdates": {
    en: "Punch list updates",
    fr: "Mises \u00e0 jour de la liste de r\u00e9serves",
    es: "Actualizaciones de la lista de pendientes",
  },
  "notif.weeklyDigest": {
    en: "Weekly digest",
    fr: "R\u00e9capitulatif hebdomadaire",
    es: "Resumen semanal",
  },
};

export function t(key: string, locale: Locale = "en"): string {
  return translations[key]?.[locale] ?? translations[key]?.en ?? key;
}

export function getLocaleForMarket(market: string): Locale {
  if (market === "TOGO" || market === "BENIN") return "fr";
  return "en";
}

export function getAvailableLocales(): {
  code: Locale;
  label: string;
  nativeLabel: string;
}[] {
  return [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "fr", label: "French", nativeLabel: "Fran\u00e7ais" },
    { code: "es", label: "Spanish", nativeLabel: "Espa\u00f1ol" },
  ];
}

export type { Locale };
