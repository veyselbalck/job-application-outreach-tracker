/** Finds potential employers through the configured Groq chat completion API. */
function findCompaniesWithAI() {
  const spreadsheet = SpreadsheetApp.openById(CFG.SHEET_ID);
  const queue = spreadsheet.getSheetByName(CFG.SHEETS.QUEUE);
  const sent = spreadsheet.getSheetByName(CFG.SHEETS.SENT);
  const knownEmails = collectKnownEmails(queue, sent);
  const sector = pickRandom(CFG.TARGET_SECTORS);
  const city = pickRandom(CFG.TARGET_CITIES);
  writeLog("Company Search", `Searching ${sector} in ${city}`);
  const companies = fetchCompaniesFromAI(sector, city);
  if (!companies) return 0;
  let added = 0;
  companies.forEach(company => {
    const email = String(company.email || "").toLowerCase().trim();
    if (!email || !company.company || knownEmails.has(email)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[^\x00-\x7F]/.test(email)) return;
    queue.appendRow([company.company.trim(), email, company.sector || sector, company.city || city, "AI search", new Date(), "Pending"]);
    knownEmails.add(email);
    added++;
  });
  writeLog("Company Search", `${companies.length} results received; ${added} new companies added`);
  return added;
}
function fetchCompaniesFromAI(sector, city) {
  if (!CFG.GROQ_API_KEY) throw new Error("Set the GROQ_API_KEY Script Property before searching.");
  const prompt = `Find real technology or software companies based in or hiring remotely from ${city}, Turkey, in the ${sector} sector. Provide a publicly listed recruiting or careers email when available. Never guess or invent an email address. Return only a JSON array with objects shaped like {"company":"Example Company","email":"careers@example.com","sector":"${sector}","city":"${city}"}. Return up to 20 results; do not include markdown or commentary.`;
  try {
    const response = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "post", contentType: "application/json", muteHttpExceptions: true,
      headers: {Authorization: "Bearer " + CFG.GROQ_API_KEY},
      payload: JSON.stringify({model:"llama-3.1-8b-instant", messages:[{role:"user",content:prompt}], temperature:0.4, max_tokens:2048})
    });
    if (response.getResponseCode() !== 200) {
      writeLog("AI Error", `HTTP ${response.getResponseCode()}: ${response.getContentText().substring(0, 200)}`);
      return null;
    }
    const data = JSON.parse(response.getContentText());
    const text = data.choices?.[0]?.message?.content || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) { writeLog("AI Error", "The response did not contain a JSON array."); return null; }
    return JSON.parse(match[0]);
  } catch (error) { writeLog("AI Error", error.message); return null; }
}
function collectKnownEmails(...sheets) {
  const emails = new Set();
  sheets.filter(Boolean).forEach(sheet => sheet.getDataRange().getValues().slice(1).forEach(row => {
    const email = String(row[1] || "").toLowerCase().trim();
    if (email) emails.add(email);
  }));
  return emails;
}
function pickRandom(items) { return items[Math.floor(Math.random() * items.length)]; }
