/** Sends queued applications and records outcomes in the Queue and Sent tabs. */
function sendQueuedEmails() {
  const spreadsheet = SpreadsheetApp.openById(CFG.SHEET_ID);
  const queue = spreadsheet.getSheetByName(CFG.SHEETS.QUEUE);
  const sent = spreadsheet.getSheetByName(CFG.SHEETS.SENT);
  const rows = queue.getDataRange().getValues();
  let sentCount = 0;
  let localResume, englishResume;
  try {
    if (!CFG.PROFILE.localResumeFileId || !CFG.PROFILE.englishResumeFileId) throw new Error("Configure both resume PDF file IDs in Script Properties.");
    localResume = DriveApp.getFileById(CFG.PROFILE.localResumeFileId).getAs(MimeType.PDF);
    englishResume = DriveApp.getFileById(CFG.PROFILE.englishResumeFileId).getAs(MimeType.PDF);
    localResume.setName("Resume_Local.pdf");
    englishResume.setName("Resume_English.pdf");
  } catch (error) { writeLog("Resume Error", error.message); return 0; }
  for (let i = 1; i < rows.length && sentCount < CFG.DAILY_LIMIT; i++) {
    const [company,email,sector,,, ,status] = rows[i];
    if (!company || !email || ["Sent","Error","Invalid","Delivery Failed"].includes(status)) continue;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)) || /[^\x00-\x7F]/.test(String(email))) {
      queue.getRange(i+1,7).setValue("Invalid"); continue;
    }
    const subject = `Computer Engineer Application | ${CFG.PROFILE.fullName}`;
    try {
      GmailApp.sendEmail(email, subject, "Please view this message in an email client that supports HTML.", {
        htmlBody:buildEmailHtml(company,sector), attachments:[localResume,englishResume], name:CFG.PROFILE.fullName
      });
      queue.getRange(i+1,7).setValue("Sent");
      sent.appendRow([company,email,new Date(),subject,"Sent",""]);
      sentCount++;
      writeLog("Sent", `${company} -> ${email}`);
    } catch (error) { queue.getRange(i+1,7).setValue("Error"); writeLog("Email Error", `${email}: ${error.message}`); }
    Utilities.sleep(2000);
  }
  SpreadsheetApp.flush();
  writeLog("Summary", `${sentCount} emails sent in this run.`);
  return sentCount;
}
function buildEmailHtml(company, sector) {
  const field = sector ? `${sector} sector` : "software sector";
  const phone = CFG.PROFILE.phone ? `<br>Phone: ${escapeHtml_(CFG.PROFILE.phone)}` : "";
  const linkedin = CFG.PROFILE.linkedin ? `<br>LinkedIn: <a href="${escapeHtml_(CFG.PROFILE.linkedin)}">Profile</a>` : "";
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#222;max-width:620px"><p>Dear Hiring Team,</p><p>I am a Computer Engineer seeking an opportunity to grow in the ${escapeHtml_(field)}. Through my studies and projects, I have developed practical experience with software technologies and problem-solving.</p><p>Please consider my attached resumes for suitable current or future opportunities at <strong>${escapeHtml_(company)}</strong>. I would welcome the opportunity to discuss how I could contribute to your team.</p><p>Kind regards,<br><strong>${escapeHtml_(CFG.PROFILE.fullName)}</strong>${phone}<br>Email: <a href="mailto:${escapeHtml_(CFG.PROFILE.email)}">${escapeHtml_(CFG.PROFILE.email)}</a>${linkedin}</p></div>`;
}
function escapeHtml_(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]); }
