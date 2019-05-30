import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  FileTypeMapping,
  Json
} from "./consts";
import { ConfigReader } from "./interfaces";

import path from "path";

export class FileConfigReader implements ConfigReader {
  private fileName: string = "";
  private lookupPath: string = "";
  private fileType: string | undefined;
  private config: any;

  public setConfigName(fileName: string): void {
    this.fileName = fileName;
  }

  public addConfigPath(path: string): void {
    this.lookupPath = path;
  }

  public readInConfig(): { error?: Error } {
    if (this.fileName === "" || this.lookupPath === "") {
      return { error: ErrorInvalidFilePath };
    }

    const [, fileType] = this.fileName.split(".");

    if (!fileType || fileType === "") {
      return { error: ErrorNoFileType };
    }

    this.fileType = FileTypeMapping().get(fileType);

    switch (this.fileType) {
      case Json:
        this.readJSON();
        break;
    }

    return { error: undefined };
  }

  getString(propertyPath: string): string {
    const conf = this.config[propertyPath];
    return String(conf);
  }
  getInt(propertyPath: string): number {
    const conf = this.config[propertyPath];
    return parseInt(conf);
  }
  getBoolean(propertyPath: string): boolean {
    const conf = this.config[propertyPath];
    return Boolean(conf);
  }
  getDate(propertyPath: string): Date {
    const conf = this.config[propertyPath];
    return new Date(conf);
  }
  getStringArray(propertyPath: string): string[] {
    const conf: any[] = this.config[propertyPath];

    if (conf === undefined) {
      return [];
    }
    const confs: string[] = conf.map(c => {
      return String(c);
    });
    return confs;
  }
  getIntArray(propertyPath: string): number[] {
    const conf: any[] = this.config[propertyPath];
    if (conf === undefined) {
      return [];
    }
    const confs: number[] = conf.map(c => {
      return parseInt(c);
    });
    return confs;
  }

  private readJSON() {
    this.config = require(path.join(this.lookupPath, this.fileName));
  }
}
