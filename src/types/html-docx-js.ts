declare module 'html-docx-js/dist/html-docx' {
  export function asBlob(html: string): Blob;
  export function asBinaryString(html: string): string;
  export function asArrayBuffer(html: string): ArrayBuffer;
}
