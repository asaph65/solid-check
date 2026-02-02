/**
 * Constantes pour les stratégies d'analyse
 * Séparé pour éviter que les mots-clés dans les chaînes ne polluent le score de complexité d'autres fichiers.
 */
export const MOTS_CLES_IGNORES = new Set([
    'if', 'else', 'for', 'while', 'switch', 'catch', 'constructor', 'super'
]);

export const REGEX_FONCTIONS = /(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:async\s+)?function|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*(?:=>|{))/g;
