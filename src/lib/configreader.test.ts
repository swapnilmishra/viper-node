import { ConfigReader, writeNestedProperty } from "./configreader";
import path from "path";
import {
  ErrorInvalidFilePath,
  ErrorNoFileType,
  ErrorUnrecognisedFormat
} from "./consts";

describe("file based config tests", () => {
  let config: ConfigReader;
  describe("trying to read the config throws error", () => {
    beforeEach(() => {
      config = new ConfigReader();
    });
    test("missing mandatory configName", () => {
      const { error } = config
        .addConfigPath(path.join(__dirname, "../testdata"))
        .readInConfig();
      expect(error).toBe(ErrorInvalidFilePath);
    });

    test("missing mandatory configPath", () => {
      const { error } = config.setConfigName("test.json").readInConfig();
      expect(error).toBe(ErrorInvalidFilePath);
    });

    test("missing mandatory file extension", () => {
      config
        .addConfigPath(path.join(__dirname, "../testdata"))
        .setConfigName("test");
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorNoFileType);
    });

    test("missing mandatory file extension", () => {
      config
        .addConfigPath(path.join(__dirname, "../testdata"))
        .setConfigName("test.format");
      const { error } = config.readInConfig();
      expect(error).toBe(ErrorUnrecognisedFormat);
    });
  });

  describe("test json config", () => {
    let config: ConfigReader;
    beforeEach(() => {
      config = new ConfigReader();
      const { error } = config
        .addConfigPath(path.join(__dirname, "../testdata"))
        .setConfigName("test.json")
        .readInConfig();
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

    test("reads string value from explicit setKV and not from env or config file", () => {
      process.env.NAME = "bobby";
      config.setKV("name", "ranu");
      const name = config.getString("name");
      expect(name).toBe("ranu");
    });

    test("reads string value from explicit deep setKV call", () => {
      config.setKV("company.name", "oracle");
      const companyName = config.getString("company.name");
      expect(companyName).toBe("oracle");
    });

    test("reads string value from env using setEnvKeyReplacer", () => {
      process.env.COMPANY_NAME = "cyborg";
      config.setEnvKeyReplacer(".", "_");
      const companyName = config.getString("company.name");
      expect(companyName).toBe("cyborg");
    });

    test("reads int value correctly", () => {
      const age = config.getInt("age");
      expect(age).toBe(24);
      config.setKV("age", 25);
      expect(config.getInt("age")).toBe(25);
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
      let counts = config.getIntArray("counts");
      expect(counts).toStrictEqual([1, 2, 3]);
      config.setKV("counts", [10,11])
      counts = config.getIntArray("counts");
      expect(counts).toStrictEqual([10,11]);
    });

    test("reads array of float values correctly", () => {
      expect(config.getFloatArray("random_prop")).toStrictEqual([])
      let counts = config.getFloatArray("amounts");
      expect(counts).toStrictEqual([3.33, 2.33]);
      config.setKV("amounts", [10.2,11.3])
      counts = config.getFloatArray("amounts");
      expect(counts).toStrictEqual([10.2,11.3]);
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
      const { error } = config
        .addConfigPath(path.join(__dirname, "../testdata"))
        .setConfigName("test.toml")
        .readInConfig();
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

  describe("test yaml config", () => {
    let config: ConfigReader;
    beforeAll(() => {
      config = new ConfigReader();
      const { error } = config
        .addConfigPath(path.join(__dirname, "../testdata"))
        .setConfigName("test.yaml")
        .readInConfig();
      expect(error).toBe(undefined);
    });
    test("reads string value correctly", () => {
      const title = config.getString("title");
      expect(title).toBe("Deep dive into TOML, JSON and YAML");
    });
    test("reads float value correctly", () => {
      const sitemap = config.getFloat("sitemap.priority");
      expect(sitemap).toBe(0.5);
    });

    test("reads explicitly set float value correctly", () => {
      config.setKV("sitemap.priority", 3.0);
      const sitemap = config.getFloat("sitemap.priority");
      expect(sitemap).toBe(3.0);
    });

    test("reads float value from env correctly", () => {
      process.env.SITEMAP_1 = "3.0";
      const sitemap = config.getFloat("sitemap_1");
      expect(sitemap).toBe(3.0);
    });

    test("reads boolean value correctly", () => {
      let ready = config.getBoolean("ready");
      expect(ready).toBeTruthy();
      config.setKV("ready", false);
      ready = config.getBoolean("ready");
      expect(ready).toBeFalsy();
    });

    test("reads date value correctly", () => {
      let publishDate = config.getDate("publishdate");
      expect(publishDate).toStrictEqual(new Date("2016-12-14T21:27:05.454Z"));
      config.setKV("publishdate", "2016-11-14T21:27:05.454Z")
      publishDate = config.getDate("publishdate");
      expect(publishDate).toStrictEqual(new Date("2016-11-14T21:27:05.454Z"));
    });

    test("reads array of string values correctly", () => {
      let tags = config.getStringArray("tags");
      expect(tags).toStrictEqual(["toml", "yaml", "json"]);
      config.setKV("tags", ["xml", "what?"])
      tags = config.getStringArray("tags");
      expect(tags).toStrictEqual(["xml", "what?"]);
    });

    test("returns empty array when the config is not found for getStringArray", () => {
      const tags = config.getStringArray("hosts.something");
      expect(tags).toStrictEqual([]);
    });
  });

  describe("test object manipulation", function() {
    test("sets the value into the key", () => {
      const obj: any = {
        firstName: "Swapnil",
        surname: true
      };

      writeNestedProperty("surname", obj, false);
      expect(obj).toStrictEqual({
        firstName: "Swapnil",
        surname: false
      });
    });
    test("sets the value into the key if it is already present", () => {
      const obj: any = {
        name: {
          firstName: "Swapnil",
          surname: "Mishra"
        }
      };

      writeNestedProperty("name.surname", obj, "joseph");
      expect(obj).toStrictEqual({
        name: {
          firstName: "Swapnil",
          surname: "joseph"
        }
      });
    });

    test("sets the value into the key if even part of it is present", () => {
      const obj: any = {
        name: {
          firstName: "Swapnil",
          surname: "Mishra"
        },
        address: {
          street: {
            number: 123,
            name: "str."
          }
        }
      };

      writeNestedProperty("address", obj, {
        street: {
          number: 125,
          name: "str."
        }
      });
      expect(obj).toStrictEqual({
        name: {
          firstName: "Swapnil",
          surname: "Mishra"
        },
        address: {
          street: {
            number: 125,
            name: "str."
          }
        }
      });
    });

    test("creates key and sets the value if it is not present", () => {
      const obj = {};
      writeNestedProperty("name.surname", obj, "joseph");
      expect(obj).toStrictEqual({ name: { surname: "joseph" } });
    });
  });
});
