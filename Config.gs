/** Shared settings for the outreach tracker. Store private values in Script Properties. */
const CFG = {
  get SHEET_ID() { return PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || ""; },
  get GROQ_API_KEY() { return PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY") || ""; },
  DAILY_LIMIT: 10,
  SHEETS: { QUEUE: "Queue", SENT: "Sent", REPLIES: "Replies", LOG: "Log" },
  TARGET_SECTORS: ["software", "technology", "finance", "e-commerce"],
  TARGET_CITIES: ["Istanbul", "Ankara", "Izmir", "Remote"],
  PROFILE: {
    fullName: PropertiesService.getScriptProperties().getProperty("FULL_NAME") || "[YOUR FULL NAME]",
    phone: PropertiesService.getScriptProperties().getProperty("PHONE") || "",
    email: PropertiesService.getScriptProperties().getProperty("CONTACT_EMAIL") || "[YOUR EMAIL]",
    linkedin: PropertiesService.getScriptProperties().getProperty("LINKEDIN_URL") || "",
    localResumeFileId: PropertiesService.getScriptProperties().getProperty("RESUME_LOCAL_PDF_FILE_ID") || "",
    englishResumeFileId: PropertiesService.getScriptProperties().getProperty("RESUME_ENGLISH_PDF_FILE_ID") || ""
  }
};
