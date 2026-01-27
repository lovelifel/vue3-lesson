// 对属性进行操作 class style event
import { patchClass } from "./modules/patchClass";
import { patchStyle } from "./modules/patchStyle";
export default function patchProp(el, key, prevValue, nextValue) {
  if (key === "class") {
    patchClass(el, nextValue);
  }
  if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  }
  if (key.startsWith("on")) {
  }
}
