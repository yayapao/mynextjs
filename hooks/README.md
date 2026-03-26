# Custom Hooks

这个目录包含项目中使用的自定义 React Hooks。

## 📦 可用的 Hooks

### `useMounted`

检测组件是否已在客户端挂载，用于防止 SSR hydration 不匹配。

```typescript
import { useMounted } from '@/hooks';

function Component() {
  const mounted = useMounted();

  if (!mounted) {
    return null; // 或显示占位符
  }

  return <ClientOnlyComponent />;
}
```

**实现原理：** 使用 `useSyncExternalStore` 来同步服务端和客户端状态。

---

### `useMediaQuery`

响应式监听 CSS 媒体查询变化。

```typescript
import { useMediaQuery } from '@/hooks';

function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');

  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
}
```

**实现原理：** 使用 `useSyncExternalStore` 订阅 `window.matchMedia` API。

---

### `useLocalStorage`

使用 [localforage](https://github.com/localforage/localforage) 同步状态到浏览器存储。

```typescript
import { useLocalStorage } from '@/hooks';

function Component() {
  // 返回: [value, setValue, removeValue, setItem]
  const [user, setUser, removeUser, setItem] = useLocalStorage('user', null);

  return (
    <div>
      {/* 基础用法：像 useState 一样使用 */}
      <button onClick={() => setUser({ name: 'John' })}>
        Save User
      </button>
      <button onClick={() => removeUser()}>Clear</button>

      {/* 高级用法：使用自定义 key */}
      <button onClick={() => setItem('user:123', { name: 'John' })}>
        Save with Custom Key
      </button>
      <button onClick={() => removeUser('user:123')}>
        Remove Custom Key
      </button>
    </div>
  );
}
```

#### API

**返回值：**
```typescript
[
  storedValue,              // 当前存储的值
  setValue,                 // (value) => Promise<void>
  removeValue,              // (customKey?) => Promise<void>
  setItem                   // (key, value) => Promise<void>
]
```

**方法说明：**

1. **`setValue(value)`** - 设置默认 key 的值
   ```typescript
   await setValue({ name: 'John' });
   await setValue(prev => ({ ...prev, age: 30 })); // 函数式更新
   ```

2. **`removeValue(customKey?)`** - 删除值
   ```typescript
   await removeValue();              // 删除默认 key
   await removeValue('user:123');    // 删除自定义 key
   ```

3. **`setItem(key, value)`** - 使用自定义 key 存储（不影响主状态）
   ```typescript
   await setItem('user:john', { name: 'John' });
   await setItem('user:jane', { name: 'Jane' });
   ```

#### 为什么使用 localforage？

| 特性 | localStorage | localforage |
|------|--------------|-------------|
| API | 同步（阻塞） | 异步（非阻塞） |
| 存储容量 | ~5-10MB | ~50MB+ (IndexedDB) |
| 数据类型 | 仅字符串 | 任意类型 |
| 性能 | 较慢 | 更快 |
| 存储引擎 | localStorage | IndexedDB → WebSQL → localStorage |

**优势：**
- ✅ 异步 API，不阻塞 UI
- ✅ 自动选择最佳存储引擎（IndexedDB 优先）
- ✅ 支持存储任意 JavaScript 类型（对象、数组、Blob 等）
- ✅ 更大的存储容量
- ✅ 更好的性能，尤其是处理大数据时

**示例：**
```typescript
// 简单值存储
const [count, setCount, removeCount] = useLocalStorage('counter', 0);

// 复杂对象存储
const [settings, setSettings] = useLocalStorage('settings', {
  theme: 'dark',
  language: 'en',
  notifications: true
});

// 函数式更新
setSettings(prev => ({ ...prev, theme: 'light' }));

// 清除值
removeCount();
```

---

## 🔧 最佳实践

### 1. 防止 Hydration 不匹配

对于依赖客户端状态的组件，使用 `useMounted`：

```typescript
function ThemeToggle() {
  const mounted = useMounted();
  const { theme } = useTheme();

  // 主题值可能来自 localStorage，服务端和客户端可能不同
  if (!mounted) return null;

  return <button>{theme}</button>;
}
```

### 2. 响应式设计

使用 `useMediaQuery` 而不是 CSS 媒体查询来条件渲染：

```typescript
function ResponsiveNav() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <MobileNav /> : <DesktopNav />;
}
```

### 3. 持久化状态

使用 `useLocalStorage` 保存用户偏好：

```typescript
function App() {
  const [preferences, setPreferences] = useLocalStorage('prefs', {
    sidebar: 'expanded',
    fontSize: 'medium'
  });

  // 状态会自动同步到 IndexedDB/localStorage
}
```

---

## 📚 扩展阅读

- [useSyncExternalStore - React Docs](https://react.dev/reference/react/useSyncExternalStore)
- [localforage Documentation](https://localforage.github.io/localForage/)
- [Hydration Mismatches in Next.js](https://nextjs.org/docs/messages/react-hydration-error)
