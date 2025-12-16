export let activeEffect = undefined;

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

class ReactiveEffect {
  deps = [];
  _depsLength = 0;
  _trackId = 0;
  active = true;
  _running = 0;
  constructor(public fn, public scheduler?) {}
  run() {
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  stop() {
    this.active = false;
  }
}

export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
  }
  const oldDep = effect.deps[effect._depsLength];
  if (oldDep != dep) {
    if (oldDep) {
      cleanDepEffect(oldDep, effect);
    }
    effect.deps[effect._depsLength++] = dep;
  } else {
    effect._depsLength++;
  }
}

export function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++;
}

export function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect);
    }
    effect.deps.length = effect._depsLength;
  }
}

export function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.cleanUp();
  }
}
