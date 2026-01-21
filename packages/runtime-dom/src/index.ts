export * from "@vue/reactivity";
import nodeOps from "./nodeOps";
import patchProp from "./patchProp";

function createRenderer() {
  return {
    nodeOps,
    patchProp,
  };
}
