/**
 * Mint a token to an address
 *
 * Usage:
 *
 * Create a new account in the current wallet
 *  yarn script scripts/mint.ts -t CVC
 *
 * Mints to an existing token account
 *    yarn script scripts/mint.ts -t CVC -r <address>
 *
 * Mints to a new token account owned by a different wallet
 *    yarn script scripts/mint.ts -t CVC -r <wallet address> --new
 */

import dotenv from "dotenv";
dotenv.config({ path: "./.env.local", debug: true });

import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import { APIFactory as PoolAPIFactory } from "../src/api/pool/index";
import { APIFactory as TokenAPIFactory } from "../src/api/token/index";
import { ExtendedCluster } from "../src/utils/types";
import { getConnection } from "../src/api/connection";
import * as WalletAPI from "../src/api/wallet";
import { WalletType } from "../src/api/wallet";
import { airdropTo } from "../test/utils/account";

const cluster = (process.env.CLUSTER || "testnet") as ExtendedCluster;

program
  .requiredOption(
    "-a, --accountA <address>",
    "The address of an account containing token A"
  )
  .requiredOption(
    "-b, --accountB <address>",
    "The address of an account containing token B"
  )
  .option<number>(
    "--amountA <number>",
    "The amount of token A to deposit",
    (val) => parseInt(val, 10)
  )
  .option<number>(
    "--amountB <number>",
    "The amount of token B to deposit",
    (val) => parseInt(val, 10)
  )
  .option(
    "--skip-airdrop",
    "if true, do not airdrop SOL to the wallet first",
    false
  );

program.parse(process.argv);

(async () => {
  const wallet = await WalletAPI.connect(cluster, WalletType.LOCAL);

  if (!program.skipAirdrop) {
    console.log("Airdropping to the wallet");
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(cluster), wallet.pubkey);
    await airdropTo(getConnection(cluster), wallet.pubkey);
    await airdropTo(getConnection(cluster), wallet.pubkey);
  }

  const poolAPI = PoolAPIFactory(cluster);
  const tokenAPI = TokenAPIFactory(cluster);

  const donorAccountA = await tokenAPI.tokenAccountInfo(
    new PublicKey(program.accountA)
  );

  const donorAccountB = await tokenAPI.tokenAccountInfo(
    new PublicKey(program.accountB)
  );

  if (!donorAccountA || !donorAccountB)
    throw new Error("Donor account(s) not found");

  const tokenAAmount = program.amountA || donorAccountA?.balance;
  const tokenBAmount = program.amountB || donorAccountB?.balance;

  const pool = await poolAPI.createPool({
    donorAccountA,
    donorAccountB,
    feeDenominator: 4,
    feeNumerator: 1,
    tokenAAmount,
    tokenBAmount,
    wallet,
  });

  console.log("Pool");
  console.log(pool.toString());
})().catch((error) => console.error(error));