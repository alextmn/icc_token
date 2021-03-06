/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as rm from 'typed-rest-client/RestClient';

const baseUrl = 'http://127.0.0.1:8081';
const restc: rm.RestClient = new rm.RestClient('rest-samples', 
                                             baseUrl);
interface HttpBinData {
    code: string;
}                                             
interface HttpSignData {
    sender_hash: string;
    to_account: string,
    signature: string,
    validator_signature: string,
}
interface HttpKeyGenData {
    key_gen: string;
}

interface HttpKeyGenResponse {
    sender_hash: string;
    sk: string;
    pk: string;
}

interface HttpKeySign {
    sk: string;
    message: string;
}

interface HttpKeySignResponse {
    sk: string;
    message: string;
}

export async function iccKeyPair() :Promise<[string,string, string]> {
    const keyGen: HttpKeyGenData = { key_gen:"true" }
    const keyGenRes: rm.IRestResponse<HttpKeyGenResponse> = await restc.create<HttpKeyGenResponse>('', keyGen);
    console.log(`status: ${keyGenRes.statusCode}\npublic key:${keyGenRes.result?.sender_hash}\nprivate key:${keyGenRes.result?.sk}`);
    return [keyGenRes.result?.sender_hash || "", keyGenRes.result?.sk || "", keyGenRes.result?.pk || ""]
}

export async function iccSign(message: string, sk: string):Promise<[string,string]> {
    const signOp: HttpKeySign = { message, sk}
    const restRes: rm.IRestResponse<HttpKeySign> = await restc.create<HttpKeySign>('', signOp);
    console.log(`status: ${restRes.statusCode}\nsignature:${restRes.result?.message}\n`);
    return [restRes.result?.message || "", restRes.result?.sk || ""];
}

export async function iccVerify(message: string, messageSigned: string, sender_hash: string):Promise<HttpSignData> {
    const verifyOp: HttpSignData = {
        sender_hash,
        to_account: message, 
        signature: messageSigned,
        validator_signature: '',
    };

    const restVrf: rm.IRestResponse<HttpSignData> = await restc.create<HttpSignData>('', verifyOp);
    console.log(`status: ${restVrf.statusCode}\nsignature:${JSON.stringify(restVrf.result)}\n`);
    return restVrf.result || verifyOp;
}
                                 
async function icc_validator_test() {
    console.log("-------generate key pair------");
    const [pkHash, sk] = await iccKeyPair()

    console.log("signing");
    const msg = Buffer.from("test msg").toString("base64");
    const [msgSigned] = await iccSign(msg, sk)
    
    console.log("verify");
    const validatorResponse = await iccVerify(msg, msgSigned, pkHash)

    const ba = Buffer.from(JSON.stringify(validatorResponse));

    console.log(`icc test done. Bytes will be sent to blockchain: ${ba.length}`);
}

// icc_validator_test().then(
//     () => process.exit(),
//     err => {
//         console.error(err);
//         process.exit(-1);
//     },
// );
