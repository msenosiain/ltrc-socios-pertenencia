# Google Apps Script Setup

## 1. Crear Google Sheet

1. Ir a [Google Sheets](https://sheets.google.com/)
2. Crear nueva hoja
3. Copiar el ID de la URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

## 2. Crear Google Apps Script

1. Ir a [Google Apps Script](https://script.google.com/)
2. Crear nuevo proyecto
3. Copiar el código de `google-apps-script.gs`
4. Reemplazar `SPREADSHEET_ID` con tu ID

## 3. Desplegar como Web App

1. **Implementar > Nueva implementación**
2. Tipo: **Web app**
3. Ejecutar como: **Tu cuenta**
4. Acceso: **Cualquiera**
5. Copiar la URL generada

## 4. Configurar Variable de Entorno

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

## Troubleshooting

- **403**: Verificar que el acceso sea "Cualquiera"
- **404**: Verificar URL del script
- **No sincroniza**: Verificar `SPREADSHEET_ID` en el script
