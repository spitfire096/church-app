"use client";

import { useState } from 'react';

interface EditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function Editor({ initialContent = '', onChange }: EditorProps) {
  const [content, setContent] = useState(initialContent);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
  };

  return (
    <div className="w-full">
      <textarea
        className="w-full min-h-[200px] p-4 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={content}
        onChange={handleChange}
        placeholder="Enter your content here..."
      />
    </div>
  );
} 