/*
Net
  online lobby with a 4 digit code and multiplayer over WebRTC (PeerJS)
  the host collects the inputs of all players and sends them as numbered frames to everybody,
  every browser then runs the same game with the same inputs (lockstep)
  Autor: Korel Öztekin
*/

const PEER_PREFIX = "koreleth-arcade-bomberman2-";
const MAX_PLAYERS = 4;

//ICE: servers that help two browsers to find a direct connection
//  STUN tells a browser its public address, that is enough for most home networks (laptop <-> laptop)
//  TURN relays the data when no direct connection is possible: phones on mobile data, strict networks
//  -> free account at https://www.expressturn.com, then put its server, username and password here
//     (the public TURN servers built into PeerJS do not work anymore)
const TURN_SERVER = {
  urls: "",          //e.g. "turn:relay1.expressturn.com:3478"
  username: "",
  credential: ""
};
const ICE_SERVERS = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }
].concat(TURN_SERVER.urls ? [TURN_SERVER] : []);

function peerOptions() {
  return { config: { iceServers: ICE_SERVERS } };
}

let peer = null;
let hostConn = null;      //client: connection to the host
let slots = [];           //host: one entry per player {conn, connected}, index = player number
let pendingEvents = [];   //host: inputs for the next frame
let frameQueue = [];      //client: frames from the host that are not simulated yet
let lobbyCode = "";
let lobbyCount = 0;
let joinTimeout = null;


//UI: buttons of the HTML panels
function initPanels() {
  const codeInput = document.getElementById("join-code");

  document.getElementById("btn-local").addEventListener("click", () => {
    netMode = "local";
    myIndex = 0;
    startMatch(2);
  });
  document.getElementById("btn-create").addEventListener("click", () => createLobby());
  document.getElementById("btn-join").addEventListener("click", () => joinLobby(codeInput.value.trim()));
  codeInput.addEventListener("input", () => {
    codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 4);
  });
  codeInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      joinLobby(codeInput.value.trim());
    }
  });
  document.getElementById("btn-back").addEventListener("click", () => {
    setStatus("mode-status", "");
    showScreen(0);
  });
  document.getElementById("btn-start").addEventListener("click", startOnlineMatch);
  document.getElementById("btn-leave").addEventListener("click", () => leaveOnline(""));
  document.getElementById("lobby-code").addEventListener("click", () => {
    navigator.clipboard?.writeText(lobbyCode).then(() => setStatus("lobby-status", "CODE COPIED"), () => {});
  });
  document.getElementById("btn-invite").addEventListener("click", () => {
    navigator.clipboard?.writeText(inviteLink(lobbyCode)).then(
      () => setStatus("lobby-status", "LINK COPIED - SEND IT TO YOUR FRIENDS"),
      () => setStatus("lobby-status", inviteLink(lobbyCode))
    );
  });

  //CLOSE: tell the others right away instead of letting the connection time out
  window.addEventListener("beforeunload", () => {
    if (peer) {
      peer.destroy();
    }
  });
}

function setStatus(id, message) {
  document.getElementById(id).textContent = message;
}

//INVITE: link that opens the game and joins the lobby directly (?join=1234)
function inviteLink(code) {
  return location.origin + location.pathname + "?join=" + code;
}

function inviteCode() {
  const code = new URLSearchParams(location.search).get("join");
  return /^\d{4}$/.test(code || "") ? code : null;
}

//JOIN: from an invite link, right after "CLICK TO START"
function joinFromInvite() {
  const code = inviteCode();
  if (code) {
    showScreen(5);
    document.getElementById("join-code").value = code;
    joinLobby(code);
  }
}


//RESET: close every connection
function resetNet() {
  clearTimeout(joinTimeout);
  if (peer) {
    peer.destroy();
  }
  peer = null;
  hostConn = null;
  slots = [];
  pendingEvents = [];
  frameQueue = [];
  lobbyCode = "";
  lobbyCount = 0;
}

function leaveOnline(message) {
  resetNet();
  netMode = "local";
  myIndex = 0;
  ambient.stop();
  soundMuted = false;
  showScreen(5);
  setStatus("mode-status", message);
}

function connectionError(err) {
  const messages = {
    "browser-incompatible": "THIS BROWSER DOES NOT SUPPORT ONLINE GAMES",
    "network": "NO CONNECTION TO THE LOBBY SERVER",
    "server-error": "LOBBY SERVER NOT REACHABLE",
    "socket-error": "LOBBY SERVER NOT REACHABLE",
    "socket-closed": "LOBBY SERVER NOT REACHABLE",
    "webrtc": "CONNECTION FAILED"
  };
  return messages[err.type] || "CONNECTION ERROR";
}


//______________________________ HOST ______________________________

function createLobby(attempt = 0) {
  resetNet();
  setStatus("mode-status", "CREATING LOBBY...");
  const code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  peer = new Peer(PEER_PREFIX + code, peerOptions());

  peer.on("open", () => {
    netMode = "host";
    myIndex = 0;
    lobbyCode = code;
    slots = [{ conn: null, connected: true }];
    setStatus("mode-status", "");
    showScreen(6);
    updateLobby();
  });
  peer.on("connection", onClientConnection);
  //LOST: the lobby server (not the players), needed only for new players joining
  peer.on("disconnected", () => {
    if (peer && !peer.destroyed) {
      peer.reconnect();
    }
  });
  peer.on("error", (err) => {
    //CODE TAKEN: try another one
    if (err.type == "unavailable-id" && attempt < 5) {
      createLobby(attempt + 1);
    } else if (netMode != "host") {
      leaveOnline(connectionError(err));
    }
  });
}

function onClientConnection(conn) {
  conn.on("open", () => {
    if (gamemode == 2) {
      rejectClient(conn, "GAME ALREADY RUNNING, TRY AGAIN LATER");
      return;
    }
    slots = slots.filter((slot) => slot.connected);
    if (slots.length >= MAX_PLAYERS) {
      rejectClient(conn, "LOBBY IS FULL");
      return;
    }
    slots.push({ conn: conn, connected: true });
    updateLobby();
  });

  conn.on("data", (msg) => {
    const index = slots.findIndex((slot) => slot.conn === conn);
    if (index > 0 && msg.type == "input" && gamemode == 2) {
      pendingEvents.push([index, msg.e[0], msg.e[1]]);
    }
  });

  conn.on("close", () => onClientLeft(conn));
  conn.on("error", () => onClientLeft(conn));
}

function rejectClient(conn, message) {
  conn.send({ type: "error", msg: message });
  setTimeout(() => conn.close(), 500);
}

function onClientLeft(conn) {
  const index = slots.findIndex((slot) => slot.conn === conn && slot.connected);
  if (index < 0) {
    return;
  }
  if (gamemode == 2) {
    //IN GAME: the character is out, the slot stays until the round is over
    slots[index].connected = false;
    pendingEvents.push([index, 3, 0]);
  } else {
    slots.splice(index, 1);
  }
  updateLobby();
}

//SEND: player numbers to everybody, remove players that left during the last round
function updateLobby() {
  if (gamemode != 2) {
    slots = slots.filter((slot) => slot.connected);
  }
  slots.forEach((slot, i) => {
    if (slot.conn && slot.connected) {
      slot.conn.send({ type: "lobby", count: slots.length, you: i, code: lobbyCode });
    }
  });
  lobbyCount = slots.length;
  renderLobby();
}

function startOnlineMatch() {
  slots = slots.filter((slot) => slot.connected);
  if (netMode != "host" || slots.length < 2) {
    return;
  }
  const seed = Math.floor(Math.random() * 2147483647);
  slots.forEach((slot, i) => {
    if (slot.conn) {
      slot.conn.send({ type: "start", seed: seed, count: slots.length, you: i });
    }
  });
  pendingEvents = [];
  startMatch(slots.length, seed);
}

function sendFrames(frames) {
  for (const slot of slots) {
    if (slot.conn && slot.connected && slot.conn.open) {
      slot.conn.send({ type: "frames", f: frames });
    }
  }
}


//______________________________ CLIENT ______________________________

function joinLobby(code) {
  if (!/^\d{4}$/.test(code)) {
    setStatus("mode-status", "ENTER THE 4 DIGIT CODE");
    return;
  }
  resetNet();
  setStatus("mode-status", "CONNECTING...");
  peer = new Peer(peerOptions());
  joinTimeout = setTimeout(() => leaveOnline(noConnectionMessage(code)), 15000);

  peer.on("open", () => {
    hostConn = peer.connect(PEER_PREFIX + code, { reliable: true, serialization: "json" });
    hostConn.on("open", () => {
      clearTimeout(joinTimeout);
      netMode = "client";
      lobbyCode = code;
      setStatus("mode-status", "");
    });
    hostConn.on("data", onHostMessage);
    //NO DIRECT CONNECTION: the lobby exists, but the two browsers can not reach each other
    hostConn.on("iceStateChanged", (state) => {
      if (state == "failed" && netMode != "client") {
        leaveOnline(noConnectionMessage(code));
      }
    });
    hostConn.on("close", () => {
      if (netMode == "client") {
        leaveOnline("THE HOST HAS LEFT");
      }
    });
  });
  peer.on("error", (err) => {
    if (err.type == "peer-unavailable") {
      leaveOnline("LOBBY " + code + " NOT FOUND");
    } else {
      leaveOnline(connectionError(err));
    }
  });
}

//MESSAGE: why joining failed (without a TURN server phones on mobile data can not connect)
function noConnectionMessage(code) {
  if (TURN_SERVER.urls) {
    return "COULD NOT CONNECT TO LOBBY " + code;
  }
  return "NO DIRECT CONNECTION TO LOBBY " + code + " - USE WIFI INSTEAD OF MOBILE DATA";
}

function onHostMessage(msg) {
  if (msg.type == "lobby") {
    myIndex = msg.you;
    lobbyCount = msg.count;
    //stay on the end screen until the player presses a key
    if (gamemode != 2 && gamemode != 3) {
      showScreen(6);
    }
    renderLobby();
  } else if (msg.type == "start") {
    myIndex = msg.you;
    frameQueue = [];
    startMatch(msg.count, msg.seed);
  } else if (msg.type == "frames") {
    if (gamemode == 2) {
      frameQueue.push(...msg.f);
    }
  } else if (msg.type == "error") {
    leaveOnline(msg.msg);
  }
}

function sendInput(type, direction) {
  if (hostConn && hostConn.open) {
    hostConn.send({ type: "input", e: [type, direction] });
  }
}

//STEP: simulate the frames from the host at 60 per second, catch up if they pile up
function clientFrames() {
  while (accumulator >= STEP - 1 && frameQueue.length > 0 && gamemode == 2) {
    accumulator -= STEP;
    runHostFrame(frameQueue.shift());
  }
  if (frameQueue.length > 4) {
    soundMuted = true;
    while (frameQueue.length > 2 && gamemode == 2) {
      runHostFrame(frameQueue.shift());
    }
    soundMuted = false;
  }
  //WAITING: for the host, don't save up time for later
  if (frameQueue.length == 0) {
    accumulator = Math.min(accumulator, STEP);
  }
}

function runHostFrame([number, events]) {
  if (number != frame + 1) {
    console.warn("Frame out of sync", number, frame + 1);
  }
  runFrame(events);
}


//______________________________ LOBBY ______________________________

function backToLobby() {
  showScreen(6);
  if (netMode == "host") {
    updateLobby();
  } else {
    renderLobby();
  }
}

function renderLobby() {
  document.getElementById("lobby-code").textContent = lobbyCode;
  const list = document.getElementById("lobby-slots");
  list.innerHTML = "";
  for (let i = 0; i < MAX_PLAYERS; i++) {
    const item = document.createElement("li");
    const picture = document.createElement("span");
    picture.className = "slot-pic";
    picture.style.backgroundImage = "url(sprites/bomber" + (i + 1) + ".png)";
    const label = document.createElement("span");
    if (i < lobbyCount) {
      label.textContent = "PLAYER " + (i + 1) + (i == 0 ? " - HOST" : "") + (i == myIndex ? " (YOU)" : "");
      item.classList.toggle("me", i == myIndex);
    } else {
      label.textContent = "FREE";
      item.classList.add("free");
    }
    item.append(picture, label);
    list.append(item);
  }

  const startButton = document.getElementById("btn-start");
  startButton.hidden = netMode != "host";
  startButton.disabled = lobbyCount < 2;
  if (netMode == "host") {
    setStatus("lobby-status", lobbyCount < 2 ? "SEND THE CODE TO YOUR FRIENDS" : "READY TO START");
  } else {
    setStatus("lobby-status", "WAITING FOR THE HOST TO START...");
  }
}
