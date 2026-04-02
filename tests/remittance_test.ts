import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

Clarinet.test({
  name: "remittance: calculate-split is correct",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    const result = chain.callReadOnlyFn("remittance", "calculate-split", [
      types.uint(1000000),
      types.uint(30),
    ], deployer.address);

    const tuple = result.result.expectTuple() as any;
    assertEquals(tuple["instant"], types.uint(700000));
    assertEquals(tuple["locked"], types.uint(300000));
  },
});

Clarinet.test({
  name: "remittance: send-remittance splits funds correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const sender = accounts.get("wallet_1")!;
    const recipient = accounts.get("wallet_2")!;

    const block = chain.mineBlock([
      Tx.contractCall("remittance", "send-remittance", [
        types.principal(recipient.address),
        types.uint(1000000),
        types.uint(30),
      ], sender.address),
    ]);

    const result = block.receipts[0].result.expectOk().expectTuple() as any;
    assertEquals(result["instant"], types.uint(700000));
    assertEquals(result["locked"], types.uint(300000));
  },
});

Clarinet.test({
  name: "remittance: invalid percentage fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const sender = accounts.get("wallet_1")!;
    const recipient = accounts.get("wallet_2")!;

    const block = chain.mineBlock([
      Tx.contractCall("remittance", "send-remittance", [
        types.principal(recipient.address),
        types.uint(1000000),
        types.uint(101),
      ], sender.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(100);
  },
});
