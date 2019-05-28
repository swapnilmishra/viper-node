import { FileConfig } from "./fileconfig";
import { ConfigManager } from "./configmanager";

test("file based config", () => {
  const config: ConfigManager = new FileConfig();
  config.AddConfigPath("../testdata");
  config.SetConfigName("test.json");
  const { error } = config.ReadInConfig();
  expect(error).toBe(undefined);
});
