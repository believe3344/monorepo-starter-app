import { ApiResponse, ChapterDto, NovelDto, NovelStatus } from '@app/shared';
import { fetch } from '@app/utils';

export type { ChapterDto, NovelDto, NovelStatus };

// Upload Novel
export const uploadNovel = (file: File, title?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);

  return fetch.post<ApiResponse<{ id: number; status: string }>>('/novels/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get Novel List
export const getNovels = () => {
  return fetch.get<ApiResponse<NovelDto[]>>('/novels');
};

// Get Novel Detail
export const getNovel = (id: number) => {
  return fetch.get<ApiResponse<NovelDto>>(`/novels/${id}`);
};

// Get Chapter List
export const getChapters = (novelId: number) => {
  return fetch.get<ApiResponse<ChapterDto[]>>(`/novels/${novelId}/chapters`);
};

// Get Chapter Content
export const getChapterContent = (chapterId: number) => {
  return fetch.get<ApiResponse<ChapterDto>>(`/novels/chapters/${chapterId}`);
};
