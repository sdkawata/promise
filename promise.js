const PROMISE_PENDING = 0;
const PROMISE_RESOLVED = 1;
const PROMISE_REJECTED = 2;

class MyPromise {
  constructor(f) {
    this.__state = PROMISE_PENDING;
    this.__thenQueue = [];
    this.__handlerRegistered = false;
    this.__value = null;
    this.__reason = null;
    if (typeof f !== 'function') {
      throw new TypeError('executor is not function');
    }
    try {
      f(
        (v) => {this.__resolve(v)},
        (r) => {this.__reject(r)}
      )
    } catch (e) {
      this.__reject(e);
    }
  }

  then(onFullfilled, onRejected) {
    let promise2 = new MyPromise(() => {});
    this.__thenQueue.push({
      onFullfilled,
      onRejected,
      promise: promise2
    });
    if (this.__state !== PROMISE_PENDING) {
      this.__registerHandler();
    }
    return promise2;
  }
  
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  __registerHandler() {
    if (this.__handlerRegistered || this.__thenQueue.length === 0) {
      return;
    }
    this.__handlerRegistered = true;
    setTimeout(() => {
      this.__handleThen();
    }, 0);
  }

  //[[Promise]](promise, x)
  static resolvePromise(promise, x) {
    if (promise === x) {
      promise.__reject(new TypeError('trying to resolve promise with itself'));
      return;
    }
    if ((typeof x !== 'object' && typeof x !== 'function') || x === null) {
      promise.__resolve(x);
      return;
    }
    let then; 
    try {
      then = x.then;
    } catch(e) {
      promise.__reject(e);
    }
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

  __handleThen() {
    const currentQueue = this.__thenQueue;
    this.__thenQueue = [];
    this.__handlerRegistered = false;
    currentQueue.forEach(({promise, onFullfilled, onRejected}) => {
      if (this.__state === PROMISE_RESOLVED) {
        if (typeof onFullfilled === 'function') {
          try {
            var x = onFullfilled.call(undefined, this.__value);
            MyPromise.resolvePromise(promise, x);
          } catch(e) {
            promise.__reject(e);
          }
        } else {
          promise.__resolve(this.__value);
        }
      } else if (this.__state === PROMISE_REJECTED) {
        if (typeof onRejected === 'function') {
          try {
            var x = onRejected.call(undefined, this.__reason);
            MyPromise.resolvePromise(promise, x);
          } catch(e) {
            promise.__reject(e);
          }
        } else {
          promise.__reject(this.__reason);
        }
      }
    })
  }

  __resolve(value) {
    if (this.__state !== PROMISE_PENDING) {
      return;
    }
    this.__state = PROMISE_RESOLVED;
    this.__value = value;
    this.__registerHandler();
  }

  __reject(reason) {
    if (this.__state !== PROMISE_PENDING) {
      return;
    }
    this.__state = PROMISE_REJECTED;
    this.__reason = reason;
    this.__registerHandler();
  }

  static resolve(v) {
    return new MyPromise((resolve, reject) => {
      resolve(v);
    });
  }
  
  static reject(r) {
    return new MyPromise((resolve, reject) => {
      reject(r);
    });
  }

  static get [Symbol.species]() {
    return this;
  }
}


module.exports = MyPromise