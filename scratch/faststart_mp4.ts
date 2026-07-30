/**
 * Pure TypeScript MP4 FastStart Re-ordering Utility
 * Relocates 'moov' atom from the end of the file to before 'mdat' for instant web streaming.
 */
export function relocateMoovToStart(buffer: Buffer): Buffer {
  let offset = 0;
  let ftypBox: { offset: number; size: number } | null = null;
  let moovBox: { offset: number; size: number } | null = null;
  let mdatBox: { offset: number; size: number } | null = null;

  const boxes: { type: string; size: number; offset: number }[] = [];

  while (offset < buffer.length - 8) {
    const size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);

    if (size < 8 || offset + size > buffer.length) break;

    const box = { type, size, offset };
    boxes.push(box);

    if (type === "ftyp") ftypBox = box;
    if (type === "moov") moovBox = box;
    if (type === "mdat") mdatBox = box;

    offset += size;
  }

  // If moov is already before mdat or missing, return original buffer
  if (!moovBox || !mdatBox || moovBox.offset < mdatBox.offset) {
    console.log("No moov relocation needed (already faststart or missing moov).");
    return buffer;
  }

  console.log(`Relocating 'moov' atom (${moovBox.size} bytes) from offset ${moovBox.offset} to before 'mdat'...`);

  // Extract moov buffer
  const moovBuffer = Buffer.from(buffer.subarray(moovBox.offset, moovBox.offset + moovBox.size));

  // Update stco / co64 chunk offset tables inside moovBuffer
  const moovSize = moovBox.size;
  patchChunkOffsets(moovBuffer, moovSize);

  // Construct new MP4 buffer: [ftyp] + [moov] + [everything else except old moov]
  const ftypEnd = ftypBox ? ftypBox.offset + ftypBox.size : 0;
  const beforeMoov = buffer.subarray(0, ftypEnd);
  const mdatAndOthers = buffer.subarray(ftypEnd, moovBox.offset);
  const afterMoov = buffer.subarray(moovBox.offset + moovBox.size);

  const newBuffer = Buffer.concat([beforeMoov, moovBuffer, mdatAndOthers, afterMoov]);
  console.log(`New faststart MP4 created! Total size: ${newBuffer.length} bytes.`);
  return newBuffer;
}

function patchChunkOffsets(moovBuffer: Buffer, delta: number) {
  let pos = 0;
  while (pos < moovBuffer.length - 8) {
    const size = moovBuffer.readUInt32BE(pos);
    const type = moovBuffer.toString("ascii", pos + 4, pos + 8);

    if (size < 8 || pos + size > moovBuffer.length) break;

    if (type === "stco") {
      // 32-bit chunk offset atom table
      const entryCount = moovBuffer.readUInt32BE(pos + 12);
      console.log(`Patching 'stco' atom at offset ${pos}: ${entryCount} chunk entries (+${delta} bytes)...`);
      for (let i = 0; i < entryCount; i++) {
        const entryOffset = pos + 16 + i * 4;
        const currentChunkOffset = moovBuffer.readUInt32BE(entryOffset);
        moovBuffer.writeUInt32BE(currentChunkOffset + delta, entryOffset);
      }
    } else if (type === "co64") {
      // 64-bit chunk offset atom table
      const entryCount = moovBuffer.readUInt32BE(pos + 12);
      console.log(`Patching 'co64' atom at offset ${pos}: ${entryCount} chunk entries (+${delta} bytes)...`);
      for (let i = 0; i < entryCount; i++) {
        const entryOffset = pos + 16 + i * 8;
        const currentChunkOffsetHigh = moovBuffer.readUInt32BE(entryOffset);
        const currentChunkOffsetLow = moovBuffer.readUInt32BE(entryOffset + 4);
        const BigIntVal = BigInt(currentChunkOffsetHigh) * BigInt(0x100000000) + BigInt(currentChunkOffsetLow);
        const newVal = BigIntVal + BigInt(delta);
        const newHigh = Number(newVal / BigInt(0x100000000));
        const newLow = Number(newVal % BigInt(0x100000000));
        moovBuffer.writeUInt32BE(newHigh, entryOffset);
        moovBuffer.writeUInt32BE(newLow, entryOffset + 4);
      }
    } else if (type === "moov" || type === "trak" || type === "mdia" || type === "minf" || type === "stbl") {
      // Recurse into container atoms
      patchChunkOffsets(moovBuffer.subarray(pos + 8, pos + size), delta);
    }

    pos += size;
  }
}
