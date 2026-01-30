import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";
import { createRenderer } from "@vue/runtime-core";

export const renderOptions = Object.assign({ patchProp }, nodeOps);

// render方法采用domapi渲染
export const render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export * from "@vue/runtime-core";
