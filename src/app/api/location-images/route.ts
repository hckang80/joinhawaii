import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const LOCATION_IMAGE_BUCKET = 'location-images';
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getFileExtension(mimeType: string, fileName: string) {
  const extensionByMimeType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  if (extensionByMimeType[mimeType]) {
    return extensionByMimeType[mimeType];
  }

  const byName = fileName.split('.').pop()?.toLowerCase();
  return byName || 'jpg';
}

function sanitizeFolder(folder: string) {
  return folder
    .trim()
    .replace(/^\/+/, '')
    .replace(/\.{2,}/g, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '');
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: '지원하지 않는 이미지 형식입니다. (jpg, png, webp만 가능)' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { message: '이미지 파일 용량은 10MB 이하만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    const defaultFolder = `reservations/${user.id}`;
    const folderInput = String(formData.get('folder') || defaultFolder);
    const sanitizedFolder = sanitizeFolder(folderInput);
    const folder = sanitizedFolder || defaultFolder;
    const extension = getFileExtension(file.type, file.name);
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(LOCATION_IMAGE_BUCKET)
      .upload(path, fileBuffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      return NextResponse.json(
        { message: uploadError.message || '이미지 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage.from(LOCATION_IMAGE_BUCKET).getPublicUrl(path);

    return NextResponse.json({
      bucket: LOCATION_IMAGE_BUCKET,
      path,
      url: publicData.publicUrl
    });
  } catch {
    return NextResponse.json({ message: '이미지 업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const path = (url.searchParams.get('path') || '').trim().replace(/^\/+/, '');
    const allowedPrefix = `reservations/${user.id}/`;

    if (!path || path.includes('..') || !path.startsWith(allowedPrefix)) {
      return NextResponse.json({ message: '유효하지 않은 경로입니다.' }, { status: 400 });
    }

    const { data: publicData } = supabase.storage.from(LOCATION_IMAGE_BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicData.publicUrl, path });
  } catch {
    return NextResponse.json(
      { message: '이미지 URL 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
