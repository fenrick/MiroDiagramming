declare module '@prisma/client' {
  export class PrismaClient {
    [key: string]: any;
    $disconnect(): Promise<void>;
  }
}
