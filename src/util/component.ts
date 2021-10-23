import { LitElement } from 'lit';

export const component = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props: Omit<HTMLElementTagNameMap[K], keyof LitElement | 'render'>,
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);
  Object.assign(element, props);
  return element;
};
