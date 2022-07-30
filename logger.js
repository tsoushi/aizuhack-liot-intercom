import log4js from 'log4js';

// ロガーの初期化
log4js.configure('log4js.config.json');

export const logger = log4js.getLogger();
export const databaseLogger = log4js.getLogger('database');
export const systemLogger = log4js.getLogger('system');
export const lineLogger = log4js.getLogger('line');
export const accessLogger = log4js.getLogger('access');