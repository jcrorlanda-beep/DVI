export type ValidationIssue = {
  field: string;
  message: string;
  code: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type ValidationSchema = {
  name: string;
  validate: (input: unknown) => ValidationResult;
};
