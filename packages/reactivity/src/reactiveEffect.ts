import { activeEffect } from "./effect";
const targetMap = new WeakMap();
export function track(target, key) {
  console.log(target, key);
  if (activeEffect) {
  }
}
