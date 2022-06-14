/**
 * **************** ICC token DEMO WALLET *********************
 */

import { iccKeyPair, iccSign, iccVerify } from './icc_validator_rest';
import {
  establishConnection,
  establishPayer,
  checkProgram,
  makeICCTransfer,
  reportTransfers,
} from './icc_wallet';
const sha256  = require('sha256');
import express, { Express, Request, Response } from 'express';
import cors from 'cors';

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
  console.log("E2E: ICC token transfer to a Solana account...");

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
  
  console.log("-------ICC generate key pair------");
    const [pkHash, sk] = await iccKeyPair()
  console.log("-------ICC Wallet signing------");
  const msg = Buffer.from("test msg").toString("base64");
  const [msgSigned] = await iccSign(msg, sk)
  
  console.log("-------Validator signing------");
  const validatorResponse = await iccVerify(msg, msgSigned, pkHash)

  const icc_payload = Buffer.from(JSON.stringify(validatorResponse));

  console.log(`------- ICC Tx ready, size: ${icc_payload.length} -------`);
  
  // make Transfer
  await makeICCTransfer(icc_payload);

  // Find out how many times we have done all the token transfers
  await reportTransfers();

  console.log('Success');
}

// main().then(
//   () => process.exit(),
//   err => {
//     console.error(err);
//     process.exit(-1);
//   },
// );

const app: Express = express();

const allowedOrigins = ['*'];
const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors());
app.use(express.json()); 
//console.log(__dirname + '../../icc-wallet-demo');
app.use("/icc-wallet-demo", express.static(__dirname + '/../../icc-wallet-demo'));

app.post('/keypair', async (req: Request, res: Response) => {
  const [pkHash, sk, pk] = await iccKeyPair()
  res.send(JSON.stringify({pkHash, sk, pk}));
});

app.post('/wallet-sign', async (req: Request, res: Response) => {

  const m64 = Buffer.from(req.body.msg).toString("base64");
  const [ walletSignature, iccSignature ] = await iccSign(m64, req.body.sk)
  res.send(JSON.stringify({walletSignature, iccSignature}));
});

app.post('/validator-sign', async (req: Request, res: Response) => {

  const m64 = Buffer.from(req.body.msg).toString("base64");
  const validatorResponse = await iccVerify(m64, req.body.msgSigned, req.body.pkHash)
  res.send(JSON.stringify({validatorResponse}));
});

app.post('/solana-tx', async (req: Request, res: Response) => {
  const payload = JSON.stringify(req.body);
  console.log(`solana smart contract tx: ${payload}`);
  const response = await makeICCTransfer(Buffer.from(payload));  
  console.log(response);
  res.send(response);
});


app.listen(3000, async () =>  {
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();
  console.log(`[server]: Server is running at http://localhost:3000`);

});
