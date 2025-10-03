import React, { useState, useRef } from 'react';

interface InlineLinkEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File, onSuccess: (href: string) => void) => void;
  isTextarea?: boolean;
}

/**
 * Enhanced text editor with inline link support
 * Supports markdown-like syntax: [text](url) and [text](image:path)
 */
const InlineLinkEditor: React.FC<InlineLinkEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  onImageUpload,
  isTextarea = false
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleSelectionChange = () => {
    if (inputRef.current) {
      setSelectionStart(inputRef.current.selectionStart || 0);
      setSelectionEnd(inputRef.current.selectionEnd || 0);
    }
  };

  const insertLink = (text: string, url: string) => {
    const linkMarkdown = `[${text}](${url})`;
    const beforeSelection = value.slice(0, selectionStart);
    const afterSelection = value.slice(selectionEnd);
    const newValue = beforeSelection + linkMarkdown + afterSelection;
    onChange(newValue);
    
    // Reset dialog state
    setShowLinkDialog(false);
    setLinkText('');
    setLinkUrl('');
  };

  const handleAddLink = () => {
    const selectedText = value.slice(selectionStart, selectionEnd);
    setLinkText(selectedText || '');
    setLinkUrl('');
    setShowLinkDialog(true);
  };

  const handleAddImage = () => {
    const selectedText = value.slice(selectionStart, selectionEnd);
    setLinkText(selectedText || '');
    setShowImageDialog(true);
  };

  const handleImageUpload = (file: File) => {
    if (onImageUpload) {
      onImageUpload(file, (href) => {
        insertLink(linkText || file.name, `image:${href}`);
        setShowImageDialog(false);
        setLinkText('');
      });
    }
  };

  const handleImageUrl = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      insertLink(linkText || 'Image', `image:${imageUrl}`);
      setShowImageDialog(false);
      setLinkText('');
    }
  };

  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className="relative">
      <InputComponent
        ref={inputRef as any}
        className={`w-full border border-black rounded-lg p-2 text-black pr-24 ${className}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onClick={handleSelectionChange}
      />
      
      {/* Toolbar */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button
          type="button"
          className="text-xs px-2 py-1 border border-black rounded hover:bg-gray-50"
          onClick={handleAddLink}
          title="Add link: [text](url)"
        >
          🔗
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 border border-black rounded hover:bg-gray-50"
          onClick={handleAddImage}
          title="Add image: [text](image:url)"
        >
          🖼️
        </button>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-black rounded-lg shadow-lg z-10">
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium mb-1">Link Text:</label>
              <input
                type="text"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter link text"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">URL:</label>
              <input
                type="url"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800"
                onClick={() => insertLink(linkText, linkUrl)}
                disabled={!linkText || !linkUrl}
              >
                Add Link
              </button>
              <button
                type="button"
                className="px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-black rounded-lg shadow-lg z-10">
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium mb-1">Image Text:</label>
              <input
                type="text"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter image description"
                autoFocus
              />
            </div>
            <div className="flex gap-2 pt-2">
              <label className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
              <button
                type="button"
                className="px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50"
                onClick={handleImageUrl}
              >
                Image URL
              </button>
              <button
                type="button"
                className="px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50"
                onClick={() => setShowImageDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 mt-1">
        Use [text](url) for links or select text and use toolbar buttons
      </div>
    </div>
  );
};

export default InlineLinkEditor;
