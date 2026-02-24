export enum SocketMessageType {
  /** 处理中/开始导入 */
  NOVEL_Processing = 19,
  /** 章节更新 */
  NOVEL_ChapterUpdate = 20,
  /** 处理完成 */
  NOVEL_Completed = 21,
  /** 处理失败 */
  NOVEL_Failed = 22,
}

export interface SocketMessage<T = any> {
  code: number;
  message: string;
  type: number;
  result?: T;
  timeStamp?: number;
  uuid?: string;
  uid?: string; // 兼容客户端定义
}
