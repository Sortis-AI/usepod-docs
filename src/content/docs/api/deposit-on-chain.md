---
title: Deposit on-chain (without the dashboard)
description: Deposit USDC or SOL into your token via the sovereign program using Anchor — the IDL is already published on-chain.
---

The dashboard is one front-end for funding. Behind it, every Use Pod deposit
is a single instruction against an Anchor program on Solana mainnet. The
program's IDL is already published on-chain, so building your own deposit
flow is a few lines of typed Anchor code — no hand-rolled discriminators,
no manual account derivation.

The instruction is what the LiquidMirror parses to credit you. **A plain SPL
USDC transfer with a memo will NOT be credited.** The `deposit_code` lives
in the instruction data, not in a separate memo instruction.

## What you need

| | |
|---|---|
| Sovereign program ID | `BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW` |
| Anchor IDL location | On-chain — fetched at runtime with the program ID |
| USDC mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Network | Solana mainnet-beta |

Your `deposit_code` is the 16-hex-char string returned by
[`POST /v1/register`](/api/register/). Treat it as the on-chain binding to
your token — anyone who deposits with this code credits your balance, so
guard it like a less-sensitive sibling of the API token itself.

## TypeScript — USDC deposit

```ts
// npm i @coral-xyz/anchor @solana/web3.js
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW");
const USDC_MINT  = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

async function depositUsdc(depositCode: string, amountUsdc: number) {
  const secret = Uint8Array.from(JSON.parse(process.env.WALLET_KEYPAIR_JSON!));
  const payer = Keypair.fromSecretKey(secret);
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(payer),
    { commitment: "confirmed" },
  );

  // IDL lives on-chain at the standard Anchor address — no JSON to ship.
  const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("on-chain IDL not found");
  const program = new anchor.Program(idl, provider);

  const code = Array.from(Buffer.from(depositCode, "hex")); // 8 bytes
  const amount = new anchor.BN(Math.round(amountUsdc * 1_000_000)); // USDC micros

  // Anchor 0.30+ resolves every other account from the IDL: the depositor's
  // and ops_wallet's USDC ATAs, the program config PDA, the token + ATA
  // programs (all pinned by IDL `address` constraints), and the signer.
  const sig = await program.methods
    .depositUsdc(code, amount)
    .accounts({ mint: USDC_MINT })
    .rpc();

  console.log("deposit:", sig);
  return sig;
}

await depositUsdc("bcb1d3eaddb99251", 5.00);
```

## TypeScript — SOL deposit (with Jupiter swap)

`deposit_sol` records a SOL→USDC swap that has happened in the same
transaction. You compose Jupiter's swap instructions in front of the
program's `deposit_sol` instruction and send them as one v0 transaction.

```ts
// npm i @coral-xyz/anchor @solana/web3.js @solana/spl-token
import * as anchor from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount, Connection, Keypair, PublicKey,
  TransactionInstruction, TransactionMessage, VersionedTransaction,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const PROGRAM_ID = new PublicKey("BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW");
const USDC_MINT  = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOL_MINT   = "So11111111111111111111111111111111111111112";
const JUP        = "https://lite-api.jup.ag/swap/v1";

const jupIxToWeb3 = (ix: any) => new TransactionInstruction({
  programId: new PublicKey(ix.programId),
  keys: ix.accounts.map((a: any) => ({
    pubkey: new PublicKey(a.pubkey), isSigner: a.isSigner, isWritable: a.isWritable,
  })),
  data: Buffer.from(ix.data, "base64"),
});

async function depositSol(depositCode: string, lamports: bigint, slippageBps = 50) {
  const secret = Uint8Array.from(JSON.parse(process.env.WALLET_KEYPAIR_JSON!));
  const payer = Keypair.fromSecretKey(secret);
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const provider = new anchor.AnchorProvider(
    connection, new anchor.Wallet(payer), { commitment: "confirmed" },
  );
  const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
  const program = new anchor.Program(idl!, provider);

  // 1. Jupiter quote + swap-instructions targeting the depositor's USDC ATA.
  const depositorUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, payer.publicKey);
  const quote = await fetch(
    `${JUP}/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT.toBase58()}` +
    `&amount=${lamports}&slippageBps=${slippageBps}`,
  ).then(r => r.json());

  const swap = await fetch(`${JUP}/swap-instructions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: payer.publicKey.toBase58(),
      destinationTokenAccount: depositorUsdcAta.toBase58(),
    }),
  }).then(r => r.json());

  const altAccounts: AddressLookupTableAccount[] = await Promise.all(
    (swap.addressLookupTableAddresses || []).map(async (a: string) =>
      (await connection.getAddressLookupTable(new PublicKey(a))).value!),
  );

  const preIx = [
    ...(swap.computeBudgetInstructions || []),
    ...(swap.setupInstructions || []),
    swap.swapInstruction,
  ].map(jupIxToWeb3);

  // 2. depositSol via Anchor — composed AFTER the swap in the same tx.
  const code = Array.from(Buffer.from(depositCode, "hex"));
  const usdcOutMin = new anchor.BN(quote.otherAmountThreshold);
  const depositTx = await program.methods
    .depositSol(code, new anchor.BN(lamports.toString()), usdcOutMin)
    .accounts({ usdcMint: USDC_MINT })
    .preInstructions(preIx)
    .transaction();

  // 3. Compile as v0 with the ALTs Jupiter returned, then sign + send.
  const { blockhash } = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions: depositTx.instructions,
  }).compileToV0Message(altAccounts);
  const vtx = new VersionedTransaction(message);
  vtx.sign([payer]);

  const sig = await connection.sendTransaction(vtx);
  console.log("deposit:", sig);
  return sig;
}

await depositSol("bcb1d3eaddb99251", 50_000_000n); // 0.05 SOL
```

## Python — USDC deposit

`anchorpy` is the Python Anchor client; it fetches the same on-chain IDL and
exposes typed instruction builders. Account resolution for PDA seeds that
reference a different account's state (`config.ops_wallet`) isn't automatic
in the Python client today, so we resolve `ops_wallet` and the two ATAs
ourselves and pass them through `Context(accounts=...)`.

```python
# pip install anchorpy solders solana
import asyncio, json, os
from anchorpy import Program, Provider, Wallet, Context
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solana.rpc.async_api import AsyncClient

PROGRAM_ID       = Pubkey.from_string("BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW")
USDC_MINT        = Pubkey.from_string("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
TOKEN_PROGRAM    = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
ASSOC_TOKEN_PROG = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")

def derive_ata(owner: Pubkey, mint: Pubkey) -> Pubkey:
    ata, _ = Pubkey.find_program_address(
        [bytes(owner), bytes(TOKEN_PROGRAM), bytes(mint)],
        ASSOC_TOKEN_PROG,
    )
    return ata

async def deposit_usdc(deposit_code: str, amount_usdc: float) -> str:
    payer = Keypair.from_bytes(bytes(json.loads(os.environ["WALLET_KEYPAIR_JSON"])))
    client = AsyncClient("https://api.mainnet-beta.solana.com")
    provider = Provider(client, Wallet(payer))

    # Fetch IDL from on-chain at the standard Anchor address.
    idl = await Program.fetch_idl(PROGRAM_ID, provider)
    program = Program(idl, PROGRAM_ID, provider)

    # Resolve ops_wallet from on-chain config — the IDL declares
    # ops_wallet_ata's seeds as ["config.ops_wallet", token_program, mint].
    config_pda, _ = Pubkey.find_program_address([b"config"], PROGRAM_ID)
    config_acct = (await client.get_account_info(config_pda)).value
    if config_acct is None:
        raise RuntimeError("config PDA not found")
    ops_wallet = Pubkey.from_bytes(bytes(config_acct.data[8:40]))

    sig = await program.rpc["deposit_usdc"](
        list(bytes.fromhex(deposit_code)),
        round(amount_usdc * 1_000_000),
        ctx=Context(accounts={
            "depositor_ata":             derive_ata(payer.pubkey(), USDC_MINT),
            "ops_wallet_ata":            derive_ata(ops_wallet, USDC_MINT),
            "config":                    config_pda,
            "depositor":                 payer.pubkey(),
            "mint":                      USDC_MINT,
            "token_program":             TOKEN_PROGRAM,
            "associated_token_program":  ASSOC_TOKEN_PROG,
        }),
    )
    print(f"deposit: {sig}")
    return str(sig)

asyncio.run(deposit_usdc("bcb1d3eaddb99251", 5.00))
```

## Python — SOL deposit (with Jupiter swap)

Same structure as the TypeScript SOL example: get Jupiter swap instructions,
deserialize them as `solders` `Instruction`s, build the program's
`deposit_sol` instruction via `anchorpy`, compile a v0 transaction with the
ALTs Jupiter returned.

```python
# pip install anchorpy solders solana httpx
import asyncio, base64, json, os, struct
import httpx
from anchorpy import Program, Provider, Wallet, Context
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.instruction import AccountMeta, Instruction
from solders.message import MessageV0
from solders.transaction import VersionedTransaction
from solders.address_lookup_table_account import AddressLookupTableAccount
from solana.rpc.async_api import AsyncClient

PROGRAM_ID       = Pubkey.from_string("BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW")
USDC_MINT        = Pubkey.from_string("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
TOKEN_PROGRAM    = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
ASSOC_TOKEN_PROG = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
SOL_MINT = "So11111111111111111111111111111111111111112"
JUP      = "https://lite-api.jup.ag/swap/v1"

def derive_ata(owner: Pubkey, mint: Pubkey) -> Pubkey:
    ata, _ = Pubkey.find_program_address(
        [bytes(owner), bytes(TOKEN_PROGRAM), bytes(mint)],
        ASSOC_TOKEN_PROG,
    )
    return ata

def jup_ix_to_solders(ix: dict) -> Instruction:
    return Instruction(
        program_id=Pubkey.from_string(ix["programId"]),
        accounts=[
            AccountMeta(Pubkey.from_string(a["pubkey"]), is_signer=a["isSigner"], is_writable=a["isWritable"])
            for a in ix["accounts"]
        ],
        data=base64.b64decode(ix["data"]),
    )

async def deposit_sol(deposit_code: str, lamports: int, slippage_bps: int = 50) -> str:
    payer = Keypair.from_bytes(bytes(json.loads(os.environ["WALLET_KEYPAIR_JSON"])))
    client = AsyncClient("https://api.mainnet-beta.solana.com")
    provider = Provider(client, Wallet(payer))
    idl = await Program.fetch_idl(PROGRAM_ID, provider)
    program = Program(idl, PROGRAM_ID, provider)

    # 1. Jupiter quote + swap-instructions delivering USDC to depositor's ATA.
    depositor_usdc_ata = derive_ata(payer.pubkey(), USDC_MINT)
    async with httpx.AsyncClient() as http:
        quote = (await http.get(
            f"{JUP}/quote?inputMint={SOL_MINT}&outputMint={USDC_MINT}"
            f"&amount={lamports}&slippageBps={slippage_bps}",
        )).json()
        swap = (await http.post(f"{JUP}/swap-instructions", json={
            "quoteResponse": quote,
            "userPublicKey": str(payer.pubkey()),
            "destinationTokenAccount": str(depositor_usdc_ata),
        })).json()

    pre_ixs = [
        jup_ix_to_solders(ix) for ix in
        (swap.get("computeBudgetInstructions") or [])
        + (swap.get("setupInstructions") or [])
        + [swap["swapInstruction"]]
    ]

    # 2. Resolve ops_wallet and build deposit_sol via anchorpy.
    config_pda, _ = Pubkey.find_program_address([b"config"], PROGRAM_ID)
    config_acct = (await client.get_account_info(config_pda)).value
    ops_wallet = Pubkey.from_bytes(bytes(config_acct.data[8:40]))

    deposit_ix = await program.instruction["deposit_sol"](
        list(bytes.fromhex(deposit_code)),
        lamports,
        int(quote["otherAmountThreshold"]),
        ctx=Context(accounts={
            "depositor":                  payer.pubkey(),
            "depositor_usdc":             depositor_usdc_ata,
            "ops_wallet_ata":             derive_ata(ops_wallet, USDC_MINT),
            "config":                     config_pda,
            "usdc_mint":                  USDC_MINT,
            "token_program":              TOKEN_PROGRAM,
            "associated_token_program":   ASSOC_TOKEN_PROG,
        }),
    )

    # 3. Compile v0 transaction with Jupiter's address-lookup tables, sign, send.
    alt_pubkeys = [Pubkey.from_string(a) for a in (swap.get("addressLookupTableAddresses") or [])]
    alts: list[AddressLookupTableAccount] = []
    for pk in alt_pubkeys:
        alt = (await client.get_address_lookup_table(pk)).value
        if alt is not None:
            alts.append(alt)

    blockhash = (await client.get_latest_blockhash()).value.blockhash
    message = MessageV0.try_compile(
        payer=payer.pubkey(),
        instructions=pre_ixs + [deposit_ix],
        address_lookup_table_accounts=alts,
        recent_blockhash=blockhash,
    )
    vtx = VersionedTransaction(message, [payer])
    sig = (await client.send_transaction(vtx)).value
    print(f"deposit: {sig}")
    return str(sig)

asyncio.run(deposit_sol("bcb1d3eaddb99251", 50_000_000))  # 0.05 SOL
```

## Verifying the credit

Once the transaction confirms, the program emits a `Program data:` log line
the LiquidMirror parses to credit your token. `DepositEvent` (USDC) is:

```
[ 8 bytes ] discriminator = sha256("event:DepositEvent")[0..8]
[ 8 bytes ] deposit_code (raw)
[ 8 bytes ] amount (u64 LE, USDC micro-units)
[32 bytes ] USDC mint pubkey
[32 bytes ] depositor pubkey
[ 8 bytes ] timestamp (i64 LE, Unix seconds)
```

`SolDepositEvent` (SOL→USDC) carries `sol_lamports` and `usdc_received`
instead of a single `amount`. Your token balance updates within a few
seconds of finalization. Confirm with:

```bash
curl -s https://api.usepod.ai/proxy/<token>/balance
```

The `usdc_balance` field is in micro-units (divide by 1,000,000 for USDC).

## Common errors

- **"deposit landed but my balance didn't update."** Check the tx on
  Solscan or Solana Explorer. If `err: null`, the on-chain side is fine —
  the most likely cause is `deposit_code` mismatch. The 16 hex chars must
  come verbatim from a real `/v1/register` response; a random 16 hex chars
  binds to no token and is silently ignored.
- **"AccountNotFound for the ops wallet ATA."** The ops wallet's USDC ATA
  is expected to already exist on-chain. If it ever doesn't, fund any tiny
  USDC transfer to it from the dashboard once to materialize it, then
  retry.
- **"insufficient funds for fee."** Depositor needs SOL for the network
  fee in addition to the USDC for the deposit. ~0.00001 SOL covers a
  basic tx; the SOL-deposit path naturally has its own SOL.
- **The transfer succeeds but your balance doesn't update.** You probably
  sent a plain SPL transfer instead of invoking the sovereign program. A
  plain transfer routes USDC to the destination ATA but does NOT emit
  `DepositEvent` — there's no way for the LiquidMirror to know which
  token to credit, so it won't be. You must build `deposit_usdc` (or
  `deposit_sol`) through the program as shown above.

## `POD-BOND-XXXXXXXX` carve-out

If your `deposit_code` starts with `POD-BOND-`, the deposit routes to the
provider-bond ledger instead of a user balance. That's the supply-side
flow returned by `/v1/host/enroll`. **Regular users with `/v1/register`
codes should not use this prefix.** A `/v1/register` code is always 16 hex
chars with no prefix.
