import { app as o, BrowserWindow as s, ipcMain as m } from "electron";
import { fileURLToPath as R } from "node:url";
import n from "node:path";
const r = n.dirname(R(import.meta.url));
process.env.APP_ROOT = n.join(r, "..");
const i = process.env.VITE_DEV_SERVER_URL, P = n.join(process.env.APP_ROOT, "dist-electron"), a = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? n.join(process.env.APP_ROOT, "public") : a;
let e;
function l() {
  e = new s({
    icon: n.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: n.join(r, "preload.mjs")
    }
  }), e.setTitle("256 PARKING"), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(n.join(a, "index.html"));
}
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  s.getAllWindows().length === 0 && l();
});
o.whenReady().then(l);
m.handle("print-receipt", async (_, c) => {
  const t = new s({ show: !1 });
  await t.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(c)}`), t.webContents.print(
    {
      silent: !0,
      deviceName: "EPSON"
      // cambia 'EPSON' por el nombre exacto de tu impresora térmica
    },
    (p, d) => {
      p || console.error("Error al imprimir:", d), t.close();
    }
  );
});
export {
  P as MAIN_DIST,
  a as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
