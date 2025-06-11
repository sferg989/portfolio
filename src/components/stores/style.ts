import { atom } from 'nanostores';

export const style = atom<CSSStyleDeclaration>(getComputedStyle(document.body));
