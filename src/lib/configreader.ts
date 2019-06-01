import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  FileTypeMapping,
  Json,
  Toml,
  ErrorUnrecognisedFormat
} from "./consts";
import { IConfigReader, KeyReplacer } from "./interfaces";

import path from "path";
import fs from "fs";

export class ConfigReader implements IConfigReader {
  private config: any;
  private fileName!: string;
  private lookupPath!: string;
  private fileType: string | undefined;
  private replacer!: KeyReplacer;

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
    switch (this.fileType) {
      case Json:
        this.config = require(path.join(this.lookupPath, this.fileName));
        break;
      case Toml:
        const toml = require("toml");
        this.config = toml.parse(
          fs.readFileSync(path.join(this.lookupPath, this.fileName))
        );
        break;
      default:
        return { error: ErrorUnrecognisedFormat };
    }

    return { error: undefined };
  }
  setEnvKeyReplacer(replacedKey: string, replacedWith: string): void {
    this.replacer = { replacedKey: replacedKey, replacedWith: replacedWith };
  }
  getString(propertyPath: string): string {
    const propVal = this.readFromEnv(propertyPath);
    if (propVal) {
      return String(propVal);
    }
    const conf = readProperty(propertyPath, this.config);
    return String(conf);
  }
  getInt(propertyPath: string): number {
    const propVal = this.readFromEnv(propertyPath);
    if (propVal) {
      return parseInt(propVal);
    }
    const conf = readProperty(propertyPath, this.config);
    return parseInt(conf);
  }
  getBoolean(propertyPath: string): boolean {
    const conf = readProperty(propertyPath, this.config);
    return Boolean(conf);
  }
  getDate(propertyPath: string): Date {
    const conf = readProperty(propertyPath, this.config);
    return new Date(conf);
  }
  getStringArray(propertyPath: string): string[] {
    const conf: any[] = readProperty(propertyPath, this.config);

    if (conf === undefined) {
      return [];
    }
    const confs: string[] = conf.map(c => {
      return String(c);
    });
    return confs;
  }
  getIntArray(propertyPath: string): number[] {
    const conf: any[] = readProperty(propertyPath, this.config);
    if (conf === undefined) {
      return [];
    }
    const confs: number[] = conf.map(c => {
      return parseInt(c);
    });
    return confs;
  }

  private readFromEnv(propertyPath: string): string | undefined {
    let envKey = propertyPath.toUpperCase();
    if (this.replacer) {
      envKey = this.keyToEnv(propertyPath);
    }
    return process.env[envKey];
  }

  private keyToEnv(key: string): string {
    return key.replace(this.replacer.replacedKey, this.replacer.replacedWith);
  }
}

function readProperty(propPath: string, readFromObj: any): any {
  const props = propPath.split(".");
  let propVal = readFromObj;
  for (let i = 0; i < props.length; i++) {
    propVal = propVal[props[i]];
    if (propVal === undefined) {
      return propVal;
    }
  }
  return propVal;
}
