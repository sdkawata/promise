const PROMISE_PENDING = 0;
const PROMISE_RESOLVED = 1;
const PROMISE_REJECTED = 2;

const state = Symbol('state')
const value = Symbol('value')
const reason = Symbol('reason')
const thenQueue = Symbol('thenQueue')
const registerHandler = Symbol('registerHandler')
const handlerRegistered = Symbol('handlerRegistered')
const handleThen = Symbol('handleThen')
const resolve = Symbol('resolve')
const reject = Symbol('reject')

//[[Promise]](promise, x)
function resolvePromise(promise, x) {
  if (promise === x) {
    promise[reject].call(promise, new TypeError('trying to resolve promise with itself'));
    return;
  }
  if ((typeof x !== 'object' && typeof x !== 'function') || x === null) {
    promise[resolve].call(promise, x);
    return;
  }
  let then; 
  try {
    then = x.then;
  } catch(e) {
    promise[reject].call(promise, e);
  }
  if (typeof then !== 'function') {
    promise[resolve].call(promise, x);
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
        resolvePromise(promise, y);
      },
      (r) => {
        // rejectPromise
        if (functionCalled) {
          return;
        }
        functionCalled = true;
        promise[reject].call(promise, r);
      }
    )
  } catch(e) {
    if (!functionCalled) {
      promise[reject].call(promise, e);
    }
  }
}
class MyPromise {
  constructor(f) {
    this[state] = PROMISE_PENDING;
    this[thenQueue] = [];
    this[handlerRegistered] = false;
    this[value] = null;
    this[reason] = null;
    if (typeof f === "function") {
      f(this[resolve].bind(this), this[reject].bind(this))
    }
  }

  then(onFullfilled, onRejected) {
    let promise2 = new MyPromise();
    this[thenQueue].push({
      onFullfilled,
      onRejected,
      promise: promise2
    });
    if (this[state] !== PROMISE_PENDING) {
      this[registerHandler].call(this);
    }
    return promise2;
  }

 [registerHandler]() {
    if (this[handlerRegistered] || this[thenQueue].length === 0) {
      return;
    }
    this[handlerRegistered] = true;
    setTimeout(() => {
      this[handleThen].call(this);
    }, 0);
  }


 [handleThen]() {
    const currentQueue = this[thenQueue];
    this[thenQueue] = [];
    this[handlerRegistered] = false;
    currentQueue.forEach(({promise, onFullfilled, onRejected}) => {
      if (this[state] === PROMISE_RESOLVED) {
        if (typeof onFullfilled === 'function') {
          try {
            var x = onFullfilled.call(undefined, this[value]);
            resolvePromise(promise, x);
          } catch(e) {
            promise[reject].call(promise, e);
          }
        } else {
          promise[resolve].call(promise, this[value]);
        }
      } else if (this[state] === PROMISE_REJECTED) {
        if (typeof onRejected === 'function') {
          try {
            var x = onRejected.call(undefined, this[reason]);
            resolvePromise(promise, x);
          } catch(e) {
            promise[reject].call(promise, e);
          }
        } else {
          promise[reject].call(promise, this[reason]);
        }
      }
    })
  }

 [resolve](v) {
    if (this[state] !== PROMISE_PENDING) {
      return;
    }
    this[state] = PROMISE_RESOLVED;
    this[value] = v;
    this[registerHandler].call(this);
  }

 [reject](r) {
    if (this[state] !== PROMISE_PENDING) {
      return;
    }
    this[state] = PROMISE_REJECTED;
    this[reason] = r;
    this[registerHandler].call(this);
  }
}

module.exports = MyPromise