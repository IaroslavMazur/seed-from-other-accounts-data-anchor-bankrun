import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction as TxIx,
} from "@solana/web3.js";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

import { SeedFromOtherAccountsDataAnchorBankrun } from "../target/types/seed_from_other_accounts_data_anchor_bankrun";

describe("seed-from-other-accounts-data-anchor-bankrun", () => {
  let context: ProgramTestContext;
  let client: BanksClient;
  let senderKeys: Keypair;
  let provider: BankrunProvider;

  const program = anchor.workspace
    .SeedFromOtherAccountsDataAnchorBankrun as Program<SeedFromOtherAccountsDataAnchorBankrun>;

  before(async () => {
    // Configure the testing environment
    context = await startAnchor("", [], []);
    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    client = context.banksClient;

    senderKeys = provider.wallet.payer;

    let initializeIx = await program.methods
      .initialize()
      .accounts({
        signer: senderKeys.publicKey,
      })
      .instruction();

    // Build, sign and process the transaction
    await buildSignAndProcessTxFromIx(initializeIx, senderKeys);
  });

  it("Initializes a PDA seeded with the data from the `some_data` account", async () => {
    const customPDA = getPDAAddress(
      [Buffer.from(new anchor.BN(42).toArray("le", 8))],
      program.programId
    );

    let createStreamIx = await program.methods
      .createPdaWithSpecificSeed()

      // Uncomment the .accountsPartial() statement below (and comment the `.accounts` one) to see the PDA account address being resolved correctly
      //
      // the "Custom PDA" address must be specified explicitly via .accountsPartial() when using the Bankrun provider
      //
      // .accountsPartial({
      //   signer: senderKeys.publicKey,
      //   customPda: customPDA,
      // })
      .accounts({
        signer: senderKeys.publicKey,
      })
      .instruction();

    // Build, sign and process the transaction
    await buildSignAndProcessTxFromIx(createStreamIx, senderKeys);
  });

  // HELPER FUNCTIONS

  function getPDAAddress(
    seeds: Array<Buffer | Uint8Array>,
    programId: PublicKey
  ): PublicKey {
    return anchor.web3.PublicKey.findProgramAddressSync(seeds, programId)[0];
  }

  async function buildSignAndProcessTxFromIx(ix: TxIx, signerKeys: Keypair) {
    const tx = await initializeTxWithIx(ix);
    tx.sign(signerKeys);
    await client.processTransaction(tx);
  }

  async function initializeTxWithIx(ix: TxIx): Promise<Transaction> {
    const res = await client.getLatestBlockhash();
    if (!res) throw new Error("Couldn't get the latest blockhash");

    let tx = new Transaction();
    tx.recentBlockhash = res[0];

    tx.add(ix);
    return tx;
  }
});

//
//
//
//
// ------------------------------------------------------------------------------------------------
// The following code is testing the same thing as the one above, but is using the default Anchor provider (which resolves the PDA address correctly)

// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";

// import { SeedFromOtherAccountsDataAnchorBankrun } from "../target/types/seed_from_other_accounts_data_anchor_bankrun";

// describe("seed-from-other-accounts-data-anchor-bankrun", () => {
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace
//     .seed_from_other_accounts_data_anchor_bankrun as Program<SeedFromOtherAccountsDataAnchorBankrun>;

//   it("Is initialized!", async () => {
//     await program.methods.initialize().rpc();
//     await program.methods.createPdaWithSpecificSeed().rpc();
//   });
// });
