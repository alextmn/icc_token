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
const sha256  = require('sha256');

function toHexString(byteArray : any) {
  return Array.from(byteArray, function(byte: any) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

var appendBuffer = function(buffer1:any, buffer2:any) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
};

async function main() {
  let Dilithium2 = await getKernel('dilithium2_n3_v1');

  console.log("Generating Sender ICC keys");
  let senderKeypair = Dilithium2.genkey();
  
  console.log("Generating Reciver ICC public key and calculating SHA256");
  let recvKeypair = Dilithium2.genkey();
  const rHash = sha256(recvKeypair.pk);
  console.log("Reciver hash:" + rHash.toString('base64'));

  console.log("ICC tx payload length:" + icc_payload.length);

  console.log("Let's ICC token transfer to a Solana account...");

  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  
  //let icc_payload = [...sign, ...recvKeypair.pk, ...rHash]
  // sender, reciver, signature, validator
  // 1. reciver->sender: hash of pk
  // 2. sender -> sign tx: hash of pk, sol tx
  // 3. sender -> ICC validator: pk, hash of send pk, ICC sign (saving pk, sign)
  // 4. sender -> SOL: submit tx
  // sender sign, validator signature, sender pk, recv public key
  let icc_payload = [...rHash, ...rHash, ...rHash, ...rHash]
  
  // make Transfer
    await makeICCTransfer(icc_payload);

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
