var promisesAplusTests = require("promises-aplus-tests");

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
}

promisesAplusTests(defaultAdapter, function (err) {
  console.log('test ended ', err)
});