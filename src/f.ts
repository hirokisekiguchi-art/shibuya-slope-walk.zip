const gameRoot = globalThis.document.querySelector('#game-root');
if (gameRoot && globalThis.document.pointerLockElement !== gameRoot) {
  gameRoot.requestPointerLock();
}
