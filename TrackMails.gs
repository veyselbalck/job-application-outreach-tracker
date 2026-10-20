/** Tracks delivery failures and recent replies from domains in the Sent tab. */
function markDeliveryFailures() {
  const spreadsheet = SpreadsheetApp.openById(CFG.SHEET_ID);
  const queue = spreadsheet.getSheetByName(CFG.SHEETS.QUEUE);
  const sent = spreadsheet.getSheetByName(CFG.SHEETS.SENT);
  GmailApp.search('from:(mailer-daemon OR postmaster) subject:(delivery OR undeliverable OR failed) newer_than:2d',0,50).forEach(thread => {
    const body = thread.getMessages()[0].getPlainBody();
    const matches = body.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    matches.forEach(email => {
      [[queue,7],[sent,5]].forEach(([sheet,column]) => sheet.getDataRange().getValues().slice(1).forEach((row,index) => {
        if (String(row[1] || "").toLowerCase() === email.toLowerCase()) sheet.getRange(index+2,column).setValue("Delivery Failed");
      }));
      writeLog("Delivery Failure", `Could not deliver to ${email}`);
    });
  });
}
function trackReplies() {
  markDeliveryFailures();
  const spreadsheet = SpreadsheetApp.openById(CFG.SHEET_ID);
  const sent = spreadsheet.getSheetByName(CFG.SHEETS.SENT);
  const replies = spreadsheet.getSheetByName(CFG.SHEETS.REPLIES);
  const knownSenders = new Set(replies.getDataRange().getValues().slice(1).map(row => String(row[1] || "").toLowerCase().trim()));
  const sentRows = sent.getDataRange().getValues().slice(1);
  const companiesByDomain = {};
  sentRows.forEach(([company,email]) => { if (email && email.includes("@")) { const domain=email.split("@")[1]; (companiesByDomain[domain] ||= []).push(company); } });
  let found = 0;
  Object.entries(companiesByDomain).forEach(([domain,companies]) => {
    try {
      GmailApp.search(`from:${domain} in:inbox newer_than:90d`,0,10).forEach(thread => {
        const message=thread.getMessages()[0], sender=extractEmailAddress(message.getFrom()).toLowerCase();
        if (!sender || knownSenders.has(sender) || sender === CFG.PROFILE.email.toLowerCase()) return;
        const subject=message.getSubject(), date=message.getDate(), body=message.getPlainBody().substring(0,500);
        const label=classifyReply(subject+" "+body), summary=body.replace(/\s+/g," ").substring(0,200);
        replies.appendRow([companies[0] || domain,sender,date,subject,label,summary]);
        const row=replies.getLastRow(), colors={Positive:"#E1F5EE",Negative:"#FCEBEB",Automated:"#F1EFE8","Needs Review":"#FAEEDA"};
        replies.getRange(row,5).setBackground(colors[label]); knownSenders.add(sender); found++;
        writeLog("Reply", `${companies[0]} (${label}): ${subject}`);
      });
    } catch(error) { writeLog("Reply Error", `${domain}: ${error.message}`); }
  });
  SpreadsheetApp.flush(); writeLog("Reply Summary", `${found} new replies found.`); return found;
}
function extractEmailAddress(rawFrom) { const match=rawFrom.match(/<([^>]+)>/); return match ? match[1] : rawFrom.trim(); }
function classifyReply(text) {
  const normalized=text.toLowerCase();
  const automated=["noreply","no-reply","donotreply","do-not-reply","automated","automatic","auto-generated","out of office"];
  const positive=["interview","invite you","pleased to meet","shortlisted","phone call","availability","schedule a call"];
  const negative=["unfortunately","not a match","not moving forward","regret to inform","cannot offer","position has been filled"];
  if (automated.some(term=>normalized.includes(term))) return "Automated";
  if (positive.some(term=>normalized.includes(term))) return "Positive";
  if (negative.some(term=>normalized.includes(term))) return "Negative";
  return "Needs Review";
}
