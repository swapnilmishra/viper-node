export interface IConfigReader {
  setConfigName(fileName: string): void;
  addConfigPath(path: string): void;
  readInConfig(): { error?: Error };
  setEnvKeyReplacer(replacedKey: string, replaceWith: string): void;
  setKV(key: string, value: any): void;
  getString(propertyPath: string): string;
  getInt(propertyPath: string): number;
  getBoolean(propertyPath: string): boolean;
  getDate(propertyPath: string): Date;
  getStringArray(propertyPath: string): Array<string>;
  getIntArray(propertyPath: string): Array<number>;
}

export interface KeyReplacer {
  replacedKey: string;
  replacedWith: string;
}
