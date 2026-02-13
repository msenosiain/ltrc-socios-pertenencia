// Google Apps Script - Desplegado como Web App

const SPREADSHEET_ID = 'your-spreadsheet-id-here'; // Cambiar por el ID real

/**
 * Endpoint POST para agregar un nuevo miembro
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Validar datos
    if (!payload.firstName || !payload.documentNumber) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: 'firstName and documentNumber are required'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Obtener la hoja de cálculo
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getActiveSheet();

    // Crear encabezados si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        // Member (Socio) data
        'Nombre Socio',
        'Apellido Socio',
        'DNI Socio',
        'Fecha de Nacimiento',
        'Foto del Documento',
        // Card Holder (Titular) data
        'Nombre Titular',
        'Apellido Titular',
        'DNI Titular',
        'Tarjeta de Crédito',
        'Vencimiento Tarjeta',
        // Metadata
        'Fecha de Registro'
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    }

    // Agregar fila con los datos del miembro
    const newRow = sheet.getLastRow() + 1;
    sheet.appendRow([
      // Member data
      payload.firstName,
      payload.lastName,
      payload.documentNumber,
      payload.birthDate,
      '', // Placeholder para la imagen
      // Card Holder data
      payload.cardHolderFirstName,
      payload.cardHolderLastName,
      payload.cardHolderDocumentNumber,
      payload.creditCardNumber,
      payload.creditCardExpirationDate,
      // Metadata
      payload.createdAt
    ]);

    // Si hay imagen, crear hyperlink clickeable
    if (payload.documentImageLink && payload.documentImageLink !== 'N/A') {
      sheet.getRange(newRow, 5).setFormula(
        '=HYPERLINK("' + payload.documentImageLink + '", "📷 Ver DNI")'
      );
    } else {
      sheet.getRange(newRow, 5).setValue('Sin imagen');
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: 'Member added successfully',
        timestamp: new Date().toISOString()
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.message
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint GET para obtener todos los miembros
 */
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getActiveSheet();

    const data = sheet.getDataRange().getValues();

    if (data.length === 0) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const rows = data.slice(1);

    const members = rows.map(row => ({
      firstName: row[0],
      lastName: row[1],
      documentNumber: row[2],
      birthDate: row[3],
      creditCardNumber: row[4],
      documentImageLink: row[5],
      createdAt: row[6]
    }));

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        data: members,
        count: members.length
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.message
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
