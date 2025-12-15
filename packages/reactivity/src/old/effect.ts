export let activeEffect = undefined;

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; //每次执行Id+1，如果当前同一个effect执行
}

class ReactiveEffect {
  _trackId = 0; //用于记录当前effect执行了几次
  deps = [];
  _depsLength = 0;
  public active = true; //是否开启响应
  constructor(public fn, public scheduler) {}

  run() {
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      return this.fn();
    } finally {
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

export function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.cleanUp();
  }
}

export function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect);
    }
    effect._deps.length = effect._depsLength;
  }
}
