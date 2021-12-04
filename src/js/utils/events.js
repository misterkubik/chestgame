class EventEmitter {
  constructor() {
    this.pool = {};
  }

  on(name, callback, ctx = null) {
    this.ensure(name);

    this.pool[name].push({callback, once: false, ctx: ctx});
    return this;
  }

  once(name, callback, ctx) {
    this.ensure(name);

    this.pool[name].push({callback, once: true, ctx: ctx});

    return this;
  }

  off(name) {
    if (this.has(name)) {
      delete this.pool[name];
    }

    return this;
  }

  emit(name, ...params) {
    if (this.has(name)) {
      this.pool[name].forEach(({callback, once, ctx}, index) => {
        if (ctx) {
          callback.call(ctx, name, ...params)
        } else {
          callback(name, ...params);
        }

        if (once) {
          this.pool[name].splice(index, 1);
        }
      });
    }

    return this;
  }

  has(name) {
    return typeof this.pool[name] !== 'undefined';
  }

  ensure(name) {
    if (!this.has(name)) {
      this.pool[name] = [];
    }
  }
}

export const EventBus = new EventEmitter();
