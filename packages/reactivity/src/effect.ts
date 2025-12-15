export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}

class ReactiveEffect {
  active = true;
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      this.fn();
    } catch (error) {
      console.error(error);
    }
  }
}
