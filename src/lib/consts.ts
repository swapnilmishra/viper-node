export const Json = "json";
export const Yaml = "yaml";
export const Yml = "yml";
export const Toml = "toml";
export const Unknown = "";

export const FileType: Map<string, string> = new Map();
FileType.set("json", Json);
FileType.set("json", Yaml);
FileType.set("json", Yml);
FileType.set("json", Toml);
FileType.set("json", Unknown);

export const ErrorInvalidFilePath = new Error("invalid file path or file name");
export const ErrorNoFileType = new Error("invalid file type");
