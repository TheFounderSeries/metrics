import React from 'react';

interface InlineLinkRendererProps {
  text: string;
  className?: string;
  onImageClick?: (imageSrc: string) => void;
}

/**
 * Renders text with inline links using markdown-like syntax:
 * - [Link Text](https://example.com) for URLs
 * - [Image Text](image:path/to/image.jpg) for images
 * - Regular text remains unchanged
 */
const InlineLinkRenderer: React.FC<InlineLinkRendererProps> = ({ 
  text, 
  className = '', 
  onImageClick 
}) => {
  if (!text) return null;

  // Regex to match [text](url) or [text](image:path) patterns
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, linkText, linkUrl] = match;
    const matchStart = match.index;

    // Add text before the link
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }

    // Process the link
    if (linkUrl.startsWith('image:')) {
      const imageSrc = linkUrl.slice(6); // Remove 'image:' prefix
      parts.push(
        <span
          key={matchStart}
          className="text-blue-600 underline cursor-pointer hover:text-blue-800"
          onClick={() => onImageClick?.(imageSrc)}
        >
          {linkText}
        </span>
      );
    } else if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
      parts.push(
        <a
          key={matchStart}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {linkText}
        </a>
      );
    } else {
      // Invalid link format, render as plain text
      parts.push(fullMatch);
    }

    lastIndex = linkRegex.lastIndex;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <div className={className}>{parts}</div>;
};

export default InlineLinkRenderer;
