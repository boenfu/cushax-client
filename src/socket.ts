const emitTypeDict: { [key in string]: true } = {
  auth: true,
  "page:sync": true,
  "page:event": true,
};

/**
 * to fix emit before socket connected
 * @param socket
 */
export function wrapSocket(socket: SocketIOClient.Socket): void {
  let emit = socket.emit;

  let verified = false;
  let pendingEmits: [string, ...any[]][] = [];
  let authEmit: [string, ...any[]];

  socket.on("connect", function () {
    if (authEmit) {
      socket.emit(...authEmit);
    } else {
      sendPendingEmits();
    }
  });

  socket.on("auth", function (verified: boolean) {
    if (verified) {
      sendPendingEmits();
    } else {
      pendingEmits = [];
    }
  });

  // proxy emit
  socket.emit = function (...args) {
    let type = args[0];

    if (emitTypeDict[type]) {
      if (type === "auth" && !socket.connected) {
        authEmit = args;
        return socket;
      }

      if (type !== "auth" && !verified) {
        pendingEmits.push(args);
        return socket;
      }
    }

    return emit.apply(socket, args);
  };

  function sendPendingEmits(): void {
    while (pendingEmits.length) {
      socket.emit(...pendingEmits.shift()!);
    }

    verified = true;
  }
}
