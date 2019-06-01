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
  private kvCache: Object = {};

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
  setKV(propertyPath: string, value: any): void {
    writeNestedProperty(propertyPath, this.kvCache, value);
  }
  getString(propertyPath: string): string {
    let conf: string | undefined;

    conf = readNestedProperty(propertyPath, this.kvCache);
    if (conf) {
      return String(conf);
    }

    conf = this.readFromEnv(propertyPath);
    if (conf) {
      return String(conf);
    }

    conf = readNestedProperty(propertyPath, this.config);
    return String(conf);
  }
  getInt(propertyPath: string): number {
    const propVal = this.readFromEnv(propertyPath);
    if (propVal) {
      return parseInt(propVal);
    }
    const conf = readNestedProperty(propertyPath, this.config);
    return parseInt(conf);
  }
  getBoolean(propertyPath: string): boolean {
    const conf = readNestedProperty(propertyPath, this.config);
    return Boolean(conf);
  }
  getDate(propertyPath: string): Date {
    const conf = readNestedProperty(propertyPath, this.config);
    return new Date(conf);
  }
  getStringArray(propertyPath: string): string[] {
    const conf: any[] = readNestedProperty(propertyPath, this.config);

    if (conf === undefined) {
      return [];
    }
    const confs: string[] = conf.map(c => {
      return String(c);
    });
    return confs;
  }
  getIntArray(propertyPath: string): number[] {
    const conf: any[] = readNestedProperty(propertyPath, this.config);
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
      envKey = this.keyToEnv(envKey);
    }
    return process.env[envKey];
  }

  private keyToEnv(key: string): string {
    return key.replace(this.replacer.replacedKey, this.replacer.replacedWith);
  }
}

export function readNestedProperty(propPath: string, targetObj: any): any {
  const props = propPath.split(".");
  let propVal = targetObj;
  for (let i = 0; i < props.length; i++) {
    propVal = propVal[props[i]];
    if (propVal === undefined) {
      return propVal;
    }
  }
  return propVal;
}

/**
 * given a key in the form "key1.key2"(propPath) for "obj"(targetObj) this function sets the value
 * in obj for obj[key1][key2]. It also created intermediate objects if necessary
 * @param propPath
 * @param targetObj
 * @param value
 */
export function writeNestedProperty(
  propPath: string,
  targetObj: any,
  value: any
): void {
  const props = propPath.split(".");

  (function findProp(obj: any, propNames: string[], index: number): void {
    const propName = props[index];
    const propVal = obj[propName];
    if (propNames.length === 1) {
      obj[propNames[0]] = value;
      return;
    }
    if (propVal) {
      index++;
      return findProp(propVal, propNames.slice(index), index);
    } else {
      fillObjectIfEmpty(obj, propNames.slice(index), value);
    }
  })(targetObj, props, 0);
}

export function fillObjectIfEmpty(
  obj: any,
  propNames: string[],
  value: string
): void {
  if (propNames.length === 1) {
    obj[propNames[0]] = value;
    return;
  }
  let keyName = propNames[0];
  if (!obj[keyName]) {
    obj[keyName] = {};
    return fillObjectIfEmpty(obj[keyName], propNames.slice(1), value);
  }
}
