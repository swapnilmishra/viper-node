import { IPropertyReader } from "./interfaces";

export class PropertyReader implements IPropertyReader {
  private config: any;
  constructor(config: any) {
    this.config = config;
  }
  getString(propertyPath: string): string {
    const conf = this.readProperty(propertyPath, this.config);
    return String(conf);
  }
  getInt(propertyPath: string): number {
    const conf = this.readProperty(propertyPath, this.config);
    return parseInt(conf);
  }
  getBoolean(propertyPath: string): boolean {
    const conf = this.readProperty(propertyPath, this.config);
    return Boolean(conf);
  }
  getDate(propertyPath: string): Date {
    const conf = this.readProperty(propertyPath, this.config);
    return new Date(conf);
  }
  getStringArray(propertyPath: string): string[] {
    const conf: any[] = this.readProperty(propertyPath, this.config);

    if (conf === undefined) {
      return [];
    }
    const confs: string[] = conf.map(c => {
      return String(c);
    });
    return confs;
  }
  getIntArray(propertyPath: string): number[] {
    const conf: any[] = this.readProperty(propertyPath, this.config);
    if (conf === undefined) {
      return [];
    }
    const confs: number[] = conf.map(c => {
      return parseInt(c);
    });
    return confs;
  }

  private readProperty(propPath: string, readFromObj: any): any {
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
}
