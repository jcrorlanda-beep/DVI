export type MigrationImportModulePreview = {
  moduleKey: string;
  tableName: string;
  recordCount: number;
  warnings?: string[];
};

export type MigrationImportPreviewRequest = {
  formatVersion: string;
  modules: Array<{
    moduleKey: string;
    tableName: string;
    records: unknown;
  }>;
};

export type MigrationImportPreviewResponse = {
  previewId: string;
  modules: MigrationImportModulePreview[];
  canCommit: boolean;
  warnings: string[];
};

export type MigrationImportCommitRequest = {
  previewId: string;
  confirmation: "COMMIT";
};

export type MigrationImportCommitResponse = {
  committed: boolean;
  importedCount: number;
  localToRemoteMap: Record<string, string>;
};
