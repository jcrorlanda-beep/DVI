declare module "@prisma/client" {
  export type PrismaClientOptions = {
    datasources?: {
      db?: {
        url?: string;
      };
    };
  };

  export class PrismaClient {
    constructor(options?: PrismaClientOptions);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
    [key: string]: unknown;
  }
}
