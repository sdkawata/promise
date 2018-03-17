var promisesAplusTests = require("promises-aplus-tests");
var MyPromise = require('./promise.js');

console.log(MyPromise);
defaultAdapter = {
  deferred: () => {
    let resolve;
    let reject;
    let promise = new Promise(function(rs, rj) {
      resolve = rs;
      reject = rj;
    })
    return {
      promise: promise,
      resolve: resolve,
      reject: reject
    }
  }
};

myAdapter = {
  deferred: () => {
    let promise = new MyPromise();
    return {
      promise: promise,
      resolve: () => {
        promise.__resolve();
      },
      reject: () => {
        promise.__reject();
      }
    }
  }
}

promisesAplusTests(myAdapter, function (err) {
  console.log('test ended ', err)
});