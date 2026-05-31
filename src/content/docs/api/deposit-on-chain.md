---
title: Deposit on-chain (without the dashboard)
description: Construct the DepositUsdc transaction yourself in JS or Python, and bind it to your token via deposit_code.
---

The dashboard is one front-end for funding. Behind it, every Use Pod deposit
is a single instruction sent to the sovereign program on Solana mainnet. This
page is the spec for building that instruction yourself — from a script, a
bot, or any wallet that can sign a custom transaction.

The instruction is what the LiquidMirror parses to credit you. **A plain SPL
USDC transfer with a memo will NOT be credited.** The `deposit_code` lives in
the instruction data, not in a separate memo instruction.

## Pieces you need

| Field | Value |
|---|---|
| Sovereign program ID | `BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW` |
| USDC mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| SPL Token program | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Associated Token program | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` |
| Network | Solana mainnet-beta |

Your `deposit_code` is the 16-hex-char string you got back from
[`POST /v1/register`](/api/register/). Treat it as the on-chain binding to
your token — anyone who deposits with this code credits your balance, so
treat it like a less-sensitive sibling of the API token itself.

## The `DepositUsdc` instruction

**Data (24 bytes):**

| Offset | Size | Field |
|---:|---:|---|
| 0 | 8 | Anchor discriminator: `[184, 148, 250, 169, 224, 213, 34, 126]` |
| 8 | 8 | `deposit_code` — 8 raw bytes (your 16-hex-char string, decoded) |
| 16 | 8 | `amount` — USDC micro-units, `u64` little-endian (1 USDC = 1,000,000) |

**Accounts (in this order):**

| # | Account | Signer? | Writable? | Notes |
|---:|---|:---:|:---:|---|
| 0 | Depositor's USDC ATA | | ✓ | Derived `(depositor, USDC mint)` |
| 1 | Ops wallet's USDC ATA | | ✓ | Derived `(ops_wallet, USDC mint)` |
| 2 | Config PDA | | | `find_program_address([b"config"], program_id)` |
| 3 | Depositor | ✓ | ✓ | Pays the fee, owns the source ATA |
| 4 | USDC mint | | | Constant above |
| 5 | SPL Token program | | | Constant above |
| 6 | Associated Token program | | | Constant above |

**The `ops_wallet` pubkey** is stored in the config PDA account. Read the
config PDA, skip the 8-byte Anchor discriminator, and take the next 32 bytes:
that's `ops_wallet`. Its USDC ATA is the destination.

## JavaScript / Node.js

Standalone, no Use Pod packages. Needs `@solana/web3.js`. Sign with whichever
keypair owns the USDC you're sending.

```js
// npm i @solana/web3.js
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW");
const USDC_MINT  = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const TOKEN_PROGRAM     = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOC_TOKEN_PROG  = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const DEPOSIT_USDC_DISCRIMINATOR = Uint8Array.from([184, 148, 250, 169, 224, 213, 34, 126]);

function deriveAta(owner, mint) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM.toBuffer(), mint.toBuffer()],
    ASSOC_TOKEN_PROG,
  );
  return ata;
}

function u64Le(n) {
  const b = new ArrayBuffer(8);
  new DataView(b).setBigUint64(0, BigInt(n), true);
  return new Uint8Array(b);
}

function depositCodeBytes(hex16) {
  if (!/^[0-9a-fA-F]{16}$/.test(hex16)) {
    throw new Error(`deposit_code must be 16 hex chars, got "${hex16}"`);
  }
  const out = new Uint8Array(8);
  for (let i = 0; i < 8; i++) out[i] = parseInt(hex16.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function depositUsdc({ rpcUrl, payerKeypair, depositCode, amountUsdc }) {
  const connection = new Connection(rpcUrl, "confirmed");
  const depositor = payerKeypair.publicKey;

  // 1. Resolve ops_wallet from the config PDA.
  const [configPda] = PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("config")],
    PROGRAM_ID,
  );
  const configAcct = await connection.getAccountInfo(configPda);
  if (!configAcct) throw new Error("config PDA not found — wrong network?");
  const opsWallet = new PublicKey(configAcct.data.subarray(8, 40));

  // 2. Build instruction data: discriminator(8) || code(8) || amount u64 LE(8)
  const amountMicros = BigInt(Math.round(amountUsdc * 1_000_000));
  const data = new Uint8Array(24);
  data.set(DEPOSIT_USDC_DISCRIMINATOR, 0);
  data.set(depositCodeBytes(depositCode), 8);
  data.set(u64Le(amountMicros), 16);

  // 3. Accounts in the order the program expects.
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: deriveAta(depositor, USDC_MINT), isSigner: false, isWritable: true },
      { pubkey: deriveAta(opsWallet, USDC_MINT), isSigner: false, isWritable: true },
      { pubkey: configPda,        isSigner: false, isWritable: false },
      { pubkey: depositor,        isSigner: true,  isWritable: true  },
      { pubkey: USDC_MINT,        isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM,    isSigner: false, isWritable: false },
      { pubkey: ASSOC_TOKEN_PROG, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [payerKeypair]);
  console.log("deposit landed:", sig);
  return sig;
}

// Usage
const secret = Uint8Array.from(JSON.parse(process.env.WALLET_KEYPAIR_JSON));
await depositUsdc({
  rpcUrl: "https://api.mainnet-beta.solana.com",
  payerKeypair: Keypair.fromSecretKey(secret),
  depositCode: "bcb1d3eaddb99251",   // from POST /v1/register
  amountUsdc: 5.00,
});
```

## Python

Standalone with `solders` (no async runtime required for the common path).

```python
# pip install solders solana
import hashlib
import json
import os
import struct

from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.instruction import AccountMeta, Instruction
from solders.transaction import Transaction
from solana.rpc.api import Client

PROGRAM_ID = Pubkey.from_string("BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW")
USDC_MINT  = Pubkey.from_string("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
TOKEN_PROGRAM    = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
ASSOC_TOKEN_PROG = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
DEPOSIT_USDC_DISCRIMINATOR = bytes([184, 148, 250, 169, 224, 213, 34, 126])


def derive_ata(owner: Pubkey, mint: Pubkey) -> Pubkey:
    ata, _ = Pubkey.find_program_address(
        [bytes(owner), bytes(TOKEN_PROGRAM), bytes(mint)],
        ASSOC_TOKEN_PROG,
    )
    return ata


def deposit_code_bytes(hex16: str) -> bytes:
    if len(hex16) != 16 or not all(c in "0123456789abcdefABCDEF" for c in hex16):
        raise ValueError(f'deposit_code must be 16 hex chars, got "{hex16}"')
    return bytes.fromhex(hex16)


def deposit_usdc(rpc_url: str, payer: Keypair, deposit_code: str, amount_usdc: float) -> str:
    client = Client(rpc_url)
    depositor = payer.pubkey()

    # 1. Resolve ops_wallet from the config PDA.
    config_pda, _ = Pubkey.find_program_address([b"config"], PROGRAM_ID)
    config_info = client.get_account_info(config_pda).value
    if config_info is None:
        raise RuntimeError("config PDA not found — wrong network?")
    ops_wallet = Pubkey.from_bytes(config_info.data[8:40])

    # 2. Build instruction data: discriminator(8) || code(8) || amount u64 LE(8)
    amount_micros = round(amount_usdc * 1_000_000)
    data = (
        DEPOSIT_USDC_DISCRIMINATOR
        + deposit_code_bytes(deposit_code)
        + struct.pack("<Q", amount_micros)
    )

    # 3. Accounts in the order the program expects.
    accounts = [
        AccountMeta(derive_ata(depositor, USDC_MINT), is_signer=False, is_writable=True),
        AccountMeta(derive_ata(ops_wallet, USDC_MINT), is_signer=False, is_writable=True),
        AccountMeta(config_pda,        is_signer=False, is_writable=False),
        AccountMeta(depositor,         is_signer=True,  is_writable=True),
        AccountMeta(USDC_MINT,         is_signer=False, is_writable=False),
        AccountMeta(TOKEN_PROGRAM,     is_signer=False, is_writable=False),
        AccountMeta(ASSOC_TOKEN_PROG,  is_signer=False, is_writable=False),
    ]
    ix = Instruction(PROGRAM_ID, data, accounts)

    blockhash = client.get_latest_blockhash().value.blockhash
    tx = Transaction.new_signed_with_payer([ix], depositor, [payer], blockhash)
    sig = client.send_transaction(tx).value
    print(f"deposit landed: {sig}")
    return str(sig)


if __name__ == "__main__":
    secret = bytes(json.loads(os.environ["WALLET_KEYPAIR_JSON"]))
    deposit_usdc(
        rpc_url="https://api.mainnet-beta.solana.com",
        payer=Keypair.from_bytes(secret),
        deposit_code="bcb1d3eaddb99251",   # from POST /v1/register
        amount_usdc=5.00,
    )
```

## Verifying the credit

Once the transaction confirms on-chain, the LiquidMirror sees a `Program data:`
log line emitted by the program and credits your token's balance. The event is
96 bytes:

```
[ 8 bytes ] discriminator = sha256("event:DepositEvent")[0..8]
[ 8 bytes ] deposit_code (raw)
[ 8 bytes ] amount (u64 LE, USDC micro-units)
[32 bytes ] USDC mint pubkey
[32 bytes ] depositor pubkey
[ 8 bytes ] timestamp (i64 LE, Unix seconds)
```

Your token balance updates within a few seconds of finalization. Confirm via:

```bash
curl -s https://api.usepod.ai/proxy/<token>/balance
```

The `usdc_balance` field is in micro-units (divide by 1,000,000 for USDC).

## Common errors

- **"deposit landed but my balance didn't update."** Check the tx on
  Solscan / Solana Explorer. If `err: null`, the on-chain side is fine — the
  most likely cause is `deposit_code` mismatch. The 16 hex chars must come
  verbatim from a real `/v1/register` response; a random 16 hex chars binds
  to no token and is silently ignored.
- **"AccountNotFound for the ops wallet ATA."** The ops wallet's USDC ATA is
  expected to already exist on-chain. If it ever doesn't, fund any tiny USDC
  transfer to it from the dashboard once to materialize it, then retry.
- **"insufficient funds for fee."** Depositor needs SOL for the fee in
  addition to the USDC for the deposit. ~0.00001 SOL covers a basic tx.
- **The transfer succeeds but you don't see logs.** You probably sent a plain
  SPL transfer instead of invoking the sovereign program. A plain transfer
  routes USDC to the destination ATA but does NOT emit `DepositEvent` — there
  is no way for the LiquidMirror to know it was meant for your token, so it
  won't be credited. You must build the `DepositUsdc` instruction as shown.

## `POD-BOND-XXXXXXXX` carve-out

If your `deposit_code` starts with `POD-BOND-`, the deposit routes to the
provider-bond ledger instead of a user balance. This is the supply-side flow
returned by `/v1/host/enroll`. **Regular users with `/v1/register` codes
should not use this prefix.** A `/v1/register` code is always 16 hex chars
with no prefix.

## SOL → USDC deposits

The dashboard supports a SOL → USDC swap-and-deposit path via Jupiter, using
the program's separate `DepositSol` instruction. The code lives in
[`app/dashboard/src/lib/contract.ts`](https://github.com/Sortis-AI/usepod/blob/main/app/dashboard/src/lib/contract.ts)
(`buildDepositSolTx`). It's a versioned transaction with Address Lookup
Tables and is meaningfully more complex than the USDC path above — most
operators with their own scripts find it easier to swap to USDC first (in
their wallet) and then run the USDC deposit shown here.
