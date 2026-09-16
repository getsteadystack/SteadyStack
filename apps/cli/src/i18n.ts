/**
 * CLI i18n: locale detection + message catalog with English fallback.
 *
 * Resolution order: `--locale` flag > STEADYSTACK_LOCALE env > LC_ALL/LC_MESSAGES/LANG
 * > system default (en). `initLocale()` is called once from index.ts before
 * commands run; commands import `t()` directly.
 */

export const CLI_LOCALES = ["en", "es", "fr", "de", "pt-BR", "ja", "ko", "zh-CN", "ar"] as const;
export type CliLocale = (typeof CLI_LOCALES)[number];

type Dict = Record<string, string>;

const en: Dict = {
  // auth
  "auth.login.generateHint": "Generate an API key at:",
  "auth.login.keyRequired": "✖ --key is required",
  "auth.login.success": "✔ Authenticated successfully!",
  "auth.login.foundMonitors": "Found {count} monitors",
  "auth.login.failed": "✖ Invalid API key or connection failed",
  "auth.logout.done": "✔ Logged out. Credentials cleared.",
  "auth.status.notLoggedIn": "Not logged in. Run:",
  "auth.status.loggedIn": "✔ Logged in",
  "auth.status.keyPrefix": "Key prefix :",
  "auth.status.baseUrl": "Base URL   :",
  // client
  "client.notLoggedIn": "✖ Not logged in. Run:",
  "client.orExport": "or export STEADYSTACK_API_KEY=<API_KEY>",
  // monitors
  "monitors.list.empty": "No monitors found. Create one at https://steadystack.dev/dashboard",
  "monitors.list.header": "ID",
  "monitors.list.headerName": "NAME",
  "monitors.list.headerStatus": "STATUS",
  "monitors.list.headerUrl": "URL",
  "monitors.get.notFound": "✖ Monitor not found",
  "monitors.create.success": "✔ Monitor created: {name}",
  "monitors.delete.success": "✔ Monitor deleted",
  "monitors.delete.confirm": "Are you sure you want to delete {name}?",
  // trigger / wait / logs
  "trigger.success": "✔ Check triggered for {name}",
  "trigger.status": "Status: {status}  Latency: {latency}ms",
  "wait.timeout": "✖ Timed out waiting for monitor to change status",
  "wait.resolved": "✔ Monitor is {status}",
  "logs.empty": "No events found for this monitor",
  "logs.header": "TIMESTAMP",
  "logs.headerStatus": "STATUS",
  "logs.headerLatency": "LATENCY",
  "logs.headerReason": "REASON",
  // import
  "import.reading": "Reading Uptime Kuma export...",
  "import.found": "Found {count} monitors to import",
  "import.success": "✔ Imported {count} monitors",
  "import.failed": "✖ Import failed: {reason}",
  // generic
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "Unknown error",
};

const es: Dict = {
  "auth.login.generateHint": "Genera una clave API en:",
  "auth.login.keyRequired": "✖ --key es obligatorio",
  "auth.login.success": "✔ ¡Autenticación correcta!",
  "auth.login.foundMonitors": "Se encontraron {count} monitores",
  "auth.login.failed": "✖ Clave API no válida o fallo de conexión",
  "auth.logout.done": "✔ Sesión cerrada. Credenciales eliminadas.",
  "auth.status.notLoggedIn": "Sesión no iniciada. Ejecuta:",
  "auth.status.loggedIn": "✔ Sesión iniciada",
  "auth.status.keyPrefix": "Prefijo de clave:",
  "auth.status.baseUrl": "URL base  :",
  "client.notLoggedIn": "✖ Sesión no iniciada. Ejecuta:",
  "client.orExport": "o exporta STEADYSTACK_API_KEY=<API_KEY>",
  "monitors.list.empty": "No se encontraron monitores. Crea uno en https://steadystack.dev/dashboard",
  "monitors.list.header": "ID",
  "monitors.list.headerName": "NOMBRE",
  "monitors.list.headerStatus": "ESTADO",
  "monitors.list.headerUrl": "URL",
  "monitors.get.notFound": "✖ Monitor no encontrado",
  "monitors.create.success": "✔ Monitor creado: {name}",
  "monitors.delete.success": "✔ Monitor eliminado",
  "monitors.delete.confirm": "¿Seguro que quieres eliminar {name}?",
  "trigger.success": "✔ Comprobación iniciada para {name}",
  "trigger.status": "Estado: {status}  Latencia: {latency}ms",
  "wait.timeout": "✖ Tiempo de espera agotado",
  "wait.resolved": "✔ El monitor está {status}",
  "logs.empty": "No hay eventos para este monitor",
  "logs.header": "FECHA",
  "logs.headerStatus": "ESTADO",
  "logs.headerLatency": "LATENCIA",
  "logs.headerReason": "MOTIVO",
  "import.reading": "Leyendo la exportación de Uptime Kuma...",
  "import.found": "Se encontraron {count} monitores para importar",
  "import.success": "✔ {count} monitores importados",
  "import.failed": "✖ Error al importar: {reason}",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "Error desconocido",
};

const fr: Dict = {
  "auth.login.generateHint": "Générez une clé API sur :",
  "auth.login.keyRequired": "✖ --key est requis",
  "auth.login.success": "✔ Authentification réussie !",
  "auth.login.foundMonitors": "{count} moniteurs trouvés",
  "auth.login.failed": "✖ Clé API invalide ou échec de connexion",
  "auth.logout.done": "✔ Déconnexion. Identifiants effacés.",
  "auth.status.notLoggedIn": "Non connecté. Exécutez :",
  "auth.status.loggedIn": "✔ Connecté",
  "auth.status.keyPrefix": "Préfixe de clé :",
  "auth.status.baseUrl": "URL de base :",
  "client.notLoggedIn": "✖ Non connecté. Exécutez :",
  "client.orExport": "ou exportez STEADYSTACK_API_KEY=<API_KEY>",
  "monitors.list.empty": "Aucun moniteur trouvé. Créez-en un sur https://steadystack.dev/dashboard",
  "monitors.list.header": "ID",
  "monitors.list.headerName": "NOM",
  "monitors.list.headerStatus": "STATUT",
  "monitors.list.headerUrl": "URL",
  "monitors.get.notFound": "✖ Moniteur introuvable",
  "monitors.create.success": "✔ Moniteur créé : {name}",
  "monitors.delete.success": "✔ Moniteur supprimé",
  "monitors.delete.confirm": "Voulez-vous vraiment supprimer {name} ?",
  "trigger.success": "✔ Vérification lancée pour {name}",
  "trigger.status": "Statut : {status}  Latence : {latency}ms",
  "wait.timeout": "✖ Délai d'attente dépassé",
  "wait.resolved": "✔ Le moniteur est {status}",
  "logs.empty": "Aucun événement pour ce moniteur",
  "logs.header": "HORODATAGE",
  "logs.headerStatus": "STATUT",
  "logs.headerLatency": "LATENCE",
  "logs.headerReason": "CAUSE",
  "import.reading": "Lecture de l'export Uptime Kuma...",
  "import.found": "{count} moniteurs à importer trouvés",
  "import.success": "✔ {count} moniteurs importés",
  "import.failed": "✖ Échec de l'import : {reason}",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "Erreur inconnue",
};

const de: Dict = {
  "auth.login.generateHint": "Erstellen Sie einen API-Schlüssel unter:",
  "auth.login.keyRequired": "✖ --key ist erforderlich",
  "auth.login.success": "✔ Erfolgreich authentifiziert!",
  "auth.login.foundMonitors": "{count} Monitore gefunden",
  "auth.login.failed": "✖ Ungültiger API-Schlüssel oder Verbindungsfehler",
  "auth.logout.done": "✔ Abgemeldet. Anmeldedaten gelöscht.",
  "auth.status.notLoggedIn": "Nicht angemeldet. Führen Sie aus:",
  "auth.status.loggedIn": "✔ Angemeldet",
  "auth.status.keyPrefix": "Schlüssel-Präfix:",
  "auth.status.baseUrl": "Basis-URL  :",
  "client.notLoggedIn": "✖ Nicht angemeldet. Führen Sie aus:",
  "client.orExport": "oder exportieren Sie STEADYSTACK_API_KEY=<API_KEY>",
  "monitors.list.empty": "Keine Monitore gefunden. Erstellen Sie einen unter https://steadystack.dev/dashboard",
  "monitors.list.header": "ID",
  "monitors.list.headerName": "NAME",
  "monitors.list.headerStatus": "STATUS",
  "monitors.list.headerUrl": "URL",
  "monitors.get.notFound": "✖ Monitor nicht gefunden",
  "monitors.create.success": "✔ Monitor erstellt: {name}",
  "monitors.delete.success": "✔ Monitor gelöscht",
  "monitors.delete.confirm": "Möchten Sie {name} wirklich löschen?",
  "trigger.success": "✔ Prüfung für {name} ausgelöst",
  "trigger.status": "Status: {status}  Latenz: {latency}ms",
  "wait.timeout": "✖ Wartezeit abgelaufen",
  "wait.resolved": "✔ Monitor ist {status}",
  "logs.empty": "Keine Ereignisse für diesen Monitor",
  "logs.header": "ZEITSTEMPEL",
  "logs.headerStatus": "STATUS",
  "logs.headerLatency": "LATENZ",
  "logs.headerReason": "URSACHE",
  "import.reading": "Uptime-Kuma-Export wird gelesen...",
  "import.found": "{count} Monitore zum Importieren gefunden",
  "import.success": "✔ {count} Monitore importiert",
  "import.failed": "✖ Import fehlgeschlagen: {reason}",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "Unbekannter Fehler",
};

const ptBR: Dict = {
  "auth.login.generateHint": "Gere uma chave de API em:",
  "auth.login.keyRequired": "✖ --key é obrigatório",
  "auth.login.success": "✔ Autenticado com sucesso!",
  "auth.login.foundMonitors": "{count} monitores encontrados",
  "auth.login.failed": "✖ Chave de API inválida ou falha de conexão",
  "auth.logout.done": "✔ Sessão encerrada. Credenciais limpas.",
  "auth.status.notLoggedIn": "Não autenticado. Execute:",
  "auth.status.loggedIn": "✔ Autenticado",
  "client.notLoggedIn": "✖ Não autenticado. Execute:",
  "monitors.list.empty": "Nenhum monitor encontrado. Crie um em https://steadystack.dev/dashboard",
  "monitors.create.success": "✔ Monitor criado: {name}",
  "trigger.success": "✔ Verificação disparada para {name}",
  "import.success": "✔ {count} monitores importados",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "Erro desconhecido",
};

const ja: Dict = {
  "auth.login.generateHint": "API キーを発行：",
  "auth.login.keyRequired": "✖ --key は必須です",
  "auth.login.success": "✔ 認証に成功しました！",
  "auth.login.foundMonitors": "{count} 件のモニターが見つかりました",
  "auth.login.failed": "✖ API キーが無効、または接続に失敗しました",
  "auth.logout.done": "✔ ログアウトしました。資格情報を削除しました。",
  "auth.status.notLoggedIn": "ログインしていません。実行してください：",
  "auth.status.loggedIn": "✔ ログイン中",
  "client.notLoggedIn": "✖ ログインしていません。実行してください：",
  "monitors.list.empty": "モニターが見つかりません。https://steadystack.dev/dashboard で作成してください",
  "monitors.create.success": "✔ モニターを作成しました: {name}",
  "trigger.success": "✔ {name} のチェックを開始しました",
  "import.success": "✔ {count} 件のモニターをインポートしました",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "不明なエラー",
};

const ko: Dict = {
  "auth.login.generateHint": "API 키 발급:",
  "auth.login.keyRequired": "✖ --key 는 필수입니다",
  "auth.login.success": "✔ 인증에 성공했습니다!",
  "auth.login.foundMonitors": "{count}개의 모니터를 찾았습니다",
  "auth.login.failed": "✖ API 키가 잘못되었거나 연결에 실패했습니다",
  "auth.logout.done": "✔ 로그아웃되었습니다. 자격 증명이 삭제되었습니다.",
  "auth.status.notLoggedIn": "로그인되지 않았습니다. 실행하세요:",
  "auth.status.loggedIn": "✔ 로그인됨",
  "client.notLoggedIn": "✖ 로그인되지 않았습니다. 실행하세요:",
  "monitors.list.empty": "모니터가 없습니다. https://steadystack.dev/dashboard 에서 만드세요",
  "monitors.create.success": "✔ 모니터가 생성되었습니다: {name}",
  "trigger.success": "✔ {name} 의 확인을 시작했습니다",
  "import.success": "✔ {count}개의 모니터를 가져왔습니다",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "알 수 없는 오류",
};

const zhCN: Dict = {
  "auth.login.generateHint": "在此生成 API 密钥：",
  "auth.login.keyRequired": "✖ --key 为必填项",
  "auth.login.success": "✔ 认证成功！",
  "auth.login.foundMonitors": "找到 {count} 个监控项",
  "auth.login.failed": "✖ API 密钥无效或连接失败",
  "auth.logout.done": "✔ 已登出。凭据已清除。",
  "auth.status.notLoggedIn": "未登录。请运行：",
  "auth.status.loggedIn": "✔ 已登录",
  "client.notLoggedIn": "✖ 未登录。请运行：",
  "monitors.list.empty": "未找到监控项。请在 https://steadystack.dev/dashboard 创建",
  "monitors.create.success": "✔ 监控项已创建：{name}",
  "trigger.success": "✔ 已触发 {name} 的检查",
  "import.success": "✔ 已导入 {count} 个监控项",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "未知错误",
};

const ar: Dict = {
  "auth.login.generateHint": "أنشئ مفتاح API على:",
  "auth.login.keyRequired": "✖ --key مطلوب",
  "auth.login.success": "✔ تمت المصادقة بنجاح!",
  "auth.login.foundMonitors": "تم العثور على {count} مراقبة",
  "auth.login.failed": "✖ مفتاح API غير صالح أو فشل الاتصال",
  "auth.logout.done": "✔ تم تسجيل الخروج. تم مسح بيانات الاعتماد.",
  "auth.status.notLoggedIn": "غير مسجل الدخول. شغّل:",
  "auth.status.loggedIn": "✔ مسجل الدخول",
  "client.notLoggedIn": "✖ غير مسجل الدخول. شغّل:",
  "monitors.list.empty": "لا توجد مراقبات. أنشئ واحدة على https://steadystack.dev/dashboard",
  "monitors.create.success": "✔ تم إنشاء المراقبة: {name}",
  "trigger.success": "✔ تم بدء فحص {name}",
  "import.success": "✔ تم استيراد {count} مراقبة",
  "generic.httpError": "HTTP {status}",
  "generic.unknown": "خطأ غير معروف",
};

const CATALOGS: Record<CliLocale, Dict> = {
  en,
  es,
  fr,
  de,
  "pt-BR": ptBR,
  ja,
  ko,
  "zh-CN": zhCN,
  ar,
};

let activeLocale: CliLocale = "en";

/** Resolve the OS/env locale tag (e.g. "es_ES.UTF-8") to a supported CLI locale. */
function detectSystemLocale(): CliLocale {
  const tag =
    process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || "";
  const base = tag.split(".")[0].split("@")[0].replace("_", "-").toLowerCase();
  if (!base || base === "c" || base === "posix") return "en";

  if ((CLI_LOCALES as readonly string[]).includes(base)) return base as CliLocale;
  const prefix = base.split("-")[0];
  if (prefix === "pt") return "pt-BR";
  if (prefix === "zh") return "zh-CN";
  const match = (CLI_LOCALES as readonly string[]).find((l) =>
    l.toLowerCase().startsWith(prefix),
  );
  return (match as CliLocale) ?? "en";
}

/**
 * Initialize the CLI locale. Call once from index.ts before parsing commands.
 * Precedence: --locale flag > STEADYSTACK_LOCALE > LC_ALL/LANG > en.
 */
export function initLocale(flagLocale?: string): CliLocale {
  const candidate = flagLocale || process.env.STEADYSTACK_LOCALE;
  if (candidate) {
    const base = candidate.toLowerCase();
    if ((CLI_LOCALES as readonly string[]).includes(base)) {
      activeLocale = base as CliLocale;
    } else if (base.startsWith("pt")) {
      activeLocale = "pt-BR";
    } else if (base.startsWith("zh")) {
      activeLocale = "zh-CN";
    } else {
      const match = (CLI_LOCALES as readonly string[]).find((l) =>
        l.toLowerCase().startsWith(base.split("-")[0]),
      );
      activeLocale = (match as CliLocale) ?? detectSystemLocale();
    }
  } else {
    activeLocale = detectSystemLocale();
  }
  return activeLocale;
}

export function getLocale(): CliLocale {
  return activeLocale;
}

/** Translate a key with {placeholder} interpolation; falls back to English. */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const dict = CATALOGS[activeLocale] ?? en;
  let str = dict[key] ?? en[key] ?? key;
  for (const [name, value] of Object.entries(params)) {
    str = str.replaceAll(`{${name}}`, String(value));
  }
  return str;
}

/** Locale-aware number formatting for CLI output. */
export function formatNumber(value: number): string {
  try {
    return value.toLocaleString(activeLocale === "en" ? "en-US" : activeLocale);
  } catch {
    return value.toLocaleString("en-US");
  }
}
