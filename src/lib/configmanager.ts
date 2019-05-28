export interface ConfigManager {
  SetConfigName(fileName: string): void;
  AddConfigPath(path: string): void;
  ReadInConfig(): { error?: Error };
}
