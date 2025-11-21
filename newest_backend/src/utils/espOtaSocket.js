// const WebSocket = require("ws");
// const fs = require("fs");
// const path = require("path");
// const deviceModel = require("../models/deviceModel");

// const connectedDevices = new Map();
// const dashboardClients = new Set();

// let FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");

// function initEspOtaSocket(server) {
//     const wss = new WebSocket.Server({ noServer: true });
//     console.log("ESP32 OTA WebSocket Server initialized");

//     wss.on("connection", (ws, req) => {
//         const isDashboard = req.url.includes("admin=true");

//         if (isDashboard) {
//             dashboardClients.add(ws);
//             console.log("Admin dashboard connected");

//             ws.send(JSON.stringify({
//                 type: "device_list",
//                 devices: Array.from(connectedDevices.entries()).map(([id, d]) => ({
//                     deviceId: id,
//                     ip: d.ip,
//                     status: d.status,
//                     connectedAt: d.connectedAt,
//                 })),
//             }));

//             ws.on("close", () => dashboardClients.delete(ws));
//             return;
//         }

//         // DEVICE CONNECTION
//         let deviceId = null;
//         const deviceIP = req.socket.remoteAddress;
//         console.log(`New ESP32 connection from ${deviceIP}`);

//         ws.on("message", async (message) => {
//             try {
//                 const data = JSON.parse(message.toString());

//                 // DEVICE REGISTRATION -------------------------
//                 if (data.type === "register") {
//                     deviceId = data.deviceId;
//                     connectedDevices.set(deviceId, {
//                         ws,
//                         ip: deviceIP,
//                         connectedAt: new Date(),
//                         status: "connected",
//                     });

//                     console.log(`Device registered: ${deviceId}`);

//                     broadcastToDashboards({
//                         type: "device_connected",
//                         deviceId,
//                         ip: deviceIP,
//                         time: new Date(),
//                     });

//                     ws.send(JSON.stringify({ type: "registered", status: "success" }));
//                 }

//                 // OTA REQUEST ---------------------------------
//                 else if (data.type === "ota_request") {
//                     console.log(`OTA request from ${deviceId}`);
//                     sendOTAUpdate(ws, deviceId);
//                 }

//                 // OTA PROGRESS --------------------------------
//                 else if (data.type === "ota_progress") {
//                     console.log(`OTA progress ${deviceId}: ${data.progress}%`);

//                     broadcastToDashboards({
//                         type: "ota_progress",
//                         deviceId,
//                         progress: data.progress,
//                     });
//                 }

//                 // OTA COMPLETED SUCCESSFULLY -------------------
//                 else if (data.type === "ota_complete") {
//                     console.log(`OTA complete for ${deviceId}`);

//                     // UPDATE VERSION IN DB
//                     if (connectedDevices.has(deviceId) && connectedDevices.get(deviceId).currentVersionId) {
//                         const newVersion = connectedDevices.get(deviceId).currentVersionId;

//                         await deviceModel.findOneAndUpdate(
//                             { deviceId },
//                             { versionId: newVersion },
//                             { new: true }
//                         );

//                         console.log(`Updated versionId for ${deviceId} → ${newVersion}`);
//                     }

//                     broadcastToDashboards({
//                         type: "ota_result",
//                         deviceId,
//                         status: "pass",
//                     });

//                     ws.send(JSON.stringify({ type: "ota_ack", status: "success" }));
//                 }

//                 // OTA ERROR -----------------------------------
//                 else if (data.type === "ota_error") {
//                     console.error(`OTA error for ${deviceId}: ${data.message}`);

//                     // DO NOT update version in DB

//                     broadcastToDashboards({
//                         type: "ota_result",
//                         deviceId,
//                         status: "fail",
//                         message: data.message,
//                     });
//                 }

//                 // HEARTBEAT -----------------------------------
//                 else if (data.type === "heartbeat") {
//                     if (deviceId && connectedDevices.has(deviceId)) {
//                         connectedDevices.get(deviceId).lastHeartbeat = new Date();
//                     }
//                     ws.send(JSON.stringify({ type: "heartbeat_ack" }));
//                 }

//             } catch (err) {
//                 console.error("Message error:", err);
//             }
//         });

//         ws.on("close", () => {
//             if (deviceId) {
//                 console.log(`Device disconnected: ${deviceId}`);
//                 connectedDevices.delete(deviceId);
//                 broadcastToDashboards({ type: "device_disconnected", deviceId });
//             }
//         });

//         ws.on("error", (err) => {
//             console.error("WebSocket error:", err);
//             if (deviceId) connectedDevices.delete(deviceId);
//         });
//     });

//     return wss;
// }

// // BROADCAST -----------------------------------------
// function broadcastToDashboards(payload) {
//     const data = JSON.stringify(payload);
//     for (const ws of dashboardClients) {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(data);
//         }
//     }
// }

// // SEND OTA UPDATE ------------------------------------
// function sendOTAUpdate(ws, deviceId, customFirmwarePath) {
//     const firmwarePath = customFirmwarePath || FIRMWARE_PATH;

//     if (!fs.existsSync(firmwarePath)) {
//         ws.send(JSON.stringify({
//             type: "ota_error",
//             message: `Firmware file not found: ${firmwarePath}`,
//         }));
//         return;
//     }

//     const firmwareBuffer = fs.readFileSync(firmwarePath);
//     const firmwareSize = firmwareBuffer.length;

//     ws.send(JSON.stringify({
//         type: "ota_start",
//         size: firmwareSize,
//         chunks: Math.ceil(firmwareSize / 2048),
//     }));

//     const chunkSize = 2048;
//     let offset = 0;

//     const sendChunk = () => {
//         if (offset < firmwareSize) {
//             const chunk = firmwareBuffer.slice(offset, offset + chunkSize);
//             const chunkData = {
//                 type: "ota_chunk",
//                 offset,
//                 data: chunk.toString("base64"),
//                 totalSize: firmwareSize,
//             };

//             if (ws.readyState === WebSocket.OPEN) {
//                 ws.send(JSON.stringify(chunkData));
//                 offset += chunkSize;
//                 setTimeout(sendChunk, 50);
//             }
//         } else {
//             ws.send(JSON.stringify({ type: "ota_end", status: "complete" }));
//         }
//     };

//     setTimeout(sendChunk, 100);
// }

// module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };





// const WebSocket = require("ws");
// const fs = require("fs");
// const path = require("path");
// const deviceModel = require("../models/deviceModel");

// const connectedDevices = new Map();
// const dashboardClients = new Set();

// let FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");

// function initEspOtaSocket(server) {
//     const wss = new WebSocket.Server({ noServer: true });
//     console.log("ESP32 OTA WebSocket Server initialized");

//     wss.on("connection", (ws, req) => {
//         const isDashboard = req.url.includes("admin=true");

//         if (isDashboard) {
//             dashboardClients.add(ws);
//             console.log("Admin dashboard connected");

//             ws.send(JSON.stringify({
//                 type: "device_list",
//                 devices: Array.from(connectedDevices.entries()).map(([id, d]) => ({
//                     deviceId: id,
//                     ip: d.ip,
//                     status: d.status,
//                     connectedAt: d.connectedAt,
//                 })),
//             }));

//             ws.on("close", () => dashboardClients.delete(ws));
//             return;
//         }

//         // DEVICE CONNECTION
//         let deviceId = null;
//         const deviceIP = req.socket.remoteAddress;
//         console.log(`New ESP32 connection from ${deviceIP}`);

//         ws.on("message", async (message) => {
//             try {
//                 const data = JSON.parse(message.toString());

//                 // DEVICE REGISTRATION -------------------------
//                 if (data.type === "register") {
//                     deviceId = data.deviceId;
//                     connectedDevices.set(deviceId, {
//                         ws,
//                         ip: deviceIP,
//                         connectedAt: new Date(),
//                         status: "connected",
//                     });

//                     console.log(`Device registered: ${deviceId}`);

//                     broadcastToDashboards({
//                         type: "device_connected",
//                         deviceId,
//                         ip: deviceIP,
//                         time: new Date(),
//                     });

//                     ws.send(JSON.stringify({ type: "registered", status: "success" }));
//                 }

//                 // OTA REQUEST ---------------------------------
//                 else if (data.type === "ota_request") {
//                     console.log(`OTA request from ${deviceId}`);
//                     sendOTAUpdate(ws, deviceId);
//                 }

//                 // OTA PROGRESS --------------------------------
//                 else if (data.type === "ota_progress") {
//                     console.log(`OTA progress ${deviceId}: ${data.progress}%`);

//                     broadcastToDashboards({
//                         type: "ota_progress",
//                         deviceId,
//                         progress: data.progress,
//                     });
//                 }

//                 // OTA COMPLETED SUCCESSFULLY -------------------
//                 else if (data.type === "ota_complete") {
//                     console.log(`OTA complete for ${deviceId}`);

//                     // UPDATE VERSION IN DB
//                     if (connectedDevices.has(deviceId) && connectedDevices.get(deviceId).currentVersionId) {
//                         const newVersion = connectedDevices.get(deviceId).currentVersionId;

//                         await deviceModel.findOneAndUpdate(
//                             { deviceId },
//                             { versionId: newVersion },
//                             { new: true }
//                         );

//                         console.log(`Updated versionId for ${deviceId} → ${newVersion}`);
//                     }

//                     broadcastToDashboards({
//                         type: "ota_result",
//                         deviceId,
//                         status: "pass",
//                     });

//                     ws.send(JSON.stringify({ type: "ota_ack", status: "success" }));
//                 }

//                 // OTA ERROR -----------------------------------
//                 else if (data.type === "ota_error") {
//                     console.error(`OTA error for ${deviceId}: ${data.message}`);

//                     // DO NOT update version in DB

//                     broadcastToDashboards({
//                         type: "ota_result",
//                         deviceId,
//                         status: "fail",
//                         message: data.message,
//                     });
//                 }

//                 // HEARTBEAT -----------------------------------
//                 else if (data.type === "heartbeat") {
//                     if (deviceId && connectedDevices.has(deviceId)) {
//                         connectedDevices.get(deviceId).lastHeartbeat = new Date();
//                     }
//                     ws.send(JSON.stringify({ type: "heartbeat_ack" }));
//                 }

//             } catch (err) {
//                 console.error("Message error:", err);
//             }
//         });

//         ws.on("close", () => {
//             if (deviceId) {
//                 console.log(`Device disconnected: ${deviceId}`);
//                 connectedDevices.delete(deviceId);
//                 broadcastToDashboards({ type: "device_disconnected", deviceId });
//             }
//         });

//         ws.on("error", (err) => {
//             console.error("WebSocket error:", err);
//             if (deviceId) connectedDevices.delete(deviceId);
//         });
//     });

//     return wss;
// }

// // BROADCAST -----------------------------------------
// function broadcastToDashboards(payload) {
//     const data = JSON.stringify(payload);
//     for (const ws of dashboardClients) {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(data);
//         }
//     }
// }

// // SEND OTA UPDATE ------------------------------------
// function sendOTAUpdate(ws, deviceId, customFirmwarePath) {
//     const firmwarePath = customFirmwarePath || FIRMWARE_PATH;

//     if (!fs.existsSync(firmwarePath)) {
//         ws.send(JSON.stringify({
//             type: "ota_error",
//             message: `Firmware file not found: ${firmwarePath}`,
//         }));
//         return;
//     }

//     const firmwareBuffer = fs.readFileSync(firmwarePath);
//     const firmwareSize = firmwareBuffer.length;

//     ws.send(JSON.stringify({
//         type: "ota_start",
//         size: firmwareSize,
//         chunks: Math.ceil(firmwareSize / 2048),
//     }));

//     const chunkSize = 2048;
//     let offset = 0;

//     const sendChunk = () => {
//         if (offset < firmwareSize) {
//             const chunk = firmwareBuffer.slice(offset, offset + chunkSize);
//             const chunkData = {
//                 type: "ota_chunk",
//                 offset,
//                 data: chunk.toString("base64"),
//                 totalSize: firmwareSize,
//             };

//             if (ws.readyState === WebSocket.OPEN) {
//                 ws.send(JSON.stringify(chunkData));
//                 offset += chunkSize;
//                 setTimeout(sendChunk, 50);
//             }
//         } else {
//             ws.send(JSON.stringify({ type: "ota_end", status: "complete" }));
//         }
//     };

//     setTimeout(sendChunk, 100);
// }

// module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };








// src/utils/espOtaSocket.js
// const WebSocket = require("ws");
// const fs = require("fs");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const deviceModel = require("../models/deviceModel");

// const connectedDevices = new Map();
// const dashboardClients = new Set();

// let FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");
// const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

// function initEspOtaSocket(server) {
//   const wss = new WebSocket.Server({ noServer: true });
//   console.log("ESP32 OTA WebSocket Server initialized");

//   // HEALTHCHECK / keepalive for dashboards
//   const HEALTHCHECK_INTERVAL = 20000; // 20s
//   const healthInterval = setInterval(() => {
//     for (const ws of Array.from(dashboardClients)) {
//       try {
//         if (!ws.isAlive) {
//           console.warn("Dashboard ws did not respond to ping — terminating.");
//           dashboardClients.delete(ws);
//           try { ws.terminate(); } catch {}
//           continue;
//         }
//         ws.isAlive = false;
//         ws.ping(() => {});
//       } catch (err) {
//         console.error("Healthcheck error:", err && (err.message || err));
//         dashboardClients.delete(ws);
//         try { ws.terminate(); } catch {}
//       }
//     }
//   }, HEALTHCHECK_INTERVAL);

//   wss.on("connection", (ws, req) => {
//     // Parse URL safely (so query string does not break pathname checks)
//     let pathname = req.url;
//     let searchParams = null;
//     try {
//       const parsed = new URL(req.url, `http://${req.headers.host}`);
//       pathname = parsed.pathname;
//       searchParams = parsed.searchParams;
//     } catch (err) {
//       console.warn("Failed to parse req.url with URL():", err && err.message);
//     }

//     const isDashboard = (searchParams && (searchParams.get("admin") === "true")) || (req.url && req.url.includes("admin=true"));

//     if (isDashboard) {
//       // optional token verification (do not force-close during debugging; send an error frame instead)
//       const token = searchParams ? searchParams.get("token") : null;
//       let dashboardUser = null;
//       if (token) {
//         try {
//           dashboardUser = jwt.verify(token, JWT_SECRET);
//         } catch (err) {
//           console.warn("Dashboard token invalid/expired (allowing connection for now):", err && err.message);
//           try { ws.send(JSON.stringify({ type: "error", message: "Invalid/expired token (connection allowed for debugging)" })); } catch {}
//         }
//       }

//       // Accept dashboard
//       dashboardClients.add(ws);
//       console.log("Admin dashboard connected - req.url:", req.url, "user:", dashboardUser ? (dashboardUser._id || dashboardUser.email || dashboardUser) : "no-token");

//       // mark alive for healthcheck
//       ws.isAlive = true;
//       ws.on("pong", () => { ws.isAlive = true; });

//       // send initial device list
//       try {
//         const payload = {
//           type: "device_list",
//           devices: Array.from(connectedDevices.entries()).map(([id, d]) => ({
//             deviceId: id,
//             ip: d.ip,
//             status: d.status,
//             connectedAt: d.connectedAt,
//           })),
//         };
//         if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
//       } catch (err) {
//         console.error("Error sending initial device_list to dashboard:", err && err.message);
//       }

//       ws.on("message", (msg) => {
//         console.log("Dashboard -> server message:", typeof msg === "string" ? msg : msg.toString?.() || msg);
//       });

//       ws.on("close", (code, reason) => {
//         console.log(`Dashboard WS closed — code: ${code}, reason: ${reason && reason.toString ? reason.toString() : reason}`);
//         dashboardClients.delete(ws);
//       });

//       ws.on("error", (err) => {
//         console.error("Dashboard WS error:", err && err.message ? err.message : err);
//         dashboardClients.delete(ws);
//       });

//       // server hello for debug
//       setTimeout(() => {
//         if (ws.readyState === WebSocket.OPEN) {
//           try {
//             ws.send(JSON.stringify({ type: "server_hello", msg: "hello dashboard", ts: new Date().toISOString() }));
//             console.log("Sent server_hello to dashboard");
//           } catch (err) {
//             console.error("Failed to send server_hello:", err && err.message);
//           }
//         }
//       }, 200);

//       return;
//     }

//     // ---------------- DEVICE CONNECTION ----------------
//     let deviceId = null;
//     const deviceIP = req.socket.remoteAddress;
//     console.log(`New ESP32 connection from ${deviceIP}`);

//     ws.on("message", async (message) => {
//       try {
//         const data = typeof message === "string" ? JSON.parse(message) : JSON.parse(message.toString());

//         if (data.type === "register") {
//           deviceId = data.deviceId;
//           connectedDevices.set(deviceId, {
//             ws,
//             ip: deviceIP,
//             connectedAt: new Date(),
//             status: "connected",
//           });

//           console.log(`Device registered: ${deviceId}`);

//           broadcastToDashboards({
//             type: "device_connected",
//             deviceId,
//             ip: deviceIP,
//             time: new Date(),
//           });

//           try { ws.send(JSON.stringify({ type: "registered", status: "success" })); } catch (err) {}
//         }

//         else if (data.type === "ota_request") {
//           console.log(`OTA request from ${deviceId}`);
//           sendOTAUpdate(ws, deviceId);
//         }

//         else if (data.type === "ota_progress") {
//           console.log(`OTA progress ${deviceId}: ${data.progress}%`);
//           broadcastToDashboards({ type: "ota_progress", deviceId, progress: data.progress });
//         }

//         else if (data.type === "ota_complete") {
//           console.log(`OTA complete for ${deviceId}`);
//           try {
//             if (connectedDevices.has(deviceId) && connectedDevices.get(deviceId).currentVersionId) {
//               const newVersion = connectedDevices.get(deviceId).currentVersionId;
//               await deviceModel.findOneAndUpdate({ deviceId }, { versionId: newVersion }, { new: true });
//               console.log(`Updated versionId for ${deviceId} → ${newVersion}`);
//             }
//           } catch (err) {
//             console.error("Error updating device version in DB:", err && err.message);
//           }

//           broadcastToDashboards({ type: "ota_result", deviceId, status: "pass" });
//           try { ws.send(JSON.stringify({ type: "ota_ack", status: "success" })); } catch (err) {}
//         }

//         else if (data.type === "ota_error") {
//           console.error(`OTA error for ${deviceId}: ${data.message}`);
//           broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: data.message });
//         }

//         else if (data.type === "heartbeat") {
//           if (deviceId && connectedDevices.has(deviceId)) connectedDevices.get(deviceId).lastHeartbeat = new Date();
//           try { ws.send(JSON.stringify({ type: "heartbeat_ack" })); } catch (err) {}
//         }

//       } catch (err) {
//         console.error("Message error:", err && (err.message || err));
//       }
//     });

//     ws.on("close", (code, reason) => {
//       if (deviceId) {
//         console.log(`Device disconnected: ${deviceId} (code: ${code}, reason: ${reason})`);
//         connectedDevices.delete(deviceId);
//         broadcastToDashboards({ type: "device_disconnected", deviceId });
//       }
//     });

//     ws.on("error", (err) => {
//       console.error("WebSocket error (device):", err && (err.message || err));
//       if (deviceId) connectedDevices.delete(deviceId);
//     });
//   });

//   // ensure interval cleared when Node process exits or when server closes.
//   wss.on("close", () => {
//     clearInterval(healthInterval);
//   });

//   return wss;
// }

// function broadcastToDashboards(payload) {
//   const data = JSON.stringify(payload);
//   for (const ws of Array.from(dashboardClients)) {
//     try {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(data);
//       } else {
//         dashboardClients.delete(ws);
//       }
//     } catch (err) {
//       console.error("broadcastToDashboards send error:", err && (err.message || err));
//       dashboardClients.delete(ws);
//     }
//   }
// }

// function sendOTAUpdate(ws, deviceId, customFirmwarePath) {
//   const firmwarePath = customFirmwarePath || FIRMWARE_PATH;

//   if (!fs.existsSync(firmwarePath)) {
//     try { ws.send(JSON.stringify({ type: "ota_error", message: `Firmware file not found: ${firmwarePath}` })); } catch (err) {}
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: `Firmware file not found: ${firmwarePath}` });
//     return;
//   }

//   const firmwareBuffer = fs.readFileSync(firmwarePath);
//   const firmwareSize = firmwareBuffer.length;

//   try {
//     ws.send(JSON.stringify({ type: "ota_start", size: firmwareSize, chunks: Math.ceil(firmwareSize / 2048) }));
//   } catch (err) {
//     console.error("Failed to send ota_start:", err && (err.message || err));
//     return;
//   }

//   const chunkSize = 2048;
//   let offset = 0;

//   const sendChunk = () => {
//     if (offset < firmwareSize) {
//       const chunk = firmwareBuffer.slice(offset, offset + chunkSize);
//       const chunkData = { type: "ota_chunk", offset, data: chunk.toString("base64"), totalSize: firmwareSize };
//       if (ws.readyState === WebSocket.OPEN) {
//         try { ws.send(JSON.stringify(chunkData)); } catch (err) { console.error("Error sending ota_chunk:", err && (err.message || err)); return; }
//         offset += chunkSize;
//         setTimeout(sendChunk, 50);
//       } else {
//         console.warn("OTA target ws not open, stopping sendChunk");
//       }
//     } else {
//       try { ws.send(JSON.stringify({ type: "ota_end", status: "complete" })); } catch (err) { console.error("Error sending ota_end:", err && (err.message || err)); }
//     }
//   };

//   setTimeout(sendChunk, 100);
// }

// module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };







// const WebSocket = require("ws");
// const fs = require("fs");
// const path = require("path");
// const deviceModel = require("../models/deviceModel");

// const connectedDevices = new Map();
// const dashboardClients = new Set();

// let FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");

// function initEspOtaSocket(server) {
//     const wss = new WebSocket.Server({ noServer: true });
//     console.log("ESP32 OTA WebSocket Server initialized");

//     wss.on("connection", (ws, req) => {
//         const isDashboard = req.url.includes("admin=true");

//         if (isDashboard) {
//             dashboardClients.add(ws);
//             console.log("Admin dashboard connected");

//             ws.send(JSON.stringify({
//                 type: "device_list",
//                 devices: Array.from(connectedDevices.entries()).map(([id, d]) => ({
//                     deviceId: id,
//                     ip: d.ip,
//                     status: d.status,
//                     connectedAt: d.connectedAt,
//                 })),
//             }));

//             ws.on("close", () => dashboardClients.delete(ws));
//             return;
//         }

//         // DEVICE CONNECTION
//         let deviceId = null;
//         const deviceIP = req.socket.remoteAddress;
//         console.log(`New ESP32 connection from ${deviceIP}`);

//         ws.on("message", async (message) => {
//             try {
//                 const data = JSON.parse(message.toString());

//                 // DEVICE REGISTRATION -------------------------
//                 if (data.type === "register") {
//                     deviceId = data.deviceId;
//                     connectedDevices.set(deviceId, {
//                         ws,
//                         ip: deviceIP,
//                         connectedAt: new Date(),
//                         status: "connected",
//                     });

//                     console.log(`Device registered: ${deviceId}`);

//                     broadcastToDashboards({
//                         type: "device_connected",
//                         deviceId,
//                         ip: deviceIP,
//                         time: new Date(),
//                     });

//                     ws.send(JSON.stringify({ type: "registered", status: "success" }));
//                 }

//                 // OTA REQUEST ---------------------------------
//                 else if (data.type === "ota_request") {
//                     console.log(`OTA request from ${deviceId}`);
//                     sendOTAUpdate(ws, deviceId);
//                 }

//                 // OTA PROGRESS --------------------------------
//                 else if (data.type === "ota_progress") {
//                     console.log(`OTA progress ${deviceId}: ${data.progress}%`);

//                     broadcastToDashboards({
//                         type: "ota_progress",
//                         deviceId,
//                         progress: data.progress,
//                     });
//                 }

//                 // OTA COMPLETED SUCCESSFULLY -------------------
//                 else if (data.type === "ota_complete") {
//                     console.log(`OTA complete for ${deviceId}`);

//                     // UPDATE VERSION IN DB
//                     if (connectedDevices.has(deviceId) && connectedDevices.get(deviceId).currentVersionId) {
//                         const newVersion = connectedDevices.get(deviceId).currentVersionId;

//                         await deviceModel.findOneAndUpdate(
//                             { deviceId },
//                             { versionId: newVersion },
//                             { new: true }
//                         );

//                         console.log(`Updated versionId for ${deviceId} → ${newVersion}`);
//                     }

//                     broadcastToDashboards({
//                         type: "ota_result",
//                         deviceId,
//                         status: "pass",
//                     });

//                     ws.send(JSON.stringify({ type: "ota_ack", status: "success" }));
//                 }

//                 // OTA ERROR -----------------------------------
//                 else if (data.type === "ota_error") {
//                     console.error(`OTA error for ${deviceId}: ${data.message}`);

//                     // DO NOT update version in DB

//                     broadcastToDashboards({
//                         type: "ota_result",
//                         deviceId,
//                         status: "fail",
//                         message: data.message,
//                     });
//                 }

//                 // HEARTBEAT -----------------------------------
//                 else if (data.type === "heartbeat") {
//                     if (deviceId && connectedDevices.has(deviceId)) {
//                         connectedDevices.get(deviceId).lastHeartbeat = new Date();
//                     }
//                     ws.send(JSON.stringify({ type: "heartbeat_ack" }));
//                 }

//             } catch (err) {
//                 console.error("Message error:", err);
//             }
//         });

//         ws.on("close", () => {
//             if (deviceId) {
//                 console.log(`Device disconnected: ${deviceId}`);
//                 connectedDevices.delete(deviceId);
//                 broadcastToDashboards({ type: "device_disconnected", deviceId });
//             }
//         });

//         ws.on("error", (err) => {
//             console.error("WebSocket error:", err);
//             if (deviceId) connectedDevices.delete(deviceId);
//         });
//     });

//     return wss;
// }

// // BROADCAST -----------------------------------------
// function broadcastToDashboards(payload) {
//     const data = JSON.stringify(payload);
//     for (const ws of dashboardClients) {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(data);
//         }
//     }
// }

// // SEND OTA UPDATE ------------------------------------
// function sendOTAUpdate(ws, deviceId, customFirmwarePath) {
//     const firmwarePath = customFirmwarePath || FIRMWARE_PATH;

//     if (!fs.existsSync(firmwarePath)) {
//         ws.send(JSON.stringify({
//             type: "ota_error",
//             message: `Firmware file not found: ${firmwarePath}`,
//         }));
//         return;
//     }

//     const firmwareBuffer = fs.readFileSync(firmwarePath);
//     const firmwareSize = firmwareBuffer.length;

//     ws.send(JSON.stringify({
//         type: "ota_start",
//         size: firmwareSize,
//         chunks: Math.ceil(firmwareSize / 2048),
//     }));

//     const chunkSize = 2048;
//     let offset = 0;

//     const sendChunk = () => {
//         if (offset < firmwareSize) {
//             const chunk = firmwareBuffer.slice(offset, offset + chunkSize);
//             const chunkData = {
//                 type: "ota_chunk",
//                 offset,
//                 data: chunk.toString("base64"),
//                 totalSize: firmwareSize,
//             };

//             if (ws.readyState === WebSocket.OPEN) {
//                 ws.send(JSON.stringify(chunkData));
//                 offset += chunkSize;
//                 setTimeout(sendChunk, 50);
//             }
//         } else {
//             ws.send(JSON.stringify({ type: "ota_end", status: "complete" }));
//         }
//     };

//     setTimeout(sendChunk, 100);
// }

// module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };













// // src/utils/espOtaSocket.js
// const WebSocket = require("ws");
// const fs = require("fs");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const deviceModel = require("../models/deviceModel");

// const connectedDevices = new Map();
// const dashboardClients = new Set();

// let FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");
// const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

// function initEspOtaSocket(server) {
//   const wss = new WebSocket.Server({ noServer: true });
//   console.log("ESP32 OTA WebSocket Server initialized");

//   // HEALTHCHECK / keepalive for dashboards
//   const HEALTHCHECK_INTERVAL = 20000; // 20s
//   const healthInterval = setInterval(() => {
//     for (const ws of Array.from(dashboardClients)) {
//       try {
//         if (!ws.isAlive) {
//           console.warn("Dashboard ws did not respond to ping — terminating.");
//           dashboardClients.delete(ws);
//           try { ws.terminate(); } catch {}
//           continue;
//         }
//         ws.isAlive = false;
//         ws.ping(() => {});
//       } catch (err) {
//         console.error("Healthcheck error:", err && (err.message || err));
//         dashboardClients.delete(ws);
//         try { ws.terminate(); } catch {}
//       }
//     }
//   }, HEALTHCHECK_INTERVAL);

//   wss.on("connection", (ws, req) => {
//     // Parse URL safely (so query string does not break pathname checks)
//     let pathname = req.url;
//     let searchParams = null;
//     try {
//       const parsed = new URL(req.url, `http://${req.headers.host}`);
//       pathname = parsed.pathname;
//       searchParams = parsed.searchParams;

//       console.log("PARSEDURL>><<", parsed)
//     } catch (err) {
//       console.warn("Failed to parse req.url with URL():", err && err.message);
//     }

//     const isDashboard = (searchParams && (searchParams.get("admin") === "true")) || (req.url && req.url.includes("admin=true"));

//     if (isDashboard) {
//       // optional token verification (do not force-close during debugging; send an error frame instead)
//       const token = searchParams ? searchParams.get("token") : null;
//       let dashboardUser = null;
//       if (token) {
//         try {
//           dashboardUser = jwt.verify(token, JWT_SECRET);
//         } catch (err) {
//           console.warn("Dashboard token invalid/expired (allowing connection for now):", err && err.message);
//           try { ws.send(JSON.stringify({ type: "error", message: "Invalid/expired token (connection allowed for debugging)" })); } catch {}
//         }
//       }

//       console.log("BEFORE ACCEPT DASHBOARD::>>>")
//       // Accept dashboard
//       dashboardClients.add(ws);
//       console.log("Admin dashboard connected - req.url:", req.url, "user:", dashboardUser ? (dashboardUser._id || dashboardUser.email || dashboardUser) : "no-token");

//       // mark alive for healthcheck
//       ws.isAlive = true;
//       ws.on("pong", () => { ws.isAlive = true; });

//       // send initial device list
//       try {
//         const payload = {
//           type: "device_list",
//           devices: Array.from(connectedDevices.entries()).map(([id, d]) => ({
//             deviceId: id,
//             ip: d.ip,
//             status: d.status,
//             connectedAt: d.connectedAt,
//           })),
//         };
//         if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
//       } catch (err) {
//         console.error("Error sending initial device_list to dashboard:", err && err.message);
//       }

//       ws.on("message", (msg) => {
//         console.log("Dashboard -> server message:", typeof msg === "string" ? msg : msg.toString?.() || msg);
//       });

//       ws.on("close", (code, reason) => {
//         console.log(`Dashboard WS closed — code: ${code}, reason: ${reason && reason.toString ? reason.toString() : reason}`);
//         dashboardClients.delete(ws);
//       });

//       ws.on("error", (err) => {
//         console.error("Dashboard WS error:", err && err.message ? err.message : err);
//         dashboardClients.delete(ws);
//       });

//       // server hello for debug
//       setTimeout(() => {
//         if (ws.readyState === WebSocket.OPEN) {
//           try {
//             ws.send(JSON.stringify({ type: "server_hello", msg: "hello dashboard", ts: new Date().toISOString() }));
//             console.log("Sent server_hello to dashboard");
//           } catch (err) {
//             console.error("Failed to send server_hello:", err && err.message);
//           }
//         }
//       }, 200);

//       return;
//     }

//     // ---------------- DEVICE CONNECTION ----------------
//     let deviceId = null;
//     const deviceIP = req.socket.remoteAddress;
//     console.log(`New ESP32 connection from ${deviceIP}`);

//     ws.on("message", async (message) => {
//       try {
//         const data = typeof message === "string" ? JSON.parse(message) : JSON.parse(message.toString());

//         if (data.type === "register") {
//           deviceId = data.deviceId;
//           connectedDevices.set(deviceId, {
//             ws,
//             ip: deviceIP,
//             connectedAt: new Date(),
//             status: "connected",
//           });

//           console.log(`Device registered: ${deviceId}`);

//           broadcastToDashboards({
//             type: "device_connected",
//             deviceId,
//             ip: deviceIP,
//             time: new Date(),
//           });

//           try { ws.send(JSON.stringify({ type: "registered", status: "success" })); } catch (err) {}
//         }

//         else if (data.type === "ota_request") {
//           console.log(`OTA request from ${deviceId}`);
//           sendOTAUpdate(ws, deviceId);
//         }

//         else if (data.type === "ota_progress") {
//           console.log(`OTA progress ${deviceId}: ${data.progress}%`);
//           broadcastToDashboards({ type: "ota_progress", deviceId, progress: data.progress });
//         }

//         else if (data.type === "ota_complete") {
//           console.log(`OTA complete for ${deviceId}`);
//           try {
//             if (connectedDevices.has(deviceId) && connectedDevices.get(deviceId).currentVersionId) {
//               const newVersion = connectedDevices.get(deviceId).currentVersionId;
//               await deviceModel.findOneAndUpdate({ deviceId }, { versionId: newVersion }, { new: true });
//               console.log(`Updated versionId for ${deviceId} → ${newVersion}`);
//             }
//           } catch (err) {
//             console.error("Error updating device version in DB:", err && err.message);
//           }

//           broadcastToDashboards({ type: "ota_result", deviceId, status: "pass" });
//           try { ws.send(JSON.stringify({ type: "ota_ack", status: "success" })); } catch (err) {}
//         }

//         else if (data.type === "ota_error") {
//           console.error(`OTA error for ${deviceId}: ${data.message}`);
//           broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: data.message });
//         }

//         else if (data.type === "heartbeat") {
//           if (deviceId && connectedDevices.has(deviceId)) connectedDevices.get(deviceId).lastHeartbeat = new Date();
//           try { ws.send(JSON.stringify({ type: "heartbeat_ack" })); } catch (err) {}
//         }

//       } catch (err) {
//         console.error("Message error:", err && (err.message || err));
//       }
//     });

// // ws.on("close", (code, reason) => {
// //   if (deviceId) {
// //     console.log(`Device disconnected: ${deviceId} (code: ${code}, reason: ${reason})`);
// //     // fetch current entry (don't rely on connectedDevices after delete)
// //     const entry = connectedDevices.get(deviceId);
// //     if (entry && entry.otaInProgress) {
// //       // broadcast final fail for dashboards so they count it in Fail
// //       broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Device disconnected during OTA" });
// //       // clear flag (we'll delete entry below)
// //       entry.otaInProgress = false;
// //     }

// //     // still broadcast device_disconnected (dashboard will mark status disconnected/offline)
// //     broadcastToDashboards({ type: "device_disconnected", deviceId });

// //     // remove from connected map
// //     connectedDevices.delete(deviceId);
// //   }
// // });

// ws.on("close", (code, reason) => {
//   if (deviceId) {
//     console.log(`Device disconnected: ${deviceId} (code: ${code}, reason: ${reason})`);
//     const entry = connectedDevices.get(deviceId);

//     // if OTA was in progress, include final status in device_disconnected
//     if (entry && entry.otaInProgress) {
//       broadcastToDashboards({
//         type: "device_disconnected",
//         deviceId,
//         otaFinalStatus: "fail",
//         message: "Device disconnected during OTA",
//       });
//       entry.otaInProgress = false;
//     } else {
//       broadcastToDashboards({ type: "device_disconnected", deviceId });
//     }

//     // delete from server map
//     connectedDevices.delete(deviceId);
//   }
// });


//    ws.on("error", (err) => {
//   console.error("WebSocket error (device):", err && (err.message || err));
//   const entry = deviceId ? connectedDevices.get(deviceId) : null;
//   if (entry && entry.otaInProgress) {
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Device connection error during OTA" });
//     entry.otaInProgress = false;
//   }
//   if (deviceId) connectedDevices.delete(deviceId);
// });

//   });

//   // ensure interval cleared when Node process exits or when server closes.
//   wss.on("close", () => {
//     clearInterval(healthInterval);
//   });

//   return wss;
// }

// function broadcastToDashboards(payload) {
//   const data = JSON.stringify(payload);
//   for (const ws of dashboardClients) {
//     try {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(data);
//       } else {
//         dashboardClients.delete(ws);
//       }
//     } catch (err) {
//       console.error("broadcastToDashboards send error:", err && (err.message || err));
//       dashboardClients.delete(ws);
//     }
//   }
// }

// function sendOTAUpdate(ws, deviceId, customFirmwarePath, entryRef) {
//   const firmwarePath = customFirmwarePath || FIRMWARE_PATH;

//   if (!fs.existsSync(firmwarePath)) {
//     try { ws.send(JSON.stringify({ type: "ota_error", message: `Firmware file not found: ${firmwarePath}` })); } catch (err) {}
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: `Firmware file not found: ${firmwarePath}` });
//     if (entryRef) entryRef.otaInProgress = false;
//     return;
//   }

//   const firmwareBuffer = fs.readFileSync(firmwarePath);
//   const firmwareSize = firmwareBuffer.length;

//   try {
//     ws.send(JSON.stringify({ type: "ota_start", size: firmwareSize, chunks: Math.ceil(firmwareSize / 2048) }));
//   } catch (err) {
//     console.error("Failed to send ota_start:", err && (err.message || err));
//     if (entryRef) entryRef.otaInProgress = false;
//     // broadcast fail so dashboard knows
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Failed to initiate OTA (send error)" });
//     return;
//   }

//   const chunkSize = 2048;
//   let offset = 0;
//   let aborted = false;

//   const sendChunk = () => {
//     if (offset < firmwareSize) {
//       if (ws.readyState !== WebSocket.OPEN) {
//         // target disconnected mid-stream — mark fail & stop
//         aborted = true;
//         console.warn(`Target ${deviceId} ws not open during OTA, aborting sendChunk`);
//         broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Disconnected during OTA" });
//         if (entryRef) entryRef.otaInProgress = false;
//         return;
//       }

//       const chunk = firmwareBuffer.slice(offset, offset + chunkSize);
//       const chunkData = { type: "ota_chunk", offset, data: chunk.toString("base64"), totalSize: firmwareSize };
//       try {
//         ws.send(JSON.stringify(chunkData));
//       } catch (err) {
//         console.error("Error sending ota_chunk:", err && (err.message || err));
//         aborted = true;
//         broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Error sending OTA chunk" });
//         if (entryRef) entryRef.otaInProgress = false;
//         return;
//       }
//       offset += chunkSize;
//       setTimeout(sendChunk, 50);
//     } else {
//       // finished sending all chunks
//       try { ws.send(JSON.stringify({ type: "ota_end", status: "complete" })); } catch (err) { console.error("Error sending ota_end:", err && (err.message || err)); }
//       // Do not assume device succeeded: device should send ota_complete or server receives ota_complete
//       // We clear the flag here because we finished sending bytes.
//       if (entryRef) entryRef.otaInProgress = false;
//     }
//   };

//   setTimeout(sendChunk, 100);
// }


// module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };















// // src/utils/espOtaSocket.js
// const WebSocket = require("ws");
// const fs = require("fs");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const deviceModel = require("../models/deviceModel");

// const connectedDevices = new Map();
// const dashboardClients = new Set();

// let FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");
// const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

// // src/utils/espOtaSocket.js (replace initEspOtaSocket with this version)
// function initEspOtaSocket(server) {
//   const wss = new WebSocket.Server({ noServer: true });
//   console.log("ESP32 OTA WebSocket Server initialized");

//   // HEALTHCHECK / keepalive for dashboards (existing)
//   const DASHBOARD_HEALTHCHECK_INTERVAL = 20000; // 20s

//   const dashboardHealthInterval = setInterval(() => {
//     for (const ws of Array.from(dashboardClients)) {
//       try {
//         if (!ws.isAlive) {
//           console.warn("Dashboard ws did not respond to ping — terminating.");
//           dashboardClients.delete(ws);
//           try { ws.terminate(); } catch { }
//           continue;
//         }
//         ws.isAlive = false;
//         ws.ping(() => { });
//       } catch (err) {
//         console.error("Healthcheck error (dashboard):", err && (err.message || err));
//         dashboardClients.delete(ws);
//         try { ws.terminate(); } catch { }
//       }
//     }
//   }, DASHBOARD_HEALTHCHECK_INTERVAL);

//   // --- New: device healthcheck interval (detect silent disconnects) ---
//   const DEVICE_HEALTHCHECK_INTERVAL = 15000; // 15s (tweak if needed)
//   const deviceHealthInterval = setInterval(() => {
//     for (const [id, entry] of Array.from(connectedDevices.entries())) {
//       try {
//         const ws = entry && entry.ws;
//         if (!ws) {
//           // no socket object — remove & notify
//           handleDeviceDisconnect(id, 1006, "no-socket");
//           continue;
//         }

//         // if ping/pong not responded since last tick => mark dead
//         if (!ws.isAlive) {
//           console.warn(`Device ws not alive (no pong): ${id} — treating as disconnected`);
//           // call the same helper that close handler uses
//           handleDeviceDisconnect(id, 1006, "no-pong");
//           continue;
//         }

//         // reset flag and ping
//         ws.isAlive = false;
//         try { ws.ping(() => {}); } catch (err) {
//           console.warn("Error pinging device ws:", err && err.message);
//         }
//       } catch (err) {
//         console.error("Device healthcheck error for", id, err && (err.message || err));
//       }
//     }
//   }, DEVICE_HEALTHCHECK_INTERVAL);

//   // Helper to perform the common disconnect actions
//   function handleDeviceDisconnect(deviceId, code = 1000, reason = "") {
//     const entry = connectedDevices.get(deviceId);
//     const payloadBase = {
//       type: "device_disconnected",
//       deviceId,
//       code,
//       reason: reason && reason.toString ? reason.toString() : reason,
//       time: new Date(),
//       lastProgress: entry ? (Number(entry.lastProgress) || 0) : null
//     };

//     if (entry && entry.otaInProgress) {
//       payloadBase.otaFinalStatus = "fail";
//       payloadBase.message = "Device disconnected during OTA";
//       try { broadcastToDashboards(payloadBase); } catch (err) { console.error("broadcast error:", err); }
//       entry.otaInProgress = false;
//     } else {
//       try { broadcastToDashboards(payloadBase); } catch (err) { console.error("broadcast error:", err); }
//     }

//     // close/terminate the ws if still open
//     try {
//       if (entry && entry.ws && entry.ws.readyState === WebSocket.OPEN) {
//         try { entry.ws.terminate(); } catch (e) {}
//       }
//     } catch (err) {
//       console.warn("Error terminating device ws during handleDeviceDisconnect", err && err.message);
//     }

//     connectedDevices.delete(deviceId);
//     console.log("handleDeviceDisconnect completed for", deviceId);
//   }

//   wss.on("connection", (ws, req) => {
//     // Parse URL safely
//     let pathname = req.url;
//     let searchParams = null;
//     try {
//       const parsed = new URL(req.url, `http://${req.headers.host}`);
//       pathname = parsed.pathname;
//       searchParams = parsed.searchParams;
//       // console.log("PARSEDURL>><<", parsed)
//     } catch (err) {
//       console.warn("Failed to parse req.url with URL():", err && err.message);
//     }

//     const isDashboard = (searchParams && (searchParams.get("admin") === "true")) || (req.url && req.url.includes("admin=true"));

//  if (isDashboard) {
//   // optional token verification (do not force-close during debugging; send an error frame instead)
//   const token = searchParams ? searchParams.get("token") : null;
//   let dashboardUser = null;
//   if (token) {
//     try {
//       dashboardUser = jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//       console.warn("Dashboard token invalid/expired (allowing connection for now):", err && err.message);
//       try { ws.send(JSON.stringify({ type: "error", message: "Invalid/expired token (connection allowed for debugging)" })); } catch { }
//     }
//   }
//   dashboardClients.add(ws);
//   console.log("Admin dashboard connected - req.url:", req.url, "user:", dashboardUser ? (dashboardUser._id || dashboardUser.email || dashboardUser) : "no-token");

//   // mark alive for healthcheck and handle app-level pongs
//   ws.isAlive = true;
//   ws.on("pong", () => { ws.isAlive = true; });

//   // respond to any message from dashboard and mark alive so ping-based healthcheck won't kill it.
//   ws.on("message", (msg) => {
//     try {
//       // any message from dashboard -> mark alive
//       ws.isAlive = true;

//       // try parse message, support app-level heartbeat/pong from client
//       let parsed = null;
//       try { parsed = typeof msg === "string" ? JSON.parse(msg) : JSON.parse(msg.toString()); } catch (e) { /* ignore parse errors */ }

//       if (parsed && parsed.type === "heartbeat") {
//         // optional: reply with ack to dashboard
//         try { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "heartbeat_ack" })); } catch (err) {}
//         return;
//       }

//       if (parsed && parsed.type === "pong") {
//         // client replied to our app-level ping
//         return;
//       }

//       // log other dashboard messages (debug)
//       console.log("Dashboard -> server message:", typeof msg === "string" ? msg : msg.toString?.() || msg);
//     } catch (err) {
//       console.error("Dashboard message handling error:", err && (err.message || err));
//     }
//   });

//   // mark alive on pong (already set), and send initial device_list
//   try {
//     const payload = {
//       type: "device_list",
//       devices: Array.from(connectedDevices.entries()).map(([id, d]) => ({
//         deviceId: id,
//         ip: d.ip,
//         status: d.status,
//         connectedAt: d.connectedAt,
//       })),
//     };
//     if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
//   } catch (err) {
//     console.error("Error sending initial device_list to dashboard:", err && err.message);
//   }

//   // send a friendly debug handshake too
//   setTimeout(() => {
//     if (ws.readyState === WebSocket.OPEN) {
//       try { ws.send(JSON.stringify({ type: "server_hello", msg: "hello dashboard", ts: new Date().toISOString() })); } catch (err) {}
//     }
//   }, 100);

//   ws.on("close", (code, reason) => {
//     console.log(`Dashboard WS closed — code: ${code}, reason: ${reason && reason.toString ? reason.toString() : reason}`);
//     dashboardClients.delete(ws);
//   });

//   ws.on("error", (err) => {
//     console.error("Dashboard WS error:", err && err.message ? err.message : err);
//     dashboardClients.delete(ws);
//   });

//   return;
// }


//     // ---------------- DEVICE CONNECTION ----------------
//     let deviceId = null;
//     const deviceIP = req.socket.remoteAddress;
//     console.log(`New ESP32 connection from ${deviceIP}`);

//     // mark device ws alive & respond to pong
//     ws.isAlive = true;
//     ws.on("pong", () => { ws.isAlive = true; });

//     // ws.on("message", async (message) => {
//     //   try {
//     //     const data = typeof message === "string" ? JSON.parse(message) : JSON.parse(message.toString());

//     //     if (data.type === "register") {
//     //       deviceId = data.deviceId;
//     //       connectedDevices.set(deviceId, {
//     //         ws,
//     //         ip: deviceIP,
//     //         connectedAt: new Date(),
//     //         status: "connected",
//     //         otaInProgress: false,
//     //         lastHeartbeat: new Date(),
//     //         lastProgress: 0
//     //       });

//     //       console.log(`Device registered: ${deviceId}`);

//     //       broadcastToDashboards({
//     //         type: "device_connected",
//     //         deviceId,
//     //         ip: deviceIP,
//     //         time: new Date(),
//     //       });

//     //       try { ws.send(JSON.stringify({ type: "registered", status: "success" })); } catch (err) { }
//     //     }

//     //     else if (data.type === "ota_request") {
//     //       console.log(`OTA request from ${deviceId}`);
//     //       // If you want sendOTAUpdate to update entry flags, pass the entry reference:
//     //       const entry = connectedDevices.get(deviceId);
//     //       sendOTAUpdate(ws, deviceId, undefined, entry);
//     //     }

//     //     else if (data.type === "ota_progress") {
//     //       // FIXED: correctly read progress and store it on the entry
//     //       const progress = Number(data.progress || 0);
//     //       console.log(`OTA progress ${deviceId}: ${progress}%`);
//     //       const entry = connectedDevices.get(deviceId);
//     //       if (entry) {
//     //         entry.lastProgress = progress;
//     //         // optionally update lastHeartbeat/time
//     //         entry.lastHeartbeat = new Date();
//     //       }
//     //       broadcastToDashboards({ type: "ota_progress", deviceId, progress });
//     //     }

//     //     else if (data.type === "ota_complete") {
//     //       console.log(`OTA complete for ${deviceId}`);
//     //       const entry = connectedDevices.get(deviceId);
//     //       if (entry) {
//     //         entry.otaInProgress = false;
//     //         entry.lastProgress = 100;
//     //         // store version if present (you already had this)
//     //         if (entry.currentVersionId) {
//     //           try {
//     //             await deviceModel.findOneAndUpdate({ deviceId }, { versionId: entry.currentVersionId }, { new: true });
//     //             console.log(`Updated versionId for ${deviceId} → ${entry.currentVersionId}`);
//     //           } catch (err) {
//     //             console.error("Error updating device version in DB:", err);
//     //           }
//     //         }
//     //       }
//     //       broadcastToDashboards({ type: "ota_result", deviceId, status: "pass" });
//     //       try { ws.send(JSON.stringify({ type: "ota_ack", status: "success" })); } catch (err) { }
//     //     }

//     //     else if (data.type === "ota_error") {
//     //       console.error(`OTA error for ${deviceId}: ${data.message}`);
//     //       broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: data.message });
//     //     }

//     //     else if (data.type === "heartbeat") {
//     //       if (deviceId && connectedDevices.has(deviceId)) {
//     //         const e = connectedDevices.get(deviceId);
//     //         e.lastHeartbeat = new Date();
//     //         // also mark alive so healthcheck sees it
//     //         if (e.ws) e.ws.isAlive = true;
//     //       }
//     //       try { ws.send(JSON.stringify({ type: "heartbeat_ack" })); } catch (err) { }
//     //     }

//     //   } catch (err) {
//     //     console.error("Message error:", err && (err.message || err));
//     //   }
//     // });

//     // reuse helper on close
    
//     // existing dashboard ws.on("message", ...) currently logs messages.
// // Update it so receiving any message marks ws as alive (so healthcheck won't kill it).
// ws.on("message", (msg) => {
//   try {
//     // mark alive so the server healthcheck sees an active client
//     ws.isAlive = true;

//     // try parse and optionally handle app-level heartbeat
//     let parsed = null;
//     try { parsed = typeof msg === "string" ? JSON.parse(msg) : JSON.parse(msg.toString()); } catch (e) { }

//     if (parsed && parsed.type === "heartbeat") {
//       // client is explicitly telling us it's alive — nothing else to do
//       // (could log if you want)
//       return;
//     }

//     // existing logging line:
//     console.log("Dashboard -> server message:", typeof msg === "string" ? msg : msg.toString?.() || msg);
//   } catch (err) {
//     console.error("Dashboard message handling error:", err && (err.message || err));
//   }
// });



//     ws.on("close", (code, reason) => {
//       console.log(`ws close fired for ${deviceId} code=${code} reason=${reason}`);
//       if (deviceId) {
//         handleDeviceDisconnect(deviceId, code, reason);
//       }
//     });

//     ws.on("error", (err) => {
//       console.error("WebSocket error (device):", err && (err.message || err));
//       const entry = deviceId ? connectedDevices.get(deviceId) : null;
//       if (entry && entry.otaInProgress) {
//         broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Device connection error during OTA" });
//         entry.otaInProgress = false;
//       }
//       if (deviceId) {
//         connectedDevices.delete(deviceId);
//       }
//     });

//   }); // wss.on connection end

//   // ensure intervals cleared when Node process exits or when server closes.
//   wss.on("close", () => {
//     clearInterval(dashboardHealthInterval);
//     clearInterval(deviceHealthInterval);
//   });

//   return wss;
// }


// function broadcastToDashboards(payload) {
//   const data = JSON.stringify(payload);
//   for (const ws of dashboardClients) {
//     try {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(data);
//       } else {
//         dashboardClients.delete(ws);
//       }
//     } catch (err) {
//       console.error("broadcastToDashboards send error:", err && (err.message || err));
//       dashboardClients.delete(ws);
//     }
//   }
// }

// function sendOTAUpdate(ws, deviceId, customFirmwarePath, entryRef) {
//   const firmwarePath = customFirmwarePath || FIRMWARE_PATH;

//   if (!fs.existsSync(firmwarePath)) {
//     try { ws.send(JSON.stringify({ type: "ota_error", message: `Firmware file not found: ${firmwarePath}` })); } catch (err) { }
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: `Firmware file not found: ${firmwarePath}` });
//     if (entryRef) entryRef.otaInProgress = false;
//     return;
//   }

//   const firmwareBuffer = fs.readFileSync(firmwarePath);
//   const firmwareSize = firmwareBuffer.length;

//   try {
//     // ensure entryRef flagged (defensive)
//     if (entryRef) entryRef.otaInProgress = true;

//     ws.send(JSON.stringify({ type: "ota_start", size: firmwareSize, chunks: Math.ceil(firmwareSize / 2048) }));
//   } catch (err) {
//     console.error("Failed to send ota_start:", err && err.message);
//     if (entryRef) entryRef.otaInProgress = false;
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Failed to initiate OTA (send error)" });
//     return;
//   }

//   const chunkSize = 2048;
//   let offset = 0;
//   let aborted = false;

//   const sendChunk = () => {
//     if (offset < firmwareSize) {
//       if (ws.readyState !== WebSocket.OPEN) {
//         aborted = true;
//         console.warn(`Target ${deviceId} ws not open during OTA, aborting sendChunk`);
//         broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Disconnected during OTA" });
//         if (entryRef) entryRef.otaInProgress = false;
//         return;
//       }

//       const chunk = firmwareBuffer.slice(offset, offset + chunkSize);
//       const chunkData = { type: "ota_chunk", offset, data: chunk.toString("base64"), totalSize: firmwareSize };
//       try {
//         ws.send(JSON.stringify(chunkData));
//       } catch (err) {
//         console.error("Error sending ota_chunk:", err && err.message);
//         aborted = true;
//         broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", message: "Error sending OTA chunk" });
//         if (entryRef) entryRef.otaInProgress = false;
//         return;
//       }
//       offset += chunkSize;
//       setTimeout(sendChunk, 50); // throttle
//     } else {
//       // finished sending all chunks
//       try {
//         ws.send(JSON.stringify({ type: "ota_end", status: "complete" }));
//       } catch (err) {
//         console.error("Error sending ota_end:", err && err.message);
//       } finally {
//         if (entryRef) entryRef.otaInProgress = false;
//       }
//     }
//   };

//   // small delay to let device prepare
//   setTimeout(sendChunk, 100);
// }



// module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };











// // Complete OTA Fixed Code from Faraz

// const WebSocket = require("ws");
// const fs = require("fs");
// const path = require("path");
// const deviceModel = require("../models/deviceModel");

// const connectedDevices = new Map(); // key: deviceId, value: device info
// const dashboardClients = new Set(); // admin dashboards

// const FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");
// const AWAIT_CONFIRM_TIMEOUT = 2 * 60 * 1000; // 2 min
// const HEARTBEAT_INTERVAL = 5000; // check every 5 sec
// const HEARTBEAT_TIMEOUT = 15000; // 15 sec no heartbeat = offline

// function initEspOtaSocket(server) {
//   const wss = new WebSocket.Server({ noServer: true });
//   console.log("ESP32 OTA WebSocket Server initialized");

//   // Heartbeat monitor
//   setInterval(() => {
//     const now = Date.now();
//     for (const [deviceId, entry] of connectedDevices.entries()) {
//       if (!entry.lastHeartbeat) continue;
//       if (entry.ws.readyState !== WebSocket.OPEN || now - entry.lastHeartbeat.getTime() > HEARTBEAT_TIMEOUT) {
//         console.log(`Device ${deviceId} considered disconnected (heartbeat timeout)`);
//         broadcastDisconnect(deviceId, entry, "heartbeat_timeout");
//       }
//     }
//   }, HEARTBEAT_INTERVAL);

//   wss.on("connection", (ws, req) => {
//     const isDashboard = req.url && req.url.includes("admin=true");

//     // Dashboard connection
//     if (isDashboard) {
//       dashboardClients.add(ws);
//       console.log("Admin dashboard connected");

//       // send list of currently connected devices
//     //   ws.send(JSON.stringify({
//     //     type: "device_list",
//     //     devices: Array.from(connectedDevices.entries()).map(([id, d]) => ({
//     //       deviceId: id,
//     //       ip: d.ip,
//     //       status: d.status,
//     //       connectedAt: d.connectedAt,
//     //     }))
//     //   }));

//     const deviceList = Array.from(connectedDevices.entries()).map(([id, d]) => ({
//       deviceId: id,
//       ip: d.ip,
//       status: d.status,
//       connectedAt: d.connectedAt,
//     }));

//     console.log("device_list from OTA>", deviceList);

//     // Send to dashboard
//     ws.send(JSON.stringify({
//       type: "device_list",
//       devices: deviceList
//     }));

//     // Log in console
//     console.log("Currently connected devices:");
//     deviceList.forEach(d => {
//       console.log(`- ${d.deviceId} | IP: ${d.ip} | Status: ${d.status} | ConnectedAt: ${d.connectedAt}`);
//     });

      

//       ws.on("close", () => dashboardClients.delete(ws));
//       ws.on("error", () => dashboardClients.delete(ws));
//       return;
//     }

//     // Device connection
//     let deviceId = null;
//     const deviceIP = req.socket.remoteAddress;
//     console.log(`New ESP32 connection from ${deviceIP}`);

//     ws.on("message", async (message) => {
//       try {
//         const data = JSON.parse(message.toString());

//         if (data.type === "register") {
//           deviceId = data.deviceId;

//           connectedDevices.set(deviceId, {
//             ws,
//             ip: deviceIP,
//             connectedAt: new Date(),
//             status: "connected",
//             otaActive: false,
//             awaitingConfirm: false,
//             currentVersionId: null,
//             awaitTimeout: null,
//             lastHeartbeat: new Date(),
//           });

//           console.log(`Device registered: ${deviceId}`);

//           broadcastToDashboards({
//             type: "device_connected",
//             deviceId,
//             ip: deviceIP,
//             time: new Date(),
//           });

//           ws.send(JSON.stringify({ type: "registered", status: "success" }));
//         }

//         else if (data.type === "heartbeat") {
//           if (deviceId && connectedDevices.has(deviceId)) {
//             connectedDevices.get(deviceId).lastHeartbeat = new Date();
//           }
//           ws.send(JSON.stringify({ type: "heartbeat_ack" }));
//         }

//         else if (data.type === "ota_request") sendOTAUpdate(ws, deviceId);
//         else if (data.type === "ota_progress") broadcastToDashboards({ type: "ota_progress", deviceId, progress: data.progress });
//         else if (data.type === "ota_complete") handleOTAComplete(deviceId);
//         else if (data.type === "ota_error") handleOTAError(deviceId, data.message);

//       } catch (err) {
//         console.error("Message error:", err);
//       }
//     });

//     ws.on("close", () => handleDisconnect(ws, deviceId, deviceIP, "socket_closed"));
//     ws.on("error", (err) => {
//       console.error("WebSocket error:", err);
//       handleDisconnect(ws, deviceId, deviceIP, "socket_error");
//     });
//   });

//   return wss;
// }

// // -------------------- HELPERS --------------------
// function broadcastToDashboards(payload) {
//   const data = JSON.stringify(payload);
//   for (const ws of dashboardClients) {
//     if (ws.readyState === WebSocket.OPEN) ws.send(data);
//   }
// }

// function broadcastDisconnect(deviceId, entry, reason) {
//   if (!entry) entry = connectedDevices.get(deviceId);
//   if (!entry) return;

//   if (entry.awaitTimeout) {
//     clearTimeout(entry.awaitTimeout);
//     entry.awaitTimeout = null;
//   }

//   if (entry.otaActive || entry.awaitingConfirm) {
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason });
//   } else {
//     broadcastToDashboards({ type: "device_disconnected", deviceId });
//   }

//   connectedDevices.delete(deviceId);
//   console.log(`Device ${deviceId} removed: ${reason}`);
// }

// function handleDisconnect(ws, deviceId, deviceIP, reason) {
//   let idToRemove = deviceId;

//   if (!idToRemove) {
//     for (const [id, entry] of connectedDevices.entries()) {
//       if (entry.ws === ws) {
//         idToRemove = id;
//         break;
//       }
//     }
//   }

//   if (!idToRemove) return;

//   const entry = connectedDevices.get(idToRemove);
//   broadcastDisconnect(idToRemove, entry, reason);
// }

// async function handleOTAComplete(deviceId) {
//   const entry = connectedDevices.get(deviceId);
//   if (!entry) return;

//   if (entry.awaitTimeout) clearTimeout(entry.awaitTimeout);
//   entry.awaitTimeout = null;

//   if (entry.currentVersionId) {
//     try {
//       await deviceModel.findOneAndUpdate({ deviceId }, { versionId: entry.currentVersionId }, { new: true });
//     } catch (err) {
//       console.error("DB update error on OTA complete:", err);
//     }
//   }

//   entry.otaActive = false;
//   entry.awaitingConfirm = false;
//   entry.currentVersionId = null;

//   broadcastToDashboards({ type: "ota_result", deviceId, status: "pass" });
//   console.log(`OTA Complete for ${deviceId}`);
//   try { entry.ws.send(JSON.stringify({ type: "ota_ack", status: "success" })); } catch {}
// }

// function handleOTAError(deviceId, message) {
//   const entry = connectedDevices.get(deviceId);
//   if (!entry) return;

//   if (entry.awaitTimeout) clearTimeout(entry.awaitTimeout);
//   entry.awaitTimeout = null;

//   entry.otaActive = false;
//   entry.awaitingConfirm = false;
//   entry.currentVersionId = null;

//   broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: message || "device_reported_error" });
//   console.log(`OTA Error for ${deviceId}: ${message}`);
// }

// // -------------------- OTA FUNCTION --------------------
// function sendOTAUpdate(ws, deviceId, customFirmwarePath) {
//   const firmwarePath = customFirmwarePath || FIRMWARE_PATH;
//   const entry = connectedDevices.get(deviceId);

//   if (!entry || entry.ws.readyState !== WebSocket.OPEN) {
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: "offline" });
//     return;
//   }

//   if (!fs.existsSync(firmwarePath) || fs.statSync(firmwarePath).isDirectory()) {
//     broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: "firmware_missing" });
//     return;
//   }

//   entry.otaActive = true;
//   entry.awaitingConfirm = false;

//   const buffer = fs.readFileSync(firmwarePath);
//   const chunkSize = 2048;
//   let offset = 0;
//   const totalChunks = Math.ceil(buffer.length / chunkSize);

//   try { entry.ws.send(JSON.stringify({ type: "ota_start", size: buffer.length, chunks: totalChunks })); } catch {}

//   const sendChunk = () => {
//     if (!entry.ws || entry.ws.readyState !== WebSocket.OPEN) {
//       broadcastDisconnect(deviceId, entry, "disconnected");
//       return;
//     }

//     if (offset < buffer.length) {
//       const chunk = buffer.slice(offset, offset + chunkSize);
//       try { 
//         entry.ws.send(JSON.stringify({ type: "ota_chunk", offset, data: chunk.toString("base64"), totalSize: buffer.length })); 
//       } catch {}

//       offset += chunkSize;

//       // Broadcast progress to dashboards
//       const progress = Math.min(100, Math.floor((offset / buffer.length) * 100));
//       broadcastToDashboards({ type: "ota_progress", deviceId, progress });
//       console.log(`OTA Progress for ${deviceId}: ${progress}%`);

//       setTimeout(sendChunk, 50);
//     } else {
//       entry.awaitingConfirm = true;
//       if (entry.awaitTimeout) clearTimeout(entry.awaitTimeout);
//       entry.awaitTimeout = setTimeout(() => {
//         if (entry.awaitingConfirm) {
//           broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: "no_confirmation" });
//           entry.otaActive = false;
//           entry.awaitingConfirm = false;
//           entry.currentVersionId = null;
//         }
//       }, AWAIT_CONFIRM_TIMEOUT);

//       try { entry.ws.send(JSON.stringify({ type: "ota_end", status: "complete" })); } catch {}
//     }
//   };

//   setTimeout(sendChunk, 100);
// }

// module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };








// src/utils/espOtaSocket.js
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const deviceModel = require("../models/deviceModel");

const connectedDevices = new Map(); // key: deviceId, value: device info
const dashboardClients = new Set(); // admin dashboards

const FIRMWARE_PATH = path.join(__dirname, "..", "..", "uploads", "ota");
const AWAIT_CONFIRM_TIMEOUT = 2 * 60 * 1000; // 2 min
const HEARTBEAT_INTERVAL = 5000; // check every 5 sec
const HEARTBEAT_TIMEOUT = 15000; // 15 sec no heartbeat = offline

function initEspOtaSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });
  console.log("ESP32 OTA WebSocket Server initialized");

  // Heartbeat monitor
  setInterval(() => {
    const now = Date.now();
    for (const [deviceId, entry] of connectedDevices.entries()) {
      if (!entry.lastHeartbeat) continue;
      if (entry.ws.readyState !== WebSocket.OPEN || now - entry.lastHeartbeat.getTime() > HEARTBEAT_TIMEOUT) {
        console.log(`Device ${deviceId} considered disconnected (heartbeat timeout)`);
        broadcastDisconnect(deviceId, entry, "heartbeat_timeout");
      }
    }
  }, HEARTBEAT_INTERVAL);

  wss.on("connection", (ws, req) => {
    const isDashboard = req.url && req.url.includes("admin=true");

    // Dashboard connection
    if (isDashboard) {
      dashboardClients.add(ws);
      console.log("Admin dashboard connected");

      const deviceList = Array.from(connectedDevices.entries()).map(([id, d]) => ({
        deviceId: id,
        ip: d.ip,
        status: d.status,
        connectedAt: d.connectedAt,
      }));

      console.log("device_list from OTA>", deviceList);

      // Send to dashboard
      ws.send(JSON.stringify({
        type: "device_list",
        devices: deviceList
      }));

      // Log in console
      console.log("Currently connected devices:");
      deviceList.forEach(d => {
        console.log(`- ${d.deviceId} | IP: ${d.ip} | Status: ${d.status} | ConnectedAt: ${d.connectedAt}`);
      });

      ws.on("close", () => dashboardClients.delete(ws));
      ws.on("error", () => dashboardClients.delete(ws));
      return;
    }

    // Device connection
    let deviceId = null;
    const deviceIP = req.socket.remoteAddress;
    console.log(`New ESP32 connection from ${deviceIP}`);

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "register") {
          deviceId = data.deviceId;

          connectedDevices.set(deviceId, {
            ws,
            ip: deviceIP,
            connectedAt: new Date(),
            status: "connected",
            otaActive: false,
            awaitingConfirm: false,
            currentVersionId: null,
            awaitTimeout: null,
            lastHeartbeat: new Date(),
          });

          console.log(`Device registered: ${deviceId}`);

          broadcastToDashboards({
            type: "device_connected",
            deviceId,
            ip: deviceIP,
            time: new Date(),
          });

          ws.send(JSON.stringify({ type: "registered", status: "success" }));
        }

        else if (data.type === "heartbeat") {
          if (deviceId && connectedDevices.has(deviceId)) {
            connectedDevices.get(deviceId).lastHeartbeat = new Date();
          }
          ws.send(JSON.stringify({ type: "heartbeat_ack" }));
        }

        else if (data.type === "ota_request") sendOTAUpdate(ws, deviceId);
        else if (data.type === "ota_progress") broadcastToDashboards({ type: "ota_progress", deviceId, progress: data.progress });
        else if (data.type === "ota_complete") handleOTAComplete(deviceId);
        else if (data.type === "ota_error") handleOTAError(deviceId, data.message);

      } catch (err) {
        console.error("Message error:", err);
      }
    });

    ws.on("close", () => handleDisconnect(ws, deviceId, deviceIP, "socket_closed"));
    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      handleDisconnect(ws, deviceId, deviceIP, "socket_error");
    });
  });

  return wss;
}

// -------------------- HELPERS --------------------
function broadcastToDashboards(payload) {
  const data = JSON.stringify(payload);
  for (const ws of dashboardClients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }
}

function broadcastDisconnect(deviceId, entry, reason) {
  if (!entry) entry = connectedDevices.get(deviceId);
  if (!entry) return;

  if (entry.awaitTimeout) {
    clearTimeout(entry.awaitTimeout);
    entry.awaitTimeout = null;
  }

  // If OTA was in progress, report fail, else normal device_disconnected
  if (entry.otaActive || entry.awaitingConfirm) {
    broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason });
  } else {
    broadcastToDashboards({ type: "device_disconnected", deviceId });
  }

  // Close socket if still open
  try { if (entry.ws && entry.ws.readyState === WebSocket.OPEN) entry.ws.terminate(); } catch (e) {}

  connectedDevices.delete(deviceId);
  console.log(`Device ${deviceId} removed: ${reason}`);
}

function handleDisconnect(ws, deviceId, deviceIP, reason) {
  let idToRemove = deviceId;

  if (!idToRemove) {
    for (const [id, entry] of connectedDevices.entries()) {
      if (entry.ws === ws) {
        idToRemove = id;
        break;
      }
    }
  }

  if (!idToRemove) return;

  const entry = connectedDevices.get(idToRemove);
  broadcastDisconnect(idToRemove, entry, reason);
}

async function handleOTAComplete(deviceId) {
  const entry = connectedDevices.get(deviceId);
  if (!entry) return;

  if (entry.awaitTimeout) clearTimeout(entry.awaitTimeout);
  entry.awaitTimeout = null;

  if (entry.currentVersionId) {
    try {
      await deviceModel.findOneAndUpdate({ deviceId }, { versionId: entry.currentVersionId }, { new: true });
    } catch (err) {
      console.error("DB update error on OTA complete:", err);
    }
  }

  entry.otaActive = false;
  entry.awaitingConfirm = false;
  entry.currentVersionId = null;

  broadcastToDashboards({ type: "ota_result", deviceId, status: "pass" });
  console.log(`OTA Complete for ${deviceId}`);
  try { entry.ws.send(JSON.stringify({ type: "ota_ack", status: "success" })); } catch {}
}

function handleOTAError(deviceId, message) {
  const entry = connectedDevices.get(deviceId);
  if (!entry) return;

  if (entry.awaitTimeout) clearTimeout(entry.awaitTimeout);
  entry.awaitTimeout = null;

  entry.otaActive = false;
  entry.awaitingConfirm = false;
  entry.currentVersionId = null;

  broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: message || "device_reported_error" });
  console.log(`OTA Error for ${deviceId}: ${message}`);
}

// -------------------- OTA FUNCTION (IMPROVED) --------------------
function sendOTAUpdate(ws, deviceId, customFirmwarePath) {
  const firmwarePath = customFirmwarePath || FIRMWARE_PATH;
  const entry = connectedDevices.get(deviceId);

  if (!entry || !entry.ws || entry.ws.readyState !== WebSocket.OPEN) {
    broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: "offline" });
    return;
  }

  if (!fs.existsSync(firmwarePath) || fs.statSync(firmwarePath).isDirectory()) {
    broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: "firmware_missing" });
    return;
  }

  // mark OTA active
  entry.otaActive = true;
  entry.awaitingConfirm = false;

  const buffer = fs.readFileSync(firmwarePath);
  const chunkSize = 2048;
  let offset = 0;
  const totalChunks = Math.ceil(buffer.length / chunkSize);
  let aborted = false;

  // clear any previous await timeout
  if (entry.awaitTimeout) clearTimeout(entry.awaitTimeout);
  entry.awaitTimeout = null;

  // inform device OTA is starting
  try { entry.ws.send(JSON.stringify({ type: "ota_start", size: buffer.length, chunks: totalChunks })); } catch (e) {
    // if initial send fails, abort immediately
    console.error("ota_start send failed:", e);
    aborted = true;
    broadcastDisconnect(deviceId, entry, "send_error");
    return;
  }

  // send sequentially using send callback to detect errors immediately
  const sendNextChunk = () => {
    if (aborted) return;
    // safety check socket
    if (!entry.ws || entry.ws.readyState !== WebSocket.OPEN) {
      aborted = true;
      broadcastDisconnect(deviceId, entry, "disconnected");
      return;
    }

    if (offset < buffer.length) {
      const end = Math.min(offset + chunkSize, buffer.length);
      const chunk = buffer.slice(offset, end);
      const payload = JSON.stringify({
        type: "ota_chunk",
        offset,
        data: chunk.toString("base64"),
        totalSize: buffer.length,
      });

      // use send callback to detect any error during write
      entry.ws.send(payload, (err) => {
        if (err) {
          console.error(`Send error for ${deviceId} at offset ${offset}:`, err);
          aborted = true;
          // mark as OTA fail and notify dashboards
          broadcastDisconnect(deviceId, entry, "send_error");
          return;
        }

        // on successful send, advance
        offset = end;
        const progress = Math.min(100, Math.floor((offset / buffer.length) * 100));
        // Broadcast progress to dashboards
        broadcastToDashboards({ type: "ota_progress", deviceId, progress });
        console.log(`OTA Progress for ${deviceId}: ${progress}%`);

        // small delay between chunks
        setTimeout(sendNextChunk, 50);
      });
    } else {
      // All chunks sent — now await confirmation from device
      entry.awaitingConfirm = true;
      if (entry.awaitTimeout) clearTimeout(entry.awaitTimeout);
      entry.awaitTimeout = setTimeout(() => {
        if (entry.awaitingConfirm) {
          // device never confirmed the flash — treat as fail
          entry.otaActive = false;
          entry.awaitingConfirm = false;
          entry.currentVersionId = null;
          broadcastToDashboards({ type: "ota_result", deviceId, status: "fail", reason: "no_confirmation" });
          console.log(`OTA no confirmation for ${deviceId}`);
        }
      }, AWAIT_CONFIRM_TIMEOUT);

      try { entry.ws.send(JSON.stringify({ type: "ota_end", status: "complete" })); } catch (e) {
        console.error("ota_end send failed:", e);
        // If sending ota_end fails, assume disconnect
        aborted = true;
        broadcastDisconnect(deviceId, entry, "send_error");
      }
    }
  };

  // start sending after tiny delay
  setTimeout(sendNextChunk, 100);
}

module.exports = { initEspOtaSocket, connectedDevices, sendOTAUpdate, broadcastToDashboards };
