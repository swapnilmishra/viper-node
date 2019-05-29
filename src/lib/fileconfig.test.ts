import { FileConfigReader } from "./fileconfig";
import { ConfigReader } from "./configmanager";

test("file based config", () => {
  const config: ConfigReader = new FileConfigReader();
  config.addConfigPath("../testdata");
  config.setConfigName("test.json");
  const { error } = config.readInConfig();
  expect(error).toBe(undefined);
});
