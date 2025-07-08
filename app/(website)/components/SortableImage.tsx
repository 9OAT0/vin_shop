'use client';

import React from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageProps {
  id: string;
  src: string;
  onRemove: (id: string) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ id, src, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-24 h-24 border rounded overflow-hidden"
      {...attributes}
      {...listeners}
    >
      <Image
        src={src}
        alt="Product"
        fill
        className="object-cover"
      />
      <button
        onClick={() => onRemove(id)}
        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
};

export default SortableImage;
