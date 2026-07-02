// Wiring-diagram data for each of the 20 stages, consumed by diagram.js's
// renderCircuit(). Pin numbers here must match the corresponding sketch in
// arduino/NN_.../*.ino — keep them in sync when either side changes.

export const CIRCUITS = {
  1: {
    components: [
      { id: 'btn', type: 'button', x: 70, y: 100, label: 'Tugma' },
      { id: 'led', type: 'led', x: 250, y: 100, label: 'LED' },
      { id: 'res', type: 'resistor', x: 330, y: 100, label: '220Ω' },
    ],
    wires: [
      { from: 'btn.pin', to: 'D2', color: 'signal' },
      { from: 'btn.gnd', to: 'GND', color: 'ground' },
      { from: 'led.anode', to: 'res.left', color: 'signal2' },
      { from: 'res.right', to: 'D8', color: 'signal2' },
      { from: 'led.cathode', to: 'GND', color: 'ground' },
    ],
  },
  2: {
    components: [
      { id: 'pot', type: 'potentiometer', x: 90, y: 100, label: 'Potentsiometr' },
      { id: 'led', type: 'led', x: 270, y: 100, label: 'LED' },
      { id: 'res', type: 'resistor', x: 350, y: 100, label: '220Ω' },
    ],
    wires: [
      { from: 'pot.left', to: '5V', color: 'power' },
      { from: 'pot.right', to: 'GND', color: 'ground' },
      { from: 'pot.wiper', to: 'A0', color: 'signal' },
      { from: 'led.anode', to: 'res.left', color: 'signal2' },
      { from: 'res.right', to: 'D9', color: 'signal2' },
      { from: 'led.cathode', to: 'GND', color: 'ground' },
    ],
  },
  3: {
    components: [
      { id: 'ldr', type: 'sensorBoard', x: 90, y: 100, label: 'LDR + 10k', pins: ['5V', 'A1', 'GND'] },
      { id: 'led', type: 'led', x: 270, y: 100, label: 'LED' },
      { id: 'res', type: 'resistor', x: 350, y: 100, label: '220Ω' },
    ],
    wires: [
      { from: 'ldr.5V', to: '5V', color: 'power' },
      { from: 'ldr.A1', to: 'A1', color: 'signal' },
      { from: 'ldr.GND', to: 'GND', color: 'ground' },
      { from: 'led.anode', to: 'res.left', color: 'signal2' },
      { from: 'res.right', to: 'D10', color: 'signal2' },
      { from: 'led.cathode', to: 'GND', color: 'ground' },
    ],
  },
  4: {
    components: [
      { id: 'btn', type: 'button', x: 80, y: 100, label: 'Tugma' },
      { id: 'buz', type: 'buzzer', x: 260, y: 100, label: 'Buzzer' },
    ],
    wires: [
      { from: 'btn.pin', to: 'D2', color: 'signal' },
      { from: 'btn.gnd', to: 'GND', color: 'ground' },
      { from: 'buz.pin', to: 'D8', color: 'signal2' },
      { from: 'buz.gnd', to: 'GND', color: 'ground' },
    ],
  },
  5: {
    components: [
      { id: 'rgb', type: 'rgbled', x: 240, y: 100, label: 'RGB LED (umumiy katod)' },
    ],
    wires: [
      { from: 'rgb.r', to: 'D9', color: 'power' },
      { from: 'rgb.g', to: 'D10', color: 'signal3' },
      { from: 'rgb.b', to: 'D11', color: 'signal' },
      { from: 'rgb.gnd', to: 'GND', color: 'ground' },
    ],
  },
  6: {
    components: [
      { id: 'srv', type: 'servo', x: 150, y: 100, label: 'Servo' },
      { id: 'pot', type: 'potentiometer', x: 330, y: 100, label: 'Potentsiometr (ixtiyoriy)' },
    ],
    wires: [
      { from: 'srv.signal', to: 'D9', color: 'signal' },
      { from: 'srv.vcc', to: '5V', color: 'power' },
      { from: 'srv.gnd', to: 'GND', color: 'ground' },
      { from: 'pot.left', to: '5V', color: 'power' },
      { from: 'pot.right', to: 'GND', color: 'ground' },
      { from: 'pot.wiper', to: 'A0', color: 'signal2' },
    ],
  },
  7: {
    components: [
      { id: 'us', type: 'sensorBoard', x: 220, y: 100, label: 'HC-SR04', pins: ['VCC', 'TRIG', 'ECHO', 'GND'] },
    ],
    wires: [
      { from: 'us.VCC', to: '5V', color: 'power' },
      { from: 'us.TRIG', to: 'D7', color: 'signal' },
      { from: 'us.ECHO', to: 'D6', color: 'signal2' },
      { from: 'us.GND', to: 'GND', color: 'ground' },
    ],
  },
  8: {
    components: [
      { id: 'pir', type: 'sensorBoard', x: 220, y: 100, label: 'PIR HC-SR501', pins: ['VCC', 'OUT', 'GND'] },
    ],
    wires: [
      { from: 'pir.VCC', to: '5V', color: 'power' },
      { from: 'pir.OUT', to: 'D4', color: 'signal' },
      { from: 'pir.GND', to: 'GND', color: 'ground' },
    ],
  },
  9: {
    components: [
      { id: 'dht', type: 'sensorBoard', x: 220, y: 100, label: 'DHT11', pins: ['VCC', 'DATA', 'GND'] },
    ],
    wires: [
      { from: 'dht.VCC', to: '5V', color: 'power' },
      { from: 'dht.DATA', to: 'D2', color: 'signal' },
      { from: 'dht.GND', to: 'GND', color: 'ground' },
    ],
  },
  10: {
    components: [
      { id: 'sw', type: 'sensorBoard', x: 220, y: 100, label: 'SW-420', pins: ['VCC', 'DO', 'GND'] },
    ],
    wires: [
      { from: 'sw.VCC', to: '5V', color: 'power' },
      { from: 'sw.DO', to: 'D3', color: 'signal' },
      { from: 'sw.GND', to: 'GND', color: 'ground' },
    ],
  },
  11: {
    components: [
      { id: 'fl', type: 'sensorBoard', x: 220, y: 100, label: 'Flame sensor', pins: ['VCC', 'DO', 'GND'] },
    ],
    wires: [
      { from: 'fl.VCC', to: '5V', color: 'power' },
      { from: 'fl.DO', to: 'D5', color: 'signal' },
      { from: 'fl.GND', to: 'GND', color: 'ground' },
    ],
  },
  12: {
    components: [
      { id: 'mq', type: 'sensorBoard', x: 220, y: 100, label: 'MQ-2', pins: ['VCC', 'AOUT', 'GND'] },
    ],
    wires: [
      { from: 'mq.VCC', to: '5V', color: 'power' },
      { from: 'mq.AOUT', to: 'A2', color: 'signal' },
      { from: 'mq.GND', to: 'GND', color: 'ground' },
    ],
  },
  13: {
    components: [
      { id: 'snd', type: 'sensorBoard', x: 220, y: 100, label: 'Ovoz sensori', pins: ['VCC', 'DO', 'GND'] },
    ],
    wires: [
      { from: 'snd.VCC', to: '5V', color: 'power' },
      { from: 'snd.DO', to: 'D4', color: 'signal' },
      { from: 'snd.GND', to: 'GND', color: 'ground' },
    ],
  },
  14: {
    components: [
      { id: 'rn', type: 'sensorBoard', x: 220, y: 100, label: "Yomg'ir sensori", pins: ['VCC', 'AOUT', 'GND'] },
    ],
    wires: [
      { from: 'rn.VCC', to: '5V', color: 'power' },
      { from: 'rn.AOUT', to: 'A3', color: 'signal' },
      { from: 'rn.GND', to: 'GND', color: 'ground' },
    ],
  },
  15: {
    components: [
      { id: 'reed', type: 'reed', x: 220, y: 100, label: 'Reed switch' },
    ],
    wires: [
      { from: 'reed.a', to: 'D5', color: 'signal' },
      { from: 'reed.b', to: 'GND', color: 'ground' },
    ],
  },
  16: {
    components: [
      { id: 'joy', type: 'sensorBoard', x: 220, y: 100, label: 'Joystick', pins: ['VCC', 'VRx', 'GND'] },
    ],
    wires: [
      { from: 'joy.VCC', to: '5V', color: 'power' },
      { from: 'joy.VRx', to: 'A4', color: 'signal' },
      { from: 'joy.GND', to: 'GND', color: 'ground' },
    ],
  },
  17: {
    components: [
      { id: 'btn', type: 'button', x: 220, y: 100, label: 'Tugma' },
    ],
    wires: [
      { from: 'btn.pin', to: 'D2', color: 'signal' },
      { from: 'btn.gnd', to: 'GND', color: 'ground' },
    ],
  },
  18: {
    components: [
      { id: 'ir', type: 'sensorBoard', x: 220, y: 100, label: 'IR qabul qiluvchi', pins: ['VCC', 'OUT', 'GND'] },
    ],
    wires: [
      { from: 'ir.VCC', to: '5V', color: 'power' },
      { from: 'ir.OUT', to: 'D11', color: 'signal' },
      { from: 'ir.GND', to: 'GND', color: 'ground' },
    ],
  },
  19: {
    components: [
      { id: 'btnA', type: 'button', x: 70, y: 100, label: 'Tugma A' },
      { id: 'btnB', type: 'button', x: 190, y: 100, label: 'Tugma B' },
      { id: 'ledA', type: 'led', x: 320, y: 80, label: 'LED A', color: '#ff9c5c' },
      { id: 'ledB', type: 'led', x: 400, y: 80, label: 'LED B', color: '#5cc8ff' },
    ],
    wires: [
      { from: 'btnA.pin', to: 'D2', color: 'signal' },
      { from: 'btnA.gnd', to: 'GND', color: 'ground' },
      { from: 'btnB.pin', to: 'D3', color: 'signal2' },
      { from: 'btnB.gnd', to: 'GND', color: 'ground' },
      { from: 'ledA.anode', to: 'D8', color: 'signal3' },
      { from: 'ledA.cathode', to: 'GND', color: 'ground' },
      { from: 'ledB.anode', to: 'D9', color: 'signal3' },
      { from: 'ledB.cathode', to: 'GND', color: 'ground' },
    ],
  },
  20: {
    components: [
      { id: 'ldr', type: 'sensorBoard', x: 55, y: 90, label: 'LDR (A1)', pins: ['5V', 'A1', 'GND'] },
      { id: 'btn', type: 'button', x: 160, y: 90, label: 'Tugma (D2)' },
      { id: 'buz', type: 'buzzer', x: 250, y: 90, label: 'Buzzer (D8)' },
      { id: 'srv', type: 'servo', x: 340, y: 90, label: 'Servo (D9)' },
      { id: 'rgb', type: 'rgbled', x: 430, y: 90, label: 'RGB (D10-12)' },
    ],
    wires: [
      { from: 'ldr.5V', to: '5V', color: 'power' },
      { from: 'ldr.A1', to: 'A1', color: 'signal' },
      { from: 'ldr.GND', to: 'GND', color: 'ground' },
      { from: 'btn.pin', to: 'D2', color: 'signal2' },
      { from: 'btn.gnd', to: 'GND', color: 'ground' },
      { from: 'buz.pin', to: 'D8', color: 'signal3' },
      { from: 'buz.gnd', to: 'GND', color: 'ground' },
      { from: 'srv.signal', to: 'D9', color: 'signal' },
      { from: 'srv.vcc', to: '5V', color: 'power' },
      { from: 'srv.gnd', to: 'GND', color: 'ground' },
      { from: 'rgb.r', to: 'D10', color: 'power' },
      { from: 'rgb.g', to: 'D11', color: 'signal3' },
      { from: 'rgb.b', to: 'D12', color: 'signal' },
      { from: 'rgb.gnd', to: 'GND', color: 'ground' },
    ],
  },
};
