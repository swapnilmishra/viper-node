import { FileConfigReader } from "./fileconfig";
import { ConfigReader } from "./interfaces";
import path from "path";
import { ErrorInvalidFilePath, ErrorNoFileType } from "./consts";

describe("file based config tests", () => {
  describe("config reader init tests", () => {
    test("missing mandatory configName", () => {
      let config: ConfigReader;
      config = new FileConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorInvalidFilePath);
    });

    test("missing mandatory configPath", () => {
      let config: ConfigReader;
      config = new FileConfigReader();
      config.setConfigName("test.json");
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorInvalidFilePath);
    });

    test("missing mandatory file extension", () => {
      let config: ConfigReader;
      config = new FileConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      config.setConfigName("test");
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorNoFileType);
    });
  });

  describe("test different config types", () => {
    let config: ConfigReader;
    beforeAll(() => {
      config = new FileConfigReader();
      config.addConfigPath(path.join(__dirname, "../testdata"));
      config.setConfigName("test.json");
      const { error } = config.readInConfig();
      expect(error).toBe(undefined);
    });
    test("reads string value correctly", () => {
      const name = config.getString("name");
      expect(name).toBe("bob");
    });

    test("reads int value correctly", () => {
      const age = config.getInt("age");
      expect(age).toBe(24);
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
});
