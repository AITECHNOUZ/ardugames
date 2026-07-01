// Thin wrapper around the Web Serial API. Reads newline-delimited text lines
// from the Arduino and forwards them to a callback. Protocol: "EVT:<stageId>:<payload>\n"

export class SerialLink {
  constructor({ onLine, onStatus }) {
    this.onLine = onLine;
    this.onStatus = onStatus || (() => {});
    this.port = null;
    this.reader = null;
    this.keepReading = false;
    this.baudRate = 9600;
  }

  static isSupported() {
    return 'serial' in navigator;
  }

  async connect() {
    if (!SerialLink.isSupported()) {
      throw new Error('Web Serial API bu brauzerda mavjud emas. Google Chrome yoki Edge dan foydalaning.');
    }
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: this.baudRate });
    this.keepReading = true;
    this.onStatus('connected');
    this._readLoop();
    this.port.addEventListener?.('disconnect', () => {
      this.onStatus('disconnected');
    });
    return true;
  }

  async _readLoop() {
    const textDecoder = new TextDecoderStream();
    this.readableClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();
    let buffer = '';
    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          let idx;
          while ((idx = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (line) this.onLine(line);
          }
        }
      }
    } catch (err) {
      this.onStatus('error', err);
    } finally {
      this.reader.releaseLock();
    }
  }

  async disconnect() {
    this.keepReading = false;
    try {
      await this.reader?.cancel();
    } catch (_) {}
    try {
      await this.readableClosed?.catch(() => {});
    } catch (_) {}
    try {
      await this.port?.close();
    } catch (_) {}
    this.onStatus('disconnected');
  }
}

// Parses "EVT:<id>:<payload>" -> {id:Number, payload:String} or null.
export function parseEventLine(line) {
  const m = /^EVT:(\d+):(.+)$/.exec(line);
  if (!m) return null;
  return { id: Number(m[1]), payload: m[2] };
}
