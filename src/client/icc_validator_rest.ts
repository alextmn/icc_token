
import * as rm from 'typed-rest-client/RestClient';

const baseUrl = 'http://DESKTOP-PS9V8BE:8080';
const restc: rm.RestClient = new rm.RestClient('rest-samples', 
                                             baseUrl);
interface HttpBinData {
    code: string;
}                                             
interface HttpPostData {
    code: string;
}                                             
async function icc_validator_test() {
    console.log("icc test");
    const inData: HttpPostData = {code:""};
    const restRes: rm.IRestResponse<HttpBinData> = await restc.create<HttpBinData>('', inData);
    console.log(restRes.statusCode, restRes.result?.code);

    // const body = { a: 1 };
    // const response = await fetch('http://localhost:8080', {
    //     method: 'get',
    //     body: JSON.stringify(body),
    //     headers: { 'Content-Type': 'application/json' }
    // });
    // const data = await response.json();

    //console.log(data);
}

icc_validator_test().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);
