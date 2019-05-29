import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  FileType,
  Json,
  Yaml,
  Yml,
  Toml
} from "./consts";
import { ConfigReader, Config } from "./configmanager";

export class FileConfigReader implements ConfigReader {
  private fileName: string = "";
  private filePath: string = "";
  private fileType: string | undefined;
  private config: Config;

  public setConfigName(fileName: string): void {
    this.fileName = fileName;
  }

  public addConfigPath(path: string): void {
    this.filePath = path;
  }

  public readInConfig(): { error?: Error } {
    if (this.fileName === "" && this.filePath === "") {
      return { error: ErrorInvalidFilePath };
    }

    const [, fileType] = this.fileName.split(".");

    if (!fileType || fileType === "") {
      return { error: ErrorNoFileType };
    }

    this.fileType = FileType.get(fileType);

    switch (this.fileType) {
      case Json:
        this.readJSON(this.filePath);
        break;
      case Yaml:
        break;
      case Yml:
        break;
      case Toml:
        break;
      default:
        break;
    }

    return { error: undefined };
  }

  private readJSON(name: string) {
    const config = require(name);
    this.config = new JsonConfig(config);
  }
}

class JsonConfig implements Config {
  private config: Object;
  constructor(config: Object) {
    this.config = config;
  }
  getString(propertyPath: string): string {
    throw new Error("Method not implemented.");
  }
  getInt(propertyPath: string): number {
    throw new Error("Method not implemented.");
  }
  getBoolean(propertyPath: string): boolean {
    throw new Error("Method not implemented.");
  }
  getDate(propertyPath: string): Date {
    throw new Error("Method not implemented.");
  }
  getStringArray(propertyPath: string): string[] {
    throw new Error("Method not implemented.");
  }
  getIntArray(propertyPath: string): number[] {
    throw new Error("Method not implemented.");
  }
}
