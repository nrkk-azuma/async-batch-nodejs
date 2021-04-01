var newrelic = require('newrelic');
var fs = require('fs');

var records = [];
async function execute() {
  const lines = read();
  for (i=0; i < lines.length; i++) {
    const line = lines[i];
    await readRecord(line);
  }
  console.log('Read Finish');
}

function readRecord(line) {
  const segments = line.split(',');
  return newrelic.startBackgroundTransaction('DataFlow:2nd:readRecord', ()=> new Promise(async (res, rev)=>{
    await newrelic.startSegment('DataFlow:2nd:readFromLine', true, async ()=> {
      const transaction = newrelic.getTransaction();
      const headersObject = JSON.parse(base64Decode(segments[1]));
      console.log(headersObject);
      transaction.acceptDistributedTraceHeaders('Other', headersObject)
      setTimeout(()=>{
        console.log(`Read Record ${segments[0]}`);
        res();
      },200);
    });
  }));
}

function base64(string) {
  const buf = Buffer.from(string);
  return buf.toString('base64');
}

function base64Decode(base64) {
  const string = Buffer.from(base64, 'base64');
  return string.toString();
}
function read() {
  try {
    const data = fs.readFileSync('/tmp/nodejs_async_test.csv').toString();
    console.log(data);
    console.log('Done read the file');
    return data.split('\n');
  }catch(e){
    console.log(e);
  }
}

execute();
