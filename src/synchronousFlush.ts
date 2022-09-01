let synchronousFlush = false;

export function isSynchronousFlush(): boolean {
  return synchronousFlush;
}

export function setSynchronousFlush(value: boolean): void {
  synchronousFlush = value;
}
