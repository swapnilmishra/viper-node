export const Json = "json";
export const Yaml = "yaml";
export const Toml = "toml";
export const Unknown = "";

export const ErrorInvalidFilePath = new Error("invalid file path or file name");
export const ErrorNoFileType = new Error("invalid file type");
export const ErrorUnrecognisedFormat = new Error(
  "this type of configuration format is not supported at the moment"
);

export const FileTypeMapping = (): Map<string, string> => {
  const FileType: Map<string, string> = new Map();
  FileType.set("json", Json);
  FileType.set("yaml", Yaml);
  FileType.set("toml", Toml);
  return FileType;
};
