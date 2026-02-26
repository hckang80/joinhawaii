'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

import { Box, Button, Flex, IconButton, Separator, Tooltip } from '@radix-ui/themes';
import { Color } from '@tiptap/extension-color';
import FileHandler from '@tiptap/extension-file-handler';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
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
  height?: string;
  hasContent?: boolean;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => boolean;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
}

export const Tiptap = ({
  value,
  onChange,
  enableImage = false,
  height = 'min-h-[400px]',
  hasContent = false,
  placeholder = '이미지를 올려놓거나 붙여넣기, 선택 후 리사이즈가 가능합니다.'
}: TiptapProps) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      ResizableImage.configure({
        withCaption: false
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
          files.forEach(file => {
            const fileReader = new FileReader();

            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result
                  }
                })
                .focus()
                .run();
            };
          });
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) return false;

          files.forEach(file => {
            const fileReader = new FileReader();

            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result
                  }
                })
                .focus()
                .run();
            };
          });
        }
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
        class: clsx(
          `prose-sm prose max-w-none focus:outline-none ${height} max-h-[880px] overflow-y-auto`,
          { 'has-content': hasContent }
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

    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target?.result as string;
      if (editor && base64) {
        editor.chain().focus().setImage({ src: base64 }).run();
      }
    };
    reader.readAsDataURL(file);

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
            <ColorButton color='#171717' onClick={() => setTextColor('#171717')} title='Black' />
            <ColorButton color='#ef4444' onClick={() => setTextColor('#ef4444')} title='Red' />
            <ColorButton color='#f97316' onClick={() => setTextColor('#f97316')} title='Orange' />
            <ColorButton color='#eab308' onClick={() => setTextColor('#eab308')} title='Yellow' />
            <ColorButton color='#22c55e' onClick={() => setTextColor('#22c55e')} title='Green' />
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

        <Separator orientation='vertical' />

        {/* 콘텐츠 삽입 그룹 */}
        <Flex align='center' gap='1'>
          <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title='Insert Link'>
            <LinkIcon size={16} />
          </ToolbarButton>
          {enableImage && (
            <ToolbarButton onClick={handleImageUpload} isActive={false} title='Insert Image'>
              <ImageIcon size={16} />
            </ToolbarButton>
          )}
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
        </Flex>

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
