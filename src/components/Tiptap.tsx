'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

import { Box, Button, Flex, IconButton, Separator, Tooltip } from '@radix-ui/themes';
import type { Editor } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import FileHandler from '@tiptap/extension-file-handler';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo,
  Strikethrough,
  Undo
} from 'lucide-react';
import { ResizableImage } from 'tiptap-extension-resizable-image';
import styles from './tiptap.module.css';

interface TiptapProps {
  value: string;
  onChange: (content: string) => void;
  enableImage?: boolean;
  imageUploadFolder?: string;
  simpleMode?: boolean;
  height?: string;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => boolean;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
}

const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1920;
const IMAGE_OUTPUT_QUALITY = 0.85;
const MAX_IMAGE_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('이미지 데이터를 읽을 수 없습니다.'));
    };

    reader.onerror = () => {
      reject(new Error('이미지 파일 읽기에 실패했습니다.'));
    };

    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
    img.src = src;
  });

const resizeImageDataUrlIfNeeded = async (file: File) => {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const shouldResize = image.width > MAX_IMAGE_WIDTH || image.height > MAX_IMAGE_HEIGHT;

  if (!shouldResize) {
    return sourceDataUrl;
  }

  const scale = Math.min(MAX_IMAGE_WIDTH / image.width, MAX_IMAGE_HEIGHT / image.height);
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    return sourceDataUrl;
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const resizedDataUrl = canvas.toDataURL(outputType, IMAGE_OUTPUT_QUALITY);

  return resizedDataUrl;
};

const dataUrlToFile = async (dataUrl: string, fileName: string, mimeType: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
};

async function uploadImageToStorage(file: File, imageUploadFolder?: string) {
  if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    throw new Error('이미지 파일 용량은 15MB 이하만 업로드할 수 있습니다.');
  }

  const resizedImageDataUrl = await resizeImageDataUrlIfNeeded(file);
  const uploadFile = await dataUrlToFile(
    resizedImageDataUrl,
    file.name,
    file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  );

  const formData = new FormData();
  formData.append('file', uploadFile);

  if (imageUploadFolder) {
    formData.append('folder', imageUploadFolder);
  }

  const response = await fetch('/api/location-images', {
    method: 'POST',
    body: formData
  });

  const responseJson = (await response.json()) as {
    url?: string;
    path?: string;
    message?: string;
  };

  if (!response.ok || !responseJson.url) {
    throw new Error(responseJson.message || '이미지 업로드에 실패했습니다.');
  }

  return {
    url: responseJson.url,
    path: responseJson.path || ''
  };
}

async function insertUploadedImage(
  currentEditor: Editor,
  file: File,
  imageUploadFolder?: string,
  position?: number
) {
  const { url, path } = await uploadImageToStorage(file, imageUploadFolder);

  const imageNode = {
    type: 'image',
    attrs: {
      src: url,
      alt: file.name,
      'data-storage-path': path,
      'data-keep-ratio': false,
      width: null,
      height: null
    }
  };

  if (typeof position === 'number') {
    currentEditor.chain().insertContentAt(position, imageNode).focus().run();
    return;
  }

  currentEditor.chain().focus().insertContent(imageNode).run();
}

export const Tiptap = ({
  value,
  onChange,
  enableImage = false,
  imageUploadFolder,
  simpleMode = false,
  height = 'min-h-[400px]',
  placeholder = '이미지를 올려놓거나 붙여넣기, 선택 후 리사이즈가 가능합니다.'
}: TiptapProps) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      ResizableImage.configure({
        withCaption: false,
        defaultWidth: undefined,
        defaultHeight: undefined
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image']
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          void (async () => {
            for (const file of files) {
              try {
                await insertUploadedImage(currentEditor, file, imageUploadFolder, pos);
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
                window.alert(message);
              }
            }
          })();
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) return false;

          void (async () => {
            for (const file of files) {
              try {
                await insertUploadedImage(
                  currentEditor,
                  file,
                  imageUploadFolder,
                  currentEditor.state.selection.anchor
                );
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
                window.alert(message);
              }
            }
          })();

          return true;
        }
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
        class: clsx(
          `prose-sm prose max-w-none focus:outline-none ${height} max-h-[880px] overflow-y-auto`,
          { 'has-content': value.length > 0 }
        )
      }
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onSelectionUpdate: forceUpdate
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // 이미지 업로드 핸들러
  const handleImageUpload = () => {
    fileInputRef.current?.click();
    return false;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void (async () => {
      if (editor) {
        try {
          await insertUploadedImage(editor, file, imageUploadFolder);
        } catch (error) {
          const message = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
          window.alert(message);
        }
      }
    })();

    event.target.value = '';
  };

  // 링크 추가 함수
  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return false;
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return false;
    }

    // update link
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    return false;
  }, [editor]);

  // 텍스트 색상 변경 함수
  const setTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
    return false;
  };

  // 배경색 변경 함수
  const setHighlight = (color: string) => {
    editor?.chain().focus().toggleHighlight({ color }).run();
    return false;
  };

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, children, title }: ToolbarButtonProps) => (
    <Tooltip content={title}>
      <IconButton
        type='button'
        variant={isActive ? 'solid' : 'soft'}
        color={isActive ? 'indigo' : 'gray'}
        onClick={onClick}
        size='2'
        aria-label={title}
      >
        {children}
      </IconButton>
    </Tooltip>
  );

  const ColorButton = ({
    color,
    onClick,
    title
  }: {
    color: string;
    onClick: () => void;
    title: string;
  }) => (
    <Tooltip content={title}>
      <Button
        type='button'
        className={styles['tiptap-color-button']}
        style={{ '--color': color } as React.CSSProperties}
        onClick={onClick}
        aria-label={title}
        variant='soft'
      />
    </Tooltip>
  );

  return (
    <Box className={styles['tiptap-root']}>
      <Flex wrap='wrap' align='center' gap='2' p='3' className={styles['tiptap-toolbar']}>
        {/* 스타일 그룹 */}
        {!simpleMode && (
          <Flex align='center' gap='1'>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title='Bold'
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title='Italic'
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title='Strikethrough'
            >
              <Strikethrough size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title='Code'
            >
              <Code size={16} />
            </ToolbarButton>
          </Flex>
        )}

        {!simpleMode && (
          <>
            <Separator orientation='vertical' />

            {/* 단락 그룹 */}
            <Flex align='center' gap='1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title='Heading 1'
              >
                <Heading1 size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title='Heading 2'
              >
                <Heading2 size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title='Heading 3'
              >
                <Heading3 size={16} />
              </ToolbarButton>
            </Flex>

            <Separator orientation='vertical' />

            {/* 목록 그룹 */}
            <Flex align='center' gap='1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title='Bullet List'
              >
                <List size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title='Numbered List'
              >
                <ListOrdered size={16} />
              </ToolbarButton>
            </Flex>

            <Separator orientation='vertical' />

            {/* 정렬 그룹 */}
            <Flex align='center' gap='1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title='Align Left'
              >
                <AlignLeft size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title='Align Center'
              >
                <AlignCenter size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title='Align Right'
              >
                <AlignRight size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                title='Justify'
              >
                <AlignJustify size={16} />
              </ToolbarButton>
            </Flex>

            <Separator orientation='vertical' />

            {/* 색상 그룹 */}
            <Flex align='center' gap='2'>
              <Flex align='center' gap='1'>
                <Palette size={16} className='text-gray-600' />
                <ColorButton
                  color='#171717'
                  onClick={() => setTextColor('#171717')}
                  title='Black'
                />
                <ColorButton color='#ef4444' onClick={() => setTextColor('#ef4444')} title='Red' />
                <ColorButton
                  color='#f97316'
                  onClick={() => setTextColor('#f97316')}
                  title='Orange'
                />
                <ColorButton
                  color='#eab308'
                  onClick={() => setTextColor('#eab308')}
                  title='Yellow'
                />
                <ColorButton
                  color='#22c55e'
                  onClick={() => setTextColor('#22c55e')}
                  title='Green'
                />
                <ColorButton color='#3b82f6' onClick={() => setTextColor('#3b82f6')} title='Blue' />
              </Flex>
              <Flex align='center' gap='1'>
                <Highlighter size={16} className='text-gray-600' />
                <ColorButton
                  color='#fef3c7'
                  onClick={() => setHighlight('#fef3c7')}
                  title='Yellow Highlight'
                />
                <ColorButton
                  color='#fecaca'
                  onClick={() => setHighlight('#fecaca')}
                  title='Red Highlight'
                />
                <ColorButton
                  color='#d1fae5'
                  onClick={() => setHighlight('#d1fae5')}
                  title='Green Highlight'
                />
                <ColorButton
                  color='#dbeafe'
                  onClick={() => setHighlight('#dbeafe')}
                  title='Blue Highlight'
                />
              </Flex>
            </Flex>
          </>
        )}

        {/* 콘텐츠 삽입 그룹 */}
        <Flex align='center' gap='1'>
          {!simpleMode && (
            <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title='Insert Link'>
              <LinkIcon size={16} />
            </ToolbarButton>
          )}
          {enableImage && (
            <ToolbarButton onClick={handleImageUpload} isActive={false} title='Insert Image'>
              <ImageIcon size={16} />
            </ToolbarButton>
          )}
          {!simpleMode && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title='Quote'
              >
                <Quote size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                isActive={false}
                title='Horizontal Rule'
              >
                <Minus size={16} />
              </ToolbarButton>
            </>
          )}
        </Flex>

        {!simpleMode && (
          <>
            <Separator orientation='vertical' />

            {/* 기록 그룹 */}
            <Flex align='center' gap='1'>
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                isActive={false}
                title='Undo'
              >
                <Undo size={16} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                isActive={false}
                title='Redo'
              >
                <Redo size={16} />
              </ToolbarButton>
            </Flex>
          </>
        )}
      </Flex>

      <Box p='4'>
        <EditorContent editor={editor} />
      </Box>

      {enableImage && (
        <Box display='none'>
          <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileChange} />
        </Box>
      )}
    </Box>
  );
};
