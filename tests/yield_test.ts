import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

Clarinet.test({
  name: "yield: global index increases after update",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;

    const before = chain.callReadOnlyFn("yield", "get-global-index", [], deployer.address);
    const initialIndex = Number(before.result.slice(1));

    chain.mineEmptyBlockUntil(chain.blockHeight + 10);

    chain.mineBlock([
      Tx.contractCall("yield", "update-yield-index", [], deployer.address),
    ]);

    const after = chain.callReadOnlyFn("yield", "get-global-index", [], deployer.address);
    const newIndex = Number(after.result.slice(1));

    assertEquals(newIndex > initialIndex, true);
  },
});

Clarinet.test({
  name: "yield: snapshot-user-index records current index",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;

    chain.mineBlock([
      Tx.contractCall("yield", "snapshot-user-index", [
        types.principal(user.address),
      ], deployer.address),
    ]);

    const globalIdx = chain.callReadOnlyFn("yield", "get-global-index", [], deployer.address);
    const userIdx = chain.callReadOnlyFn("yield", "get-user-index", [
      types.principal(user.address),
    ], deployer.address);

    assertEquals(globalIdx.result, userIdx.result);
  },
});
