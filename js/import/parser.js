import sax from '../../vendor/sax.js?v=0.5.2';
import { decodeCP437 } from './encoding.js?v=0.5.2';
export const PARSER_VERSION = 1;
const CHUNK = 64 * 1024;
function add(object, key, value) {
  if (!Object.hasOwn(object, key)) object[key] = value;
  else if (Array.isArray(object[key])) object[key].push(value);
  else object[key] = [object[key], value];
}
function valueOf(frame) {
  const value = frame.text.trim();
  if (!Object.keys(frame.children).length) return value;
  if (value) frame.children._text = value;
  return frame.children;
}
/** Parse bounded XML chunks, emitting batches of raw records without a DOM. */
export async function parseXML(file, onBatch, onProgress = () => {}) {
  const header = new TextDecoder().decode(await file.slice(0, 1024).arrayBuffer());
  const xmlVersion = header.match(/<\?xml\s+version\s*=\s*['"]([^'"]+)/i)?.[1] || '1.0';
  if(xmlVersion !== '1.0') throw Error(`Unsupported XML version: ${xmlVersion}`);
  const encoding = header.match(/encoding\s*=\s*['"]([^'"]+)/i)?.[1]?.toLowerCase() || 'utf-8';
  if (!['utf-8', 'utf8', 'cp437', 'ibm437'].includes(encoding)) throw Error(`Unsupported XML encoding: ${encoding}`);
  const cp437 = encoding === 'cp437' || encoding === 'ibm437';
  const decoder = cp437 ? null : new TextDecoder('utf-8', { fatal: true });
  const parser = sax.parser(true, { trim: false, normalize: false, strictEntities: true });
  let batch = [], stack = [], rootSeen = false, removedControls = 0, records = 0;
  const sequence = new Map(), seen = new Set(), meta = Object.create(null);
  parser.onerror = error => { throw Error(`Invalid XML in ${file.name}: ${error.message}`); };
  parser.ondoctype = () => { throw Error('DTD declarations are not supported.'); };
  parser.onopentag = tag => {
    if (stack.length >= 64) throw Error('XML nesting exceeds 64 levels.');
    if (!stack.length) {
      if (rootSeen || tag.name !== 'df_world') throw Error('Expected one df_world root.');
      rootSeen = true;
    }
    stack.push({name: tag.name, children: Object.create(null), text: ''});
  };
  const appendText = text => {
    if (stack.length) {
      const frame = stack.at(-1);
      frame.text += text;
      if (frame.text.length > 2 * 1024 * 1024) throw Error('An XML text field exceeds the 2 MiB limit.');
    }
  };
  parser.ontext = appendText;
  parser.oncdata = appendText;
  parser.onclosetag = () => {
    const depth = stack.length, frame = stack.pop(), value = valueOf(frame);
    if (depth === 3) {
      const kind = stack[1].name;
      const index = sequence.get(kind) || 0; sequence.set(kind, index + 1);
      const id = typeof value === 'object' && typeof value.id === 'string' ? value.id : `@${index}`;
      const key = `${kind}\0${id}`;
      if (seen.has(key)) throw Error(`Duplicate ${kind} ID ${id} in ${file.name}`);
      seen.add(key);
      batch.push({kind, id, data: value}); records++;
    } else if (depth > 3) add(stack.at(-1).children, frame.name, value);
    else if (depth === 2 && typeof value === 'string' && value) meta[frame.name] = value;
  };
  for (let offset = 0; offset < file.size; offset += CHUNK) {
    const bytes = new Uint8Array(await file.slice(offset, offset + CHUNK).arrayBuffer());
    let text = cp437 ? decodeCP437(bytes) : decoder.decode(bytes, {stream: true});
    text = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, () => { removedControls++; return ''; });
    parser.write(text);
    if (batch.length) { await onBatch(batch); batch = []; }
    onProgress({bytes: Math.min(offset + CHUNK, file.size), total: file.size, records});
  }
  if (decoder) parser.write(decoder.decode());
  parser.close();
  if (!rootSeen) throw Error('The XML file is empty or has no df_world root.');
  if (batch.length) await onBatch(batch);
  return {meta, removedControls, records, encoding};
}
