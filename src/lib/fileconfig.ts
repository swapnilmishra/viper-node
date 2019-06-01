import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  FileTypeMapping,
  Json,
  Toml,
  ErrorUnrecognisedFormat
} from "./consts";
import { IFileReader, IPropertyReader } from "./interfaces";
import { PropertyReader } from "./propertyreader";

import path from "path";
import fs from "fs";

export class ConfigReader implements IFileReader, IPropertyReader {
  private fileName!: string;
  private lookupPath!: string;
  private fileType: string | undefined;
  private configType!: IPropertyReader;

  public setConfigName(fileName: string): void {
    this.fileName = fileName;
  }

  public addConfigPath(path: string): void {
    this.lookupPath = path;
  }

  public readInConfig(): { error?: Error } {
    if (!this.fileName || !this.lookupPath) {
      return { error: ErrorInvalidFilePath };
    }

    const [, fileType] = this.fileName.split(".");

    if (!fileType || fileType === "") {
      return { error: ErrorNoFileType };
    }

    this.fileType = FileTypeMapping().get(fileType);
    let readConfig;
    switch (this.fileType) {
      case Json:
        readConfig = require(path.join(this.lookupPath, this.fileName));
        this.configType = new PropertyReader(readConfig);
        break;
      case Toml:
        const toml = require("toml");
        readConfig = toml.parse(
          fs.readFileSync(path.join(this.lookupPath, this.fileName))
        );
        this.configType = new PropertyReader(readConfig);
        break;
      default:
        return { error: ErrorUnrecognisedFormat };
    }

    return { error: undefined };
  }

  getString(propertyPath: string): string {
    return this.configType.getString(propertyPath);
  }
  getInt(propertyPath: string): number {
    return this.configType.getInt(propertyPath);
  }
  getBoolean(propertyPath: string): boolean {
    return this.configType.getBoolean(propertyPath);
  }
  getDate(propertyPath: string): Date {
    return this.configType.getDate(propertyPath);
  }
  getStringArray(propertyPath: string): string[] {
    return this.configType.getStringArray(propertyPath);
  }
  getIntArray(propertyPath: string): number[] {
    return this.configType.getIntArray(propertyPath);
  }
}
