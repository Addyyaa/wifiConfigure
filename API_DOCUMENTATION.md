# WiFi配网页面后端API文档

本文档定义了WiFi配网页面所需后端接口的规范，旨在为前端开发提供清晰的数据交互标准。

---

## 1. 获取可用WiFi列表

此接口用于获取设备扫描到的周边WiFi热点列表。

- **URL:** `/api/wifi-list`
- **方法:** `GET`
- **请求参数:** 无
- **成功响应 (200 OK):**
  - **内容类型:** `application/json`
  - **响应体:** 一个包含WiFi对象的JSON数组。每个对象代表一个WiFi热点。

    ```json
    [
      {
        "ssid": "MyHomeWiFi-5G",
        "signal": -45
      },
      {
        "ssid": "Office-Guest",
        "signal": -68
      },
      {
        "ssid": "Public_Free_WiFi",
        "signal": -82
      }
    ]
    ```

  - **字段说明:**
    - `ssid` (String): WiFi的名称。
    - `signal` (Number): 信号强度，以dBm为单位。数值越大表示信号越好（例如，-45比-82好）。

- **失败响应 (e.g., 500 Internal Server Error):**
  - **内容类型:** `application/json`
  - **响应体:**
    ```json
    {
      "error": "Failed to scan WiFi networks."
    }
    ```

---

## 2. 提交WiFi配置信息

此接口用于将用户选择的WiFi名称（SSID）和输入的密码发送到后端，以启动配网程序。

- **URL:** `/api/wifi-config`
- **方法:** `POST`
- **请求体 (application/json):**
  ```json
  {
    "ssid": "MyHomeWiFi-5G",
    "password": "user_input_password"
  }
  ```
- **字段说明:**
  - `ssid` (String): 用户选择的WiFi名称。
  - `password` (String): 用户输入的WiFi密码。

- **成功响应 (200 OK):**
  - **内容类型:** `application/json`
  - **响应体:**
    ```json
    {
      "success": true,
      "message": "Configuration request received. Starting connection process."
    }
    ```

- **失败响应 (e.g., 400 Bad Request):**
  - **内容类型:** `application/json`
  - **响应体:**
    ```json
    {
      "success": false,
      "error": "Invalid input: SSID or password missing."
    }
    ```

---

## 3. 获取配网状态

在提交配置后，前端应通过此接口轮询配网的当前状态。

- **URL:** `/api/wifi-status`
- **方法:** `GET`
- **请求参数:** 无
- **成功响应 (200 OK):**
  - **内容类型:** `application/json`
  - **响应体:**
    ```json
    {
      "status": "connecting"
    }
    ```
  - **`status` 字段可能的值:**
    - `connecting`: 正在连接中。前端应继续轮询。
    - `success`: 配网成功。前端可以停止轮询并向用户显示成功信息。
    - `password_error`: 密码错误。前端应停止轮询，并提示用户检查密码。
    - `timeout`: 连接超时。前端应停止轮询，并提示用户检查网络或设备位置。
    - `error`: 未知的通用错误。

- **失败响应 (e.g., 500 Internal Server Error):**
  - **内容类型:** `application/json`
  - **响应体:**
    ```json
    {
      "status": "error",
      "error": "An unexpected error occurred during configuration."
    }
    ``` 