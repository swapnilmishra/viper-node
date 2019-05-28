import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  FileType,
  Json,
  Yaml,
  Yml,
  Toml
} from "./consts";
import { ConfigManager } from "./configmanager";

export class FileConfig implements ConfigManager {
  private fileName: string = "";
  private filePath: string = "";
  private fileType: string | undefined;
  public SetConfigName(fileName: string): void {
    this.fileName = fileName;
  }
  public AddConfigPath(path: string): void {
    this.filePath = path;
  }
  public ReadInConfig(): { error?: Error } {
    if (this.fileName === "" && this.filePath === "") {
      return { error: ErrorInvalidFilePath };
    }

    console.log(`Filename ${this.fileName}`);

    const [, fileType] = this.fileName.split(".");

    if (!fileType || fileType === "") {
      return { error: ErrorNoFileType };
    }

    this.fileType = FileType.get(fileType);

    console.log(this.fileType);

    switch (this.fileType) {
      case Json:
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
}
