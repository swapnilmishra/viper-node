import test from "ava";
import { FileConfig } from "./fileconfig";
import { ConfigManager } from "./configmanager";

test("file based config", t => {
  const config: ConfigManager = new FileConfig();
  config.AddConfigPath("../testdata");
  config.SetConfigName("test.json");
  const { error } = config.ReadInConfig();
  t.is(error, undefined);
});
