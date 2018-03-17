const PROMISE_PENDING = 0;
const PROMISE_RESOLVED = 1;
const PROMISE_REJECTED = 2;

let MyPromise = function() {
  this.__state = PROMISE_PENDING;
  this.__thenQueue = [];
  this.__handlerRegistered = false;
  this.__value = null;
  this.__reason = null;
}

MyPromise.prototype.then = function then(onFullfilled, onRejected) {
  let promise2 = new MyPromise();
  this.__thenQueue.push({
    onFullfilled: onFullfilled,
    onRejected: onRejected,
    promise: promise2
  });
  if (this.__state !== PROMISE_PENDING) {
    this.__registerHandler();
  }
  return promise2;
}
MyPromise.prototype.__registerHandler = function() {
  if (this.__handlerRegistered) {
    return;
  }
  this.__handlerRegistered = true;
  setTimeout(() => {
    this.__handleThen();
  }, 0);
}
MyPromise.prototype.__handleThen = function() {
  this.__thenQueue.forEach((thenItem) => {
    if (this.__state === PROMISE_RESOLVED) {
      if (typeof thenItem.onFullfilled === 'function') {
        try {
          var x = thenItem.onFullfilled(this.__value);
          thenItem.promise.__resolve(x);
        } catch(e) {
          thenItem.promise.__reject(e);
        }
      } else {
        thenItem.promise.__resolve(this.__value);
      }
    } else if (this.__state === PROMISE_REJECTED) {
      if (typeof thenItem.onRejected === 'function') {
        try {
          thenItem.onRejected(this.__reason);
          thenItem.promise.__resolve(x);
        } catch(e) {
          thenItem.promise.__reject(e);
        }
      } else {
        thenItem.promise.__reject(this.__reason);
      }
    }
  })
  this.__thenQueue = []
  this.__handlerRegistered = false;
}
MyPromise.prototype.__resolve = function(value) {
  if (this.__state !== PROMISE_PENDING) {
    return;
  }
  this.__state = PROMISE_RESOLVED;
  this.__value = value;
  this.__registerHandler();
}
MyPromise.prototype.__reject = function(reason) {
  if (this.__state !== PROMISE_PENDING) {
    return;
  }
  this.__state = PROMISE_REJECTED;
  this.__reason = reason;
  this.__registerHandler();
}

module.exports = MyPromise