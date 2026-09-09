declare module "@prisma/client" {
  export class PrismaClient {
    character: {
      upsert(args: any): Promise<any>;
      findUnique(args: any): Promise<any>;
      update(args: any): Promise<any>;
    };
    ledger: {
      create(args: any): Promise<any>;
    };
    characterState: {
      upsert(args: any): Promise<any>;
      findUnique(args: any): Promise<any>;
    };
  }
}
