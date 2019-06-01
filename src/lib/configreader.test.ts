import { ConfigReader } from "./configreader";
import path from "path";
import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  ErrorUnrecognisedFormat
} from "./consts";

describe("file based config tests", () => {
  describe("config reader init tests", () => {
    test("missing mandatory configName", () => {
      let config: ConfigReader;
      config = new ConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorInvalidFilePath);
    });

    test("missing mandatory configPath", () => {
      let config: ConfigReader;
      config = new ConfigReader();
      config.setConfigName("test.json");
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorInvalidFilePath);
    });

    test("missing mandatory file extension", () => {
      let config: ConfigReader;
      config = new ConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      config.setConfigName("test");
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorNoFileType);
    });

    test("missing mandatory file extension", () => {
      let config: ConfigReader;
      config = new ConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      config.setConfigName("test.format");
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorUnrecognisedFormat);
    });
  });

  describe("test json config", () => {
    let config: ConfigReader;
    beforeAll(() => {
      config = new ConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      config.setConfigName("test.json");
      const { error } = config.readInConfig();
      expect(error).toBe(undefined);
    });
    test("reads string value correctly", () => {
      const name = config.getString("name");
      expect(name).toBe("bob");
    });

    test("reads string value from env instead of config", () => {
      process.env.NAME = "bobby";
      const name = config.getString("name");
      expect(name).toBe("bobby");
    });

    test("reads int value correctly", () => {
      const age = config.getInt("age");
      expect(age).toBe(24);
    });

    test("reads int value from env instead of config", () => {
      process.env.AGE = "30";
      const age = config.getInt("age");
      expect(age).toBe(30);
    });

    test("reads boolean value correctly", () => {
      const married = config.getBoolean("married");
      expect(married).toBeTruthy();
    });

    test("reads date value correctly", () => {
      const dob = config.getDate("dateOfBirth");
      expect(dob).toStrictEqual(new Date("2019-05-30T12:11:11.140Z"));
    });

    test("reads array of string values correctly", () => {
      const languages = config.getStringArray("languages");
      expect(languages).toStrictEqual(["german", "english"]);
    });

    test("returns empty array when the config is not found for getStringArray", () => {
      const languages = config.getStringArray("languages.lang");
      expect(languages).toStrictEqual([]);
    });

    test("reads array of int values correctly", () => {
      const counts = config.getIntArray("counts");
      expect(counts).toStrictEqual([1, 2, 3]);
    });

    test("returns empty array when the config is not found for getIntArray", () => {
      const counts = config.getIntArray("counts.count");
      expect(counts).toStrictEqual([]);
    });
  });

  describe("test toml config", () => {
    let config: ConfigReader;
    beforeAll(() => {
      config = new ConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      config.setConfigName("test.toml");
      const { error } = config.readInConfig();
      expect(error).toBe(undefined);
    });
    test("reads string value correctly", () => {
      const title = config.getString("title");
      expect(title).toBe("TOML Example");
    });

    test("reads int value correctly", () => {
      const age = config.getInt("database.connection_max");
      expect(age).toBe(5000);
    });

    test("reads boolean value correctly", () => {
      const married = config.getBoolean("database.enabled");
      expect(married).toBeTruthy();
    });

    test("reads date value correctly", () => {
      const dob = config.getDate("owner.dob");
      expect(dob).toStrictEqual(new Date("1979-05-27T07:32:00-08:00"));
    });

    test("reads array of string values correctly", () => {
      const languages = config.getStringArray("clients.hosts");
      expect(languages).toStrictEqual(["alpha", "omega"]);
    });

    test("returns empty array when the config is not found for getStringArray", () => {
      const languages = config.getStringArray("hosts.something");
      expect(languages).toStrictEqual([]);
    });

    test("reads array of int values correctly", () => {
      const counts = config.getIntArray("database.ports");
      expect(counts).toStrictEqual([8001, 8001, 8002]);
    });

    test("returns empty array when the config is not found for getIntArray", () => {
      const counts = config.getIntArray("counts.count");
      expect(counts).toStrictEqual([]);
    });
  });
});
