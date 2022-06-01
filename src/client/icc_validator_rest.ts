/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as rm from 'typed-rest-client/RestClient';
const { getKernel } = require('dilithium-sign');

const baseUrl = 'http://DESKTOP-PS9V8BE:8080';
const restc: rm.RestClient = new rm.RestClient('rest-samples', 
                                             baseUrl);
interface HttpBinData {
    code: string;
}                                             
interface HttpSignData {
    pub_key: string;
    from_account: string,
    to_account: string,
    signature: string,
}
interface HttpKeyGenData {
    key_gen: string;
}

interface HttpKeyGenResponse {
    pk: string;
    sk: string;
}

interface HttpKeySign {
    sk: string;
    message: string;
}

                                 
async function icc_validator_test() {
    console.log("icc test");
    // const Dilithium2 = await getKernel('dilithium2_n3_v1');

    // console.log("Generating Sender ICC keys");
    // const recvKeypair = Dilithium2.genkey();
    // const sign = Buffer.from(Dilithium2.sign("", recvKeypair.sk)).toString('base64');
    // const pk = Buffer.from(recvKeypair.pk).toString('base64');

    
    
    const keyGen: HttpKeyGenData = { key_gen:"true" }
    const keyGenRes: rm.IRestResponse<HttpKeyGenResponse> = await restc.create<HttpKeyGenResponse>('', keyGen);
    console.log(`status: ${keyGenRes.statusCode}\npublic key:${keyGenRes.result?.pk}\nprivate key:${keyGenRes.result?.sk}`);

    const msg = Buffer.from("test msg").toString('base64');
    const signOp: HttpKeySign = { message:msg, sk: keyGenRes.result?.sk || ""}
    const restRes: rm.IRestResponse<HttpKeySign> = await restc.create<HttpKeySign>('', signOp);
    console.log(`status: ${restRes.statusCode}\nsignature:${restRes.result?.message}\n`);

    const verifyOp: HttpSignData = {
        pub_key: keyGenRes.result?.pk || "",
        from_account: msg,
        to_account: msg, 
        signature: restRes.result?.message || ""
    };
    const restVrf: rm.IRestResponse<HttpBinData> = await restc.create<HttpBinData>('', verifyOp);
    console.log(`status: ${restVrf.statusCode}\nsignature:${restVrf.result?.code}\n`);
}

icc_validator_test().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);
