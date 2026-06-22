# @phpsoftbox/profiler-js

React-инструменты отладки для приложений PhpSoftBox.

Пакет получает данные профайлера из framework-endpoint:

- `GET /__profiler/api/traces`
- `GET /__profiler/api/traces/{trace}`

## Установка

```bash
yarn add @phpsoftbox/profiler-js
```

## Использование с Inertia

Backend должен передать props профайлера:

```php
'profiler' => [
    'enabled'  => $profiler->enabled(),
    'trace_id' => $profiler->traceId(),
    'endpoint' => '/__profiler',
],
```

Frontend:

```tsx
import { createInertiaApp } from '@inertiajs/react';
import { DebugProvider, ProfilerDebugPanel } from '@phpsoftbox/profiler-js';

createInertiaApp({
  setup({ el, App, props }) {
    const profiler = props.initialPage.props.profiler;

    root.render(
      <DebugProvider profiler={profiler}>
        <App {...props} />
        <ProfilerDebugPanel />
      </DebugProvider>,
    );
  },
});
```

## Стилизация

`ProfilerDebugPanel` поставляется с самостоятельным CSS и не зависит от UI-фреймворка.
Так debug-пакет можно безболезненно подключать к любому React-приложению.

В большинстве проектов достаточно переопределить CSS-переменные:

```tsx
<ProfilerDebugPanel className="app-debug-panel" />
```

```css
.app-debug-panel {
  --psb-debug-accent-bg: #eef2ff;
  --psb-debug-accent-text: #3730a3;
  --psb-debug-radius: 4px;
  --psb-debug-panel-width: min(1100px, calc(100vw - 32px));
}
```

Для более глубокой интеграции можно передать классы для конкретных частей панели:

```tsx
<ProfilerDebugPanel
  className="app-debug-panel"
  classNames={{
    panel: 'app-debug-panel__surface',
    actionButton: 'app-debug-panel__button',
  }}
/>
```

Пакет импортирует дефолтный CSS из entrypoint компонента. Если bundler требует
явного импорта stylesheet, подключите стили отдельно:

```tsx
import '@phpsoftbox/profiler-js/styles.css';
```

## Ручные отметки

```tsx
import { useProfiler } from '@phpsoftbox/profiler-js';

function ProductsTable() {
  const profiler = useProfiler();

  profiler.mark('products.table.mount');

  profiler.span('products.table.render', () => {
    // измеряемая клиентская работа
  });
}
```

Клиентские spans отправляются в `/__profiler/api/client-spans` через
`navigator.sendBeacon()`. Backend-endpoint можно добавить позже: вызовы
игнорируются, если браузер не поддерживает `sendBeacon` или отсутствует trace id.
