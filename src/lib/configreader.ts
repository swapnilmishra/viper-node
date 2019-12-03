import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  FileTypeMapping,
  Json,
  Toml,
  ErrorUnrecognisedFormat,
  Yaml
} from "./consts";
import { IConfigReader, KeyReplacer } from "./interfaces";

import path from "path";
import fs from "fs";
import { safeLoad as yamlPArser } from "js-yaml";
import { parse as tomlParser } from "toml";

export class ConfigReader implements IConfigReader {
  private config: any;
  private fileName!: string;
  private lookupPath!: string;
  private fileType: string | undefined;
  private replacer!: KeyReplacer;
  private kvCache: Object = {};

  public setConfigName(fileName: string): IConfigReader {
    this.fileName = fileName;
    return this;
  }
  public addConfigPath(path: string): IConfigReader {
    this.lookupPath = path;
    return this;
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
        this.config = tomlParser(
          fs.readFileSync(path.join(this.lookupPath, this.fileName)).toString()
        );
        break;
      case Yaml:
        this.config = yamlPArser(
          fs.readFileSync(path.join(this.lookupPath, this.fileName)).toString()
        );
        break;
      default:
        return { error: ErrorUnrecognisedFormat };
    }

    return { error: undefined };
  }
  setEnvKeyReplacer(replacedKey: string, replacedWith: string): IConfigReader {
    this.replacer = { replacedKey: replacedKey, replacedWith: replacedWith };
    return this;
  }
  setKV(propertyPath: string, value: any): IConfigReader {
    writeNestedProperty(propertyPath, this.kvCache, value);
    return this;
  }
  getString(propertyPath: string): string {
    let conf: string | undefined;
    conf = readProp(propertyPath, this.kvCache);
    if (conf) {
      return String(conf);
    }
    conf = this.readFromEnv(propertyPath);
    if (conf) {
      return String(conf);
    }
    conf = readProp(propertyPath, this.config);
    return String(conf);
  }
  getInt(propertyPath: string): number {
    let conf: any;
    conf = readProp(propertyPath, this.kvCache);
    if (conf) {
      return parseInt(conf);
    }
    conf = this.readFromEnv(propertyPath);
    if (conf) {
      return parseInt(conf);
    }
    conf = readProp(propertyPath, this.config);
    return parseInt(conf);
  }
  getFloat(propertyPath: string): number {
    let conf: any;
    conf = readProp(propertyPath, this.kvCache);
    if (conf) {
      return parseFloat(conf);
    }
    conf = this.readFromEnv(propertyPath);
    if (conf) {
      return parseFloat(conf);
    }
    conf = readProp(propertyPath, this.config);
    return parseFloat(conf);
  }
  getBoolean(propertyPath: string): boolean {
    let conf: any;
    conf = readProp(propertyPath, this.kvCache);
    if (conf !== undefined) {
      return Boolean(conf);
    }
    conf = readProp(propertyPath, this.config);
    return Boolean(conf);
  }
  getDate(propertyPath: string): Date {
    let conf: any;
    conf = readProp(propertyPath, this.kvCache);
    if (conf) {
      return new Date(conf);
    }
    conf = readProp(propertyPath, this.config);
    return new Date(conf);
  }
  getStringArray(propertyPath: string): string[] {
    let conf: any[];
    conf = readProp(propertyPath, this.kvCache);
    if (conf) {
      return conf.map(c => {
        return String(c);
      });
    }
    conf = readProp(propertyPath, this.config);
    if (conf === undefined) {
      return [];
    }
    const confs: string[] = conf.map(c => {
      return String(c);
    });
    return confs;
  }
  getIntArray(propertyPath: string): number[] {
    let conf: any[];
    conf = readProp(propertyPath, this.kvCache);
    if (conf) {
      return conf.map(c => {
        return parseInt(c);
      });
    }
    conf = readProp(propertyPath, this.config);
    if (conf === undefined) {
      return [];
    }
    const confs: number[] = conf.map(c => {
      return parseInt(c);
    });
    return confs;
  }

  getFloatArray(propertyPath: string): number[] {
    let conf: any[];
    conf = readProp(propertyPath, this.kvCache);
    if (conf) {
      return conf.map(c => {
        return parseFloat(c);
      });
    }
    conf = readProp(propertyPath, this.config);
    if (conf === undefined) {
      return [];
    }
    const confs: number[] = conf.map(c => {
      return parseFloat(c);
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

export function readProp(propPath: string, targetObj: any): any {
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
 * in obj for obj[key1][key2]. It also creates intermediate objects if necessary
 * @param propertyPath
 * @param targetObj
 * @param propertyValue
 */
export function writeNestedProperty(
  propertyPath: string,
  targetObj: any,
  propertyValue: any
): void {
  const props = propertyPath.split(".");

  (function findProp(obj: any, propNames: string[], index: number): void {
    const propName = props[index];
    const propVal = obj[propName];
    if (propNames.length === 1) {
      obj[propNames[0]] = propertyValue;
      return;
    }
    if (propVal) {
      index++;
      return findProp(propVal, propNames.slice(index), index);
    } else {
      fillObjectIfEmpty(obj, propNames.slice(index), propertyValue);
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