type StorageType = 'localStorage' | 'sessionStorage';

type StorageProps = {
  set: (storageType: StorageType, key: string, value: any) => void;
  get: (storageType: StorageType, key: string) => any;
  remove: (storageType: StorageType, key: string) => void;
  clear: (storageType: StorageType) => void;
  _getStorage: (storageType: StorageType) => Storage | null;
};

export const storageUtil: StorageProps = {
  // 存储数据到指定的 Storage 中
  set(storageType, key, value) {
    try {
      const storage = this._getStorage(storageType);
      if (storage) {
        const data = JSON.stringify(value);
        storage.setItem(key, data);
      }
    } catch (error: any) {
      console.error(`设置 ${storageType} 数据时出错: ${error.message}`);
    }
  },

  // 从指定的 Storage 中获取数据
  get(storageType, key) {
    try {
      const storage = this._getStorage(storageType);
      if (storage) {
        const data = storage.getItem(key);
        if (data) {
          return JSON.parse(data);
        }
      }
      return null;
    } catch (error: any) {
      console.error(`获取 ${storageType} 数据时出错: ${error.message}`);
      return null;
    }
  },

  // 从指定的 Storage 中删除指定键的数据
  remove(storageType, key) {
    try {
      const storage = this._getStorage(storageType);
      if (storage) {
        storage.removeItem(key);
      }
    } catch (error: any) {
      console.error(`删除 ${storageType} 数据时出错: ${error.message}`);
    }
  },

  // 清空指定的 Storage 中的所有数据
  clear(storageType) {
    try {
      const storage = this._getStorage(storageType);
      if (storage) {
        storage.clear();
      }
    } catch (error: any) {
      console.error(`清空 ${storageType} 数据时出错: ${error.message}`);
    }
  },

  // 内部方法，根据传入的类型获取对应的 Storage 对象
  _getStorage(storageType) {
    if (storageType === 'localStorage') {
      return localStorage;
    } else if (storageType === 'sessionStorage') {
      return sessionStorage;
    }
    console.error('不支持的存储类型，请使用 localStorage 或 sessionStorage');
    return null;
  },
};
