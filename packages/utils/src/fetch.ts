import { message as Message } from 'antd';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { storageUtil } from './storage';

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
console.log('BASE_URL', BASE_URL);
const TIME_OUT = 60 * 1000;

export interface IResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface IRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
}

class HttpRequest {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: TIME_OUT,
      headers: {},
    });
    this.initInterceptors();
  }

  // 初始化拦截器
  private initInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storageUtil.get('localStorage', 'token');
        const langs: { [key: string]: any } = { 'zh-CN': 'zh-cn' };
        const localLang = localStorage.getItem('i18nextLng') || 'zh-CN';
        config.headers['Accept-Language'] = langs[localLang] || localLang;
        config.headers['Authorization'] = token;
        config.headers['token'] = token;
        config.cancelToken = source.token;

        return config;
      },
      (error) => {
        // 请求错误处理
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse<IResponseData>) => {
        if (response.status == 201 || response.status == 200) {
          const { code, message } = response.data;
          if ([200, 201].includes(Number(code)) || !code) {
            return Promise.resolve(response);
          } else {
            // 用户退出登录
            if ([222, 223, 224].includes(Number(code))) {
              source.cancel();
              Message.error('您已掉线，请重新登录');
              storageUtil.remove('localStorage', 'token');
              storageUtil.remove('localStorage', 'user-store');
              window.location.replace('/login');
            }

            const config: IRequestConfig = response.config;
            if (config.skipErrorHandler) {
              return Promise.reject(response.data);
            }

            // 拦截错误信息
            Message.error(message);

            return Promise.reject(response.data);
          }
        }

        return response;
      },
      (error) => {
        // 2. 处理 HTTP 状态码错误
        let errorMessage = '服务器发生未知错误';
        if (error.response) {
          // 服务器返回了响应，但状态码不是 2xx
          const status = error.response.status;
          switch (status) {
            case 401:
              errorMessage = '未授权，请重新登录';
              // 这里可以执行跳转到登录页等操作
              // window.location.href = '/login';
              break;
            case 403:
              errorMessage = '禁止访问';
              break;
            case 404:
              errorMessage = '请求的资源未找到';
              break;
            case 500:
              errorMessage = '服务器内部错误';
              break;
            default:
              errorMessage = `请求失败，状态码：${status}`;
          }
        } else if (error.request) {
          // 请求已发出，但没有收到响应 (例如网络断开)
          errorMessage = '网络连接异常，请检查您的网络';
        } else if (axios.isCancel(error)) {
          // 请求被取消
          console.log('Request canceled:', error.message);
          // 对于取消的请求，我们通常不显示全局错误提示
          return Promise.reject(error);
        } else {
          // 设置请求时发生了一些事情，触发了错误
          errorMessage = error.message || '请求失败';
        }

        // 3. 统一弹出错误提示
        console.error('HTTP Error:', errorMessage);
        // alert(`HTTP 错误：${errorMessage}`); // 简单示例

        return Promise.reject(error);
      },
    );
  }

  /**
   * @description 核心请求方法
   * @param config - Axios 请求配置
   * @returns Promise<T> - 返回一个 Promise，其解析值为响应的核心数据
   */
  public request<T = any>(config: IRequestConfig): Promise<T> {
    // 关键点：
    // 1. instance.request 返回的是 AxiosResponse<IResponseData<T>>
    // 2. 在响应拦截器中，如果成功，我们 `return data.data`，其类型为 T
    // 3. 因此，最终 then 中收到的数据类型就是 T
    return new Promise((resolve, reject) => {
      this.instance
        .request(config)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public get<T = any>(url: string, params?: object, config?: IRequestConfig): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET', params });
  }

  public post<T = any>(url: string, data?: object | string, config?: IRequestConfig): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  public put<T = any>(url: string, data?: object, config?: IRequestConfig): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  public delete<T = any>(url: string, config?: IRequestConfig): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
}

export const fetch = new HttpRequest();
