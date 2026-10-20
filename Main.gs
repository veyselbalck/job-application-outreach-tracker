/** Daily entry points, trigger management, logging, and summary reporting. */
function runDailyCompanySearch() {
  writeLog("Company Search", "Started.");
  try { CFG.TARGET_SECTORS.forEach(() => { findCompaniesWithAI(); Utilities.sleep(15000); }); writeLog("Company Search", "Completed."); }
  catch(error) { writeLog("Critical Error", error.message); }
}
function runDailyEmailSend() {
  writeLog("Email Send", "Started.");
  try { writeLog("Email Send", `${sendQueuedEmails()} emails sent.`); } catch(error) { writeLog("Critical Error", error.message); }
}
function runDailyReplyCheck() {
  writeLog("Reply Check", "Started.");
  try { writeLog("Reply Check", `${trackReplies()} replies found.`); } catch(error) { writeLog("Critical Error", error.message); }
}
function searchCompaniesOnly() { findCompaniesWithAI(); }
function sendEmailsOnly() { sendQueuedEmails(); }
function checkRepliesOnly() { trackReplies(); }
function installDailyTriggers() {
  ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger("runDailyCompanySearch").timeBased().everyDays(1).atHour(8).create();
  ScriptApp.newTrigger("runDailyEmailSend").timeBased().everyDays(1).atHour(9).create();
  ScriptApp.newTrigger("runDailyReplyCheck").timeBased().everyDays(1).atHour(18).create();
  Logger.log("Installed three daily triggers: company search at 08:00, email at 09:00, replies at 18:00.");
}
function listProjectTriggers() { ScriptApp.getProjectTriggers().forEach(trigger => Logger.log(`${trigger.getHandlerFunction()} - ${trigger.getTriggerSource()}`)); }
function writeLog(action, details) {
  try {
    const spreadsheet=SpreadsheetApp.openById(CFG.SHEET_ID), sheet=spreadsheet.getSheetByName(CFG.SHEETS.LOG);
    if (!sheet) return;
    sheet.appendRow([new Date(),action,String(details).substring(0,500)]); Logger.log(`[${action}] ${details}`);
    if (sheet.getLastRow()>1000) sheet.deleteRows(2,200);
  } catch(error) { Logger.log(`[Logging Error] ${error.message}`); }
}
function showStatistics() {
  const spreadsheet=SpreadsheetApp.openById(CFG.SHEET_ID);
  const queue=spreadsheet.getSheetByName(CFG.SHEETS.QUEUE).getDataRange().getValues().slice(1);
  const sent=spreadsheet.getSheetByName(CFG.SHEETS.SENT).getDataRange().getValues().slice(1);
  const replies=spreadsheet.getSheetByName(CFG.SHEETS.REPLIES).getDataRange().getValues().slice(1);
  const count=label=>replies.filter(row=>row[4]===label).length;
  Logger.log(`Pending in queue: ${queue.filter(row=>row[6]==="Pending").length}
Total sent: ${sent.length}
Positive replies: ${count("Positive")}
Negative replies: ${count("Negative")}
Needs review: ${count("Needs Review")}`);
}
