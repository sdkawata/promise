var promisesAplusTests = require("promises-aplus-tests");
var MyPromise = require('./promise.js');

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
    let resolve;
    let reject;
    let promise = new MyPromise(function (rs, rj) {
      resolve = rs
      reject = rj
    });
    return {
      promise,
      resolve,
      reject,
    }
  }
}

promisesAplusTests(myAdapter, function (err) {
  console.log('test ended ', err)
});