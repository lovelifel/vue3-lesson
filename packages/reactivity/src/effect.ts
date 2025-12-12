export let activeEffect = undefined;

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
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
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }

  stop() {
    this.active = false;
  }
}

export function trackEffect(effect, dep) {
  dep.set(effect, effect._trackId);
  effect.deps[effect._depsLength++] = dep;
}
