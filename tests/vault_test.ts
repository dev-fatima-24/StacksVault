import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

Clarinet.test({
  name: "vault: deposit and get-balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    const block = chain.mineBlock([
      Tx.contractCall("vault", "deposit", [
        types.principal(user.address),
        types.uint(1000000),
      ], deployer.address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    const balance = chain.callReadOnlyFn("vault", "get-balance", [
      types.principal(user.address),
    ], deployer.address);
    balance.result.expectUint(1000000);
  },
});

Clarinet.test({
  name: "vault: get-accrued-yield increases with blocks",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    chain.mineBlock([
      Tx.contractCall("vault", "deposit", [
        types.principal(user.address),
        types.uint(10000000),
      ], deployer.address),
    ]);

    // Mine 100 blocks
    chain.mineEmptyBlockUntil(chain.blockHeight + 100);

    const yield_ = chain.callReadOnlyFn("vault", "get-accrued-yield", [
      types.principal(user.address),
    ], deployer.address);

    const yieldVal = yield_.result.expectUint;
    // yield = 10000000 * 100 * 1 / 10000 = 100000
    assertEquals(Number(yield_.result.slice(1)), 100000);
  },
});

Clarinet.test({
  name: "vault: unauthorized set-yield-rate fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const attacker = accounts.get("wallet_2")!;

    const block = chain.mineBlock([
      Tx.contractCall("vault", "set-yield-rate", [types.uint(5)], attacker.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  },
});
