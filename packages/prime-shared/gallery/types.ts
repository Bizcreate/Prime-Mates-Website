export type GalleryItem = {
    id: string;
    title: string;
    url: string;
    path?: string;
    authorUid?: string;
    tags?: string[];
    createdAt?: number;
    createdAtServer?: unknown;
  };
  