const tmp = require('tmp');
const execSync = require('child_process').execSync;
const fs = require('fs');

let excludes = [
  'test262/test/built-ins/Promise/S25.4.3.1_A1.1_T1.js' // in node.js this !== global
];

function traverse(dir) {
  let files = fs.readdirSync(dir).map((path) => {
    const gpath = dir + '/' + path
    if (fs.statSync(gpath).isDirectory()) {
      return traverse(gpath)
    } else {
      return [gpath];
    }
  });
  return [].concat(...files);
}
let testFiles = traverse('test262/test/built-ins/Promise');

testFiles.forEach((file) => {
  console.log('== test file ' + file + ' ==');
  if (excludes.includes(file)) {
    console.log('skipped');
    return;
  }
  contents = `
let MyPromise = require('${__dirname}/promise.js');
Promise=MyPromise;
let print = (f) => console.log();`;
  contents += fs.readFileSync('./test262/harness/doneprintHandle.js');
  contents += fs.readFileSync('./test262/harness/assert.js');
  contents += fs.readFileSync('./test262/harness/sta.js');
  contents += fs.readFileSync('./test262/harness/propertyHelper.js');
  contents += fs.readFileSync(file);
  let tmpObj = tmp.fileSync();
  fs.writeFileSync(tmpObj.name, contents);
  fs.writeFileSync('last.js', contents);
  execSync('node ' + tmpObj.name).toString();
  tmpObj.removeCallback();
});
