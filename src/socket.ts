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
  let verified = false;

  let emit = socket.emit;

  let pendingEmits: any[] = [];
  let authEmit: any;

  socket.on("connected", function () {
    if (authEmit) {
      socket.emit(authEmit);
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

    if (!verified && emitTypeDict[type]) {
      if (type === "auth") {
        authEmit = args;
      } else {
        pendingEmits.push(args);
      }

      return socket;
    }

    return emit.apply(socket, args);
  };

  function sendPendingEmits(): void {
    while (pendingEmits.length) {
      socket.emit(pendingEmits.shift());
    }

    verified = true;
  }
}
