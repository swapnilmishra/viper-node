export interface IFileReader {
  setConfigName(fileName: string): void;
  addConfigPath(path: string): void;
  readInConfig(): { error?: Error };
}

export interface IPropertyReader {
  getString(propertyPath: string): string;
  getInt(propertyPath: string): number;
  getBoolean(propertyPath: string): boolean;
  getDate(propertyPath: string): Date;
  getStringArray(propertyPath: string): Array<string>;
  getIntArray(propertyPath: string): Array<number>;
}
