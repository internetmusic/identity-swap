import { Account, PublicKey, Transaction } from "@solana/web3.js";
import nacl from "tweetnacl";
import { isDev, localPrivateKey } from "../../utils/env";
import { Wallet, WalletEvent } from "./Wallet";

/**
 * Test wallet implementation that uses a private key
 */
export class LocalWallet extends Wallet {
  private account: Account;

  constructor(network: string) {
    super(network);
    if (!isDev) throw new Error("LocalWallet can not be used in production");
    if (!localPrivateKey)
      throw new Error("No local private key in the environment");

    this.account = new Account(JSON.parse(localPrivateKey));

    // simulate connecting to an external wallet;
    setImmediate(() => this.emit(WalletEvent.CONNECT));
  }

  get pubkey(): PublicKey {
    return this.account.publicKey;
  }

  disconnect(): void {
    // Nothing to do here
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const message = transaction.serializeMessage();
    const signature = nacl.sign.detached(message, this.account.secretKey);
    transaction.addSignature(this.account.publicKey, Buffer.from(signature));
    return Promise.resolve(transaction);
  }
}
