// Temporary in-memory file store for cross-page file transfer
let tempFile: File | undefined = undefined;

export function setTempFile(file: File) {
  tempFile = file;
}

export function getTempFile(): File | undefined {
  const file = tempFile;
  tempFile = undefined;
  return file;
} 