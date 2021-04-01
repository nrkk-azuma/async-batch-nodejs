var newrelic = require('newrelic');
var fs = require('fs');

var records = [];
async function execute() {
  
  for(var i=0; i < 30; i++) {
    await makeRecord(i);
  }
  write();
}

function makeRecord(i) {

  return newrelic.startBackgroundTransaction('DataFlow:1st:makeRecord', ()=> new Promise((res,rev)=>{
    setTimeout(async ()=>{
      await newrelic.startSegment('DataFlow:1st:pushToUpstream', true, async ()=>{
        const transaction = newrelic.getTransaction();
        const headersObject = {}
        transaction.insertDistributedTraceHeaders(headersObject);
        console.log(headersObject);
        records.push(`${i},${base64(JSON.stringify(headersObject))}`);
        console.log(`Write Record ${i}`);
      });
      res();
    },200);
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
function write() {
  try {
    const data = records.join('\n');
    console.log(data);
    fs.writeFileSync('/tmp/nodejs_async_test.csv', data);
    console.log('Done write the file');
  }catch(e){
    console.log(e);
  }
}

execute();
