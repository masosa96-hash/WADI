# WADI Final Go-Live Validation Checklist 🚀

## 1. Verificación de Deployment (Railway/Render) ✅

- [ ] **Build Status**: Confirmar que el commit "fix(api): force binding..." se construyó exitosamente (Green check).
- [ ] **Logs de Arranque**: Buscar en la consola la línea:
  > `🚀 API v1.0.1 running on port XXXX`
  > `Health check available at: http://0.0.0.0:XXXX/system/health`
- [ ] **Network Binding**: Confirmar que no hay errores de "Address already in use" o "Connection refused".

## 2. Configuración de Variables (Production Environment) 🔐

Asegurar que las siguientes variables están definidas en el dashboard del proveedor:

| Variable                | Estado Ideal                       | Validado? |
| :---------------------- | :--------------------------------- | :-------- |
| `NODE_ENV`              | `production`                       | [ ]       |
| `ADMIN_KEY`             | _(Valor Hex Hash seguro)_          | [ ]       |
| `SUPABASE_URL`          | `https://<PROJECT-ID>.supabase.co` | [ ]       |
| `SUPABASE_KEY`          | _(Service Role Key)_               | [ ]       |
| `OPENAI_API_KEY`        | `sk-...` (Con créditos activos)    | [ ]       |
| `WHATSAPP_VERIFY_TOKEN` | _(Valor de DEPLOY_GUIDE.md)_       | [ ]       |

## 3. Pruebas de Salud (Smoke Tests) 🩺

Ejecutar desde terminal local o navegador, apuntando a la URL de producción:

1.  **Status General**:
    `curl https://<TU-APP>.up.railway.app/`
    - _Experado_: `{"status":"online", "endpoints":[...], ...}`

2.  **Health Check (Vital para Railway)**:
    `curl https://<TU-APP>.up.railway.app/system/health`
    - _Esperado_: `{"status":"ok", "uptime":...}`

3.  **Readiness Probe (DB Connection)**:
    `curl https://<TU-APP>.up.railway.app/system/ready`
    - _Esperado_: `{"status":"ready", ...}` (Si las vars de Supabase están bien).
    - _Fallback_: `{"status":"ready"}` con placeholders si faltan vars (pero no crashea).

## 4. Webhooks (Conectividad Externa) 📡

- [ ] **WhatsApp Cloud API**: URL configurada en Meta apuntando a `/webhooks/whatsapp`.
- [ ] **Telegram Bot**: Webhook set apuntando a `/webhooks/telegram`.

## 5. Monitorización Post-Deploy 👁️

- [ ] Revisar panel de logs 10 minutos después del deploy para detectar errores silenciosos.
- [ ] Confirmar que Kivo (Frontend) puede conectar con el Backend (No errores CORS).

---

**Estado Final**: GO / NO-GO
