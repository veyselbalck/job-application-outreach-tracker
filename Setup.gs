/** Creates the tracker tabs and their English header rows. This clears existing tab contents. */
function initializeSheets() {
  if (!CFG.SHEET_ID) throw new Error("Set the SPREADSHEET_ID Script Property first.");
  const spreadsheet = SpreadsheetApp.openById(CFG.SHEET_ID);
  const definitions = [
    {name:CFG.SHEETS.QUEUE, headers:["Company","Email","Sector","City","Source","Added At","Status"], widths:[160,200,130,100,100,150,120]},
    {name:CFG.SHEETS.SENT, headers:["Company","Email","Sent At","Subject","Status","Thread ID"], widths:[160,200,150,260,100,180]},
    {name:CFG.SHEETS.REPLIES, headers:["Company","Sender Email","Reply Date","Subject","Label","Summary"], widths:[160,200,150,260,120,300]},
    {name:CFG.SHEETS.LOG, headers:["Timestamp","Action","Details"], widths:[160,160,400]}
  ];
  definitions.forEach(definition => {
    const sheet = spreadsheet.getSheetByName(definition.name) || spreadsheet.insertSheet(definition.name);
    sheet.clearContents();
    sheet.appendRow(definition.headers);
    sheet.setFrozenRows(1);
    definition.widths.forEach((width, index) => sheet.setColumnWidth(index + 1, width));
    styleHeader(sheet, definition.headers.length);
  });
  writeLog("Setup", "Tracker sheets initialized.");
  Logger.log("Setup complete. Review your queue, then run installDailyTriggers() if desired.");
}
function styleHeader(sheet, columnCount) {
  sheet.getRange(1,1,1,columnCount).setBackground("#1D9E75").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(11);
}
