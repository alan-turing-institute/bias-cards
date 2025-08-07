// Storage operations

// File operations
export {
  createDropHandler,
  createFileInputHandler,
  downloadWorkspaceAsFile,
  FileOperationError,
  type FileOperations,
  fileOperations,
  generateWorkspaceFilename,
  uploadWorkspaceFromFile,
} from './file-operations';
export {
  clearAutoSaveTimer,
  createAutoSaveTimer,
  deleteWorkspaceFromLocalStorage,
  getAllSavedSessions,
  loadWorkspaceFromLocalStorage,
  SerializationError,
  StorageError,
  type StorageManager,
  saveWorkspaceToLocalStorage,
  storageManager,
} from './storage';
