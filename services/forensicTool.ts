import exifr from 'exifr';

export interface ExtractedMetadata {
  make: string | null;
  model: string | null;
  software: string | null;
  dateTime: string | null;
  gps: {
    latitude: number;
    longitude: number;
  } | null;
  fileType: string;
  fileSize: number;
  magicBytesVerified: boolean;
  mimeType: string;
}

// Check Magic Bytes to verify file signature (Cyber Forensic Technique)
const verifyMagicBytes = async (file: File): Promise<{ verified: boolean; type: string }> => {
  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const header = bytes.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0').toUpperCase(), '');

  // JPEG
  if (header.startsWith('FFD8FF')) return { verified: true, type: 'JPEG' };
  // PNG
  if (header.startsWith('89504E47')) return { verified: true, type: 'PNG' };
  // TIFF (Intel or Motorola)
  if (header.startsWith('49492A00') || header.startsWith('4D4D002A')) return { verified: true, type: 'TIFF' };
  // WEBP (RIFF....WEBP)
  if (header.startsWith('52494646')) return { verified: true, type: 'WEBP' };

  return { verified: false, type: 'UNKNOWN' };
};

export const extractForensics = async (file: File): Promise<ExtractedMetadata> => {
  let tags: any = null;
  
  try {
    // Parse standard EXIF, XMP, ICC, IPTC
    tags = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: true,
      jfif: true,
      gps: true,
    });
  } catch (e) {
    console.warn("EXIF extraction failed or no data found", e);
  }

  const magicCheck = await verifyMagicBytes(file);

  return {
    make: tags?.Make || tags?.make || null,
    model: tags?.Model || tags?.model || null,
    software: tags?.Software || tags?.software || tags?.CreatorTool || null,
    dateTime: tags?.DateTimeOriginal || tags?.CreateDate || tags?.ModifyDate || null,
    gps: (tags?.latitude && tags?.longitude) ? {
      latitude: tags.latitude,
      longitude: tags.longitude
    } : null,
    fileType: magicCheck.type,
    mimeType: file.type,
    fileSize: file.size,
    magicBytesVerified: magicCheck.verified
  };
};