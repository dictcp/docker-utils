import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import dgram from 'node:dgram';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

const binary = process.argv[2];
assert.ok(binary, 'Usage: node tests/sniproxy-smoke.ts /path/to/sniproxy');
const upstream = dgram.createSocket('udp4');
await new Promise<void>((resolve, reject) => {
  upstream.once('error', reject);
  upstream.bind(0, '127.0.0.1', resolve);
});
upstream.on('message', (query, remote) => {
  const response = Buffer.from(query);
  response.writeUInt16BE(0x8180, 2);
  response.writeUInt16BE(1, 6);
  const answer = Buffer.from([0xc0, 0x0c, 0, 1, 0, 1, 0, 0, 0, 60, 0, 4, 198, 51, 100, 99]);
  upstream.send(Buffer.concat([response, answer]), remote.port, remote.address);
});
const probe = dgram.createSocket('udp4');
await new Promise<void>((resolve, reject) => {
  probe.once('error', reject);
  probe.bind(0, '127.0.0.1', resolve);
});
const port = (probe.address() as net.AddressInfo).port;
await new Promise<void>((resolve) => probe.close(resolve));
const child = spawn(binary, [
  '--dns-address=127.0.0.1', `--dns-port=${port}`,
  `--dns-upstream=127.0.0.1:${(upstream.address() as net.AddressInfo).port}`,
  '--dns-redirect-rule=rewrite.test', '--dns-redirect-ipv4-to=198.51.100.42',
  '--http-address=127.0.0.1', '--http-port=0',
  '--tls-address=127.0.0.1', '--tls-port=0',
], { stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
child.stdout.on('data', (data) => { output = (output + data).slice(-8000); });
child.stderr.on('data', (data) => { output = (output + data).slice(-8000); });
const exited = new Promise<number | null>((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', resolve);
});
function question(name: string): Buffer {
  const header = Buffer.from([0x12, 0x34, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
  const labels = name.split('.').flatMap((label) => [Buffer.from([label.length]), Buffer.from(label)]);
  return Buffer.concat([header, ...labels, Buffer.from([0, 0, 1, 0, 1])]);
}
function udp(name: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    const timer = setTimeout(() => { socket.close(); reject(new Error('DNS timeout')); }, 500);
    socket.once('error', (error) => { clearTimeout(timer); socket.close(); reject(error); });
    socket.once('message', (message) => { clearTimeout(timer); socket.close(); resolve(message); });
    socket.send(question(name), port, '127.0.0.1');
  });
}
function tcp(name: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1');
    let response = Buffer.alloc(0);
    socket.setTimeout(1000, () => socket.destroy(new Error('TCP DNS timeout')));
    socket.once('error', reject);
    socket.once('connect', () => {
      const message = question(name);
      const length = Buffer.alloc(2);
      length.writeUInt16BE(message.length);
      socket.write(Buffer.concat([length, message]));
    });
    socket.on('data', (data) => {
      response = Buffer.concat([response, data]);
      if (response.length >= 2 && response.length >= response.readUInt16BE(0) + 2) {
        socket.end();
        resolve(response.subarray(2, response.readUInt16BE(0) + 2));
      }
    });
  });
}
function check(response: Buffer, address: number): void {
  assert.equal(response.readUInt16BE(0), 0x1234);
  assert.equal(response.readUInt16BE(2) & 15, 0);
  assert.equal(response.readUInt16BE(6), 1);
  assert.deepEqual([...response.subarray(-4)], [198, 51, 100, address]);
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    try { check(await udp('rewrite.test'), 42); ready = true; break; }
    catch { if (child.exitCode !== null) break; await delay(50); }
  }
  assert.ok(ready, `SNIProxy did not become ready:\n${output}`);
  check(await udp('forward.test'), 99);
  check(await tcp('rewrite.test'), 42);
  check(await tcp('forward.test'), 99);
  console.log('DNS rewrite and upstream forwarding passed over UDP and TCP');
} finally {
  child.kill('SIGTERM');
  const force = setTimeout(() => child.kill('SIGKILL'), 3000);
  try { assert.equal(await exited, 0, output); }
  finally { clearTimeout(force); upstream.close(); }
}
