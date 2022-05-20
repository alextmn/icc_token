/**
 * **************** ICC token DEMO WALLET *********************
 */

import {
  establishConnection,
  establishPayer,
  checkProgram,
  makeICCTransfer,
  reportTransfers,
} from './icc_wallet';

async function main() {
  console.log("Let's ICC token transfer to a Solana account...");

  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  // make Transfer
  await makeICCTransfer();

  // Find out how many times we have done all the token transfers
  await reportTransfers();

  console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
