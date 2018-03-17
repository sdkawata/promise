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
  if (this.__handlerRegistered || this.__thenQueue.length === 0) {
    return;
  }
  this.__handlerRegistered = true;
  setTimeout(() => {
    this.__handleThen();
  }, 0);
}
//[[Promise]](promise, x)
MyPromise.resolvePromise = function(promise, x) {
  if (promise === x) {
    promise.__reject(new TypeError('trying to resolve promise with itself'));
    return;
  }
  if (typeof x !== 'object' && typeof x !== 'function') {
    promise.__resolve(x);
    return;
  }
  let then = x.then;
  if (typeof then !== 'function') {
    promise.__resolve(x);
    return;
  }
  var functionCalled = false;
  try {
    then.call(
      x,
      (y) => {
        // resolvePromise
        if (functionCalled) {
          return;
        }
        functionCalled = true;
        MyPromise.resolvePromise(promise, y);
      },
      (r) => {
        // rejectPromise
        if (functionCalled) {
          return;
        }
        functionCalled = true;
        promise.__reject(r);
      }
    )
  } catch(e) {
    if (!functionCalled) {
      promise.__reject(e);
    }
  }
}
MyPromise.prototype.__handleThen = function() {
  const currentQueue = this.__thenQueue;
  this.__thenQueue = [];
  this.__handlerRegistered = false;
  currentQueue.forEach((thenItem) => {
    if (this.__state === PROMISE_RESOLVED) {
      if (typeof thenItem.onFullfilled === 'function') {
        try {
          var x = thenItem.onFullfilled.call(undefined, this.__value);
          MyPromise.resolvePromise(thenItem.promise, x);
        } catch(e) {
          thenItem.promise.__reject(e);
        }
      } else {
        thenItem.promise.__resolve(this.__value);
      }
    } else if (this.__state === PROMISE_REJECTED) {
      if (typeof thenItem.onRejected === 'function') {
        try {
          var x = thenItem.onRejected.call(undefined, this.__reason);
          MyPromise.resolvePromise(thenItem.promise, x);
        } catch(e) {
          thenItem.promise.__reject(e);
        }
      } else {
        thenItem.promise.__reject(this.__reason);
      }
    }
  })
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