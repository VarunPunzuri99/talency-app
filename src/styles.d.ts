// src/global.d.ts or src/styles.d.ts
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
  }

  declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
  }
  