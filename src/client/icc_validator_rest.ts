/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as rm from 'typed-rest-client/RestClient';

const baseUrl = 'http://127.0.0.1:8080';
const restc: rm.RestClient = new rm.RestClient('rest-samples', 
                                             baseUrl);
interface HttpBinData {
    code: string;
}                                             
interface HttpSignData {
    pk_hash: string;
    from_account: string,
    to_account: string,
    signature: string,
}
interface HttpKeyGenData {
    key_gen: string;
}

interface HttpKeyGenResponse {
    pk_hash: string;
    sk: string;
}

interface HttpKeySign {
    sk: string;
    message: string;
}

export async function iccKeyPair() :Promise<[string,string]> {
    const keyGen: HttpKeyGenData = { key_gen:"true" }
    const keyGenRes: rm.IRestResponse<HttpKeyGenResponse> = await restc.create<HttpKeyGenResponse>('', keyGen);
    console.log(`status: ${keyGenRes.statusCode}\npublic key:${keyGenRes.result?.pk_hash}\nprivate key:${keyGenRes.result?.sk}`);
    return [keyGenRes.result?.pk_hash || "", keyGenRes.result?.sk || ""]
}

export async function iccSign(message: string, sk: string):Promise<string> {
    const signOp: HttpKeySign = { message, sk}
    const restRes: rm.IRestResponse<HttpKeySign> = await restc.create<HttpKeySign>('', signOp);
    console.log(`status: ${restRes.statusCode}\nsignature:${restRes.result?.message}\n`);
    return restRes.result?.message || "";
}

export async function iccVerify(message: string, messageSigned: string, pk_hash: string):Promise<string> {
    const verifyOp: HttpSignData = {
        pk_hash,
        from_account: message,
        to_account: message, 
        signature: messageSigned
    };

    const restVrf: rm.IRestResponse<HttpBinData> = await restc.create<HttpBinData>('', verifyOp);
    console.log(`status: ${restVrf.statusCode}\nsignature:${restVrf.result?.code}\n`);
    return restVrf.result?.code || "";
}
                                 
async function icc_validator_test() {
    console.log("generate key pair");
    const [pkHash, sk] = await iccKeyPair()

    console.log("signing");
    const msg = Buffer.from("test msg").toString("base64");
    const msgSigned = await iccSign(msg, sk)
    
    console.log("verify");
    const isOk = await iccVerify(msg, msgSigned, pkHash)

    console.log(`icc test done, status: ${isOk}`);
}

icc_validator_test().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);
