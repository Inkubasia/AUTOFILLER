# QA Form Autofill for EnquiryTracker

## Что это
Chrome-расширение для автозаполнения форм EnquiryTracker (`webforms`, `application`, `request-application`).

Инструмент заточен под QA и демо-сценарии: быстро заполняет поля, проходит шаги, работает с Angular Material компонентами и запоминает ваши ручные правки.

## Польза
- Экономит время на ручное заполнение длинных форм.
- Повышает стабильность QA-прогонов (меньше человеческих ошибок).
- Подходит для smoke/regression и повторяемых demo flow.
- Поддерживает ET-специфику:
  - `mat-select` / overlay списки
  - radio/checkbox/toggle
  - intl phone
  - Google Places address
  - datepicker (календарь)
  - upload документов
  - signature canvas

## Ключевые возможности
- Профили заполнения: `Random` и `Default`.
- Автоопределение типа формы по URL/контенту.
- Пер-форм рецепты (general/event/application/prospectus).
- Self-healing поиск полей (formcontrolname/name/id/aria/label/nearby text).
- Learning engine:
  - хранит значения по форме
  - учитывает контекст (форма/шаг/секция/кандидаты поля)
- Автопроход степперов.
- Автопопап на поддерживаемых доменах ET.
- Опции в popup:
  - dropdown strategy
  - auto submit
  - dry run
  - debug
  - toggle denylist
  - export/import config

## Поддерживаемые URL
- `https://dev.enquirytracker.net/webforms/...`
- `https://staging.enquirytracker.net/webforms/...`
- `https://app.enquirytracker.net/webforms/...`
- `https://app-us.enquirytracker.net/webforms/...`
- `.../application/...`
- `.../request-application/...`

## Как пользоваться
1. Установите зависимости:
   - `npm install`
2. Соберите расширение:
   - `npm run build`
3. Откройте `chrome://extensions/`
4. Включите `Developer mode`
5. Нажмите `Load unpacked` и выберите папку проекта
6. После изменений в коде:
   - снова `npm run build`
   - в `chrome://extensions/` нажмите `Reload`

## Быстрый сценарий
1. Откройте форму EnquiryTracker.
2. Нажмите иконку расширения. или сочетание клавиш ctrl(cmd)+shift+f
3. Выберите режим (если нужно) и нажмите `Fill Form`.
4. При необходимости включите `Debug` для отчета последнего прогона.

## Стабильные test id (ET-10135 и далее)
- **Application / event формы (`sf-<path>`)**: поля, у которых есть `data-testid="sf-<canonicalPath>"`, заполняет `src/schemaForm.ts`, а не эвристики.
  - JSON-схема формы перехватывается `src/pageHook.ts` (MAIN world, ответ `GET .../fillable-form/...`). Из неё берутся pattern, длины, `minItems` и границы чисел.
  - Опции выбираются по `sf-<path>-option-<enum>`, enum `0` ("Other..") пропускается. Multi-select добирает `minItems`, группы чекбоксов считаются, а не кликаются все подряд.
  - Подпись рисуется настоящими pointer-событиями (`signature_pad` игнорирует `ctx.stroke`), файлы ждут появления строки `sf-<path>-file-*`.
  - Степпер идёт по `stepper-next-button`, сабмит по `applications-form-submit` / `fillable-form-submit`.
  - Эвристические проходы пропускают всё внутри `[data-testid^="sf-"]`.
- **Webform'ы (`webform-<form>-<field>`)**: `src/testids.ts` явно сопоставляет slug с ключом профиля (`WEBFORM_SLUG_TO_PROFILE_KEY`), в том числе для блока contact2. Неизвестные поля идут через старый резолвер.
- В отчёте (`Debug`) появились `schemaFields` (filled / skipped / errors / schemaCaptured) и `validationErrors` с путём поля.
- Тесты чистой логики: `npm test`. Проверка типов: `npm run typecheck`.
- Не покрыто: оплата (`payment`, нужен Stripe test key), формы во встроенном iframe (`.et-widget`).

## Примечания
- Проверочные коды (например verification code/captcha) обычно нужно вводить вручную.
- Расширение сохраняет обученные значения в `chrome.storage.local`.
- Для очистки памяти используйте `Reset Learned` в popup.
