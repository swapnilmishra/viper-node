export interface IConfigReader {
  setConfigName(fileName: string): IConfigReader;
  addConfigPath(path: string): IConfigReader;
  readInConfig(): { error?: Error };
  setEnvKeyReplacer(replacedKey: string, replaceWith: string): IConfigReader;
  setKV(key: string, value: any): IConfigReader;
  getString(propertyPath: string): string;
  getInt(propertyPath: string): number;
  getFloat(propertyPath: string): number;
  getBoolean(propertyPath: string): boolean;
  getDate(propertyPath: string): Date;
  getStringArray(propertyPath: string): Array<string>;
  getIntArray(propertyPath: string): Array<number>;
  getFloatArray(propertyPath: string): Array<number>;
}

export interface KeyReplacer {
  replacedKey: string;
  replacedWith: string;
}
