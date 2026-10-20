# Job Application Outreach Tracker

A multi-file Google Apps Script workflow for finding potential employers with the Groq API, maintaining an outreach queue in Google Sheets, sending resume emails through Gmail, tracking replies, and logging activity.

## Requirements

- A Google account with Apps Script, Google Sheets, Google Drive, and Gmail access.
- A Groq API key.
- Two resume PDFs in Google Drive: one local-language copy and one English copy.

## Setup

1. Create a Google Sheet and open **Extensions > Apps Script**. Add every `.gs` file in this folder to the same Apps Script project.
2. In **Project Settings > Script Properties**, add the properties below:

   | Property | Value |
   | --- | --- |
   | `SPREADSHEET_ID` | ID from your spreadsheet URL |
   | `GROQ_API_KEY` | Your Groq API key |
   | `FULL_NAME` | Sender name |
   | `CONTACT_EMAIL` | Contact email |
   | `PHONE` | Phone number (optional) |
   | `LINKEDIN_URL` | Profile URL (optional) |
   | `RESUME_LOCAL_PDF_FILE_ID` | Drive file ID for the local-language resume PDF |
   | `RESUME_ENGLISH_PDF_FILE_ID` | Drive file ID for the English resume PDF |

3. Review `DAILY_LIMIT`, `TARGET_SECTORS`, and `TARGET_CITIES` in `Config.gs`.
4. Run `initializeSheets` once. **This clears existing contents** in the Queue, Sent, Replies, and Log tabs before rebuilding their headers. Use a new or backed-up spreadsheet.
5. Review the generated Queue, verify all company contact details, and inspect the email template in `SendMails.gs` before sending.
6. Run individual functions as needed: `searchCompaniesOnly`, `sendEmailsOnly`, `checkRepliesOnly`, or `showStatistics`.
7. To enable automation, run `installDailyTriggers` after you have reviewed the queue and configuration. It creates daily triggers at 08:00, 09:00, and 18:00 in the script time zone.

## Files

- `Config.gs`: Script Properties, sheet names, target sectors and cities, and send limit.
- `Setup.gs`: Creates and formats the required spreadsheet tabs.
- `FindFirm.gs`: Requests potential employers and contact addresses from Groq. Verify results; the model may return incorrect information.
- `SendMails.gs`: Sends resume emails and updates queue status.
- `TrackMails.gs`: Marks detected delivery failures, records replies, and applies a basic keyword label.
- `Main.gs`: Manual entry points, triggers, logging, and statistics.

## Privacy and responsible use

Never commit API keys, personal details, spreadsheet IDs, Drive file IDs, recipient lists, or message contents. Keep private configuration in Script Properties. Contact only appropriate business addresses, follow applicable privacy and anti-spam requirements, and review AI-generated results before sending. Reply labels are heuristic and require human review.


---

## Türkçe

Groq API ile potansiyel işverenleri araştıran, Google E-Tablolar'da başvuru kuyruğunu tutan, Gmail ile e-posta gönderen, yanıtları izleyen ve etkinlikleri kaydeden bir Google Apps Script iş akışıdır.

### Gereksinimler

- Apps Script, Google E-Tablolar, Google Drive ve Gmail erişimi olan bir Google hesabı.
- Groq API anahtarı.
- Drive'da biri yerel dilde, diğeri İngilizce iki PDF özgeçmiş.

### Kurulum

1. Bir Google E-Tablosu oluşturup **Uzantılar > Apps Script** bölümünü açın. Bu klasördeki tüm `.gs` dosyalarını aynı projeye ekleyin.
2. **Proje Ayarları > Komut Dosyası Özellikleri** bölümüne aşağıdakileri ekleyin:

   | Özellik | Değer |
   | --- | --- |
   | `SPREADSHEET_ID` | E-tablo URL'sindeki kimlik |
   | `GROQ_API_KEY` | Groq API anahtarınız |
   | `FULL_NAME` | Gönderen adı |
   | `CONTACT_EMAIL` | İletişim e-postası |
   | `PHONE` | Telefon (isteğe bağlı) |
   | `LINKEDIN_URL` | Profil bağlantısı (isteğe bağlı) |
   | `RESUME_LOCAL_PDF_FILE_ID` | Yerel dildeki özgeçmişin Drive dosya kimliği |
   | `RESUME_ENGLISH_PDF_FILE_ID` | İngilizce özgeçmişin Drive dosya kimliği |

3. `Config.gs` içindeki `DAILY_LIMIT`, `TARGET_SECTORS` ve `TARGET_CITIES` ayarlarını inceleyin.
4. `initializeSheets` işlevini bir kez çalıştırın. **Bu işlem**, Queue, Sent, Replies ve Log sekmelerinin mevcut içeriğini silerek başlıkları yeniden oluşturur. Yeni veya yedeklenmiş bir e-tablo kullanın.
5. Queue sekmesini inceleyip firma iletişim bilgilerini doğrulayın ve göndermeden önce `SendMails.gs` e-posta şablonunu kontrol edin.
6. Gerektiğinde `searchCompaniesOnly`, `sendEmailsOnly`, `checkRepliesOnly` veya `showStatistics` işlevlerini kullanın.
7. Otomasyon için kuyruğu ve ayarları inceledikten sonra `installDailyTriggers` işlevini çalıştırın. Betik saat diliminde 08:00, 09:00 ve 18:00 saatlerinde günlük tetikleyiciler kurar.

### Dosyalar

- `Config.gs`: Gizli ayarlar, sekme adları, hedef sektörler ve şehirler ile gönderim sınırı.
- `Setup.gs`: Gerekli e-tablo sekmelerini oluşturur ve biçimlendirir.
- `FindFirm.gs`: Groq'tan potansiyel işveren ve iletişim adresleri ister. Sonuçlar yanlış olabileceğinden doğrulayın.
- `SendMails.gs`: Özgeçmiş e-postaları gönderir ve kuyruk durumunu günceller.
- `TrackMails.gs`: Teslimat hatalarını işaretler, yanıtları kaydeder ve anahtar kelime sınıflandırması yapar.
- `Main.gs`: Elle çalıştırma işlevleri, tetikleyiciler, kayıtlar ve istatistikler.

### Gizlilik ve sorumlu kullanım

API anahtarlarını, kişisel bilgileri, e-tablo ve Drive kimliklerini, alıcı listelerini veya e-posta içeriklerini GitHub'a yüklemeyin. Gizli ayarları Komut Dosyası Özellikleri'nde tutun. AI tarafından bulunan sonuçları göndermeden önce doğrulayın ve gizlilik ile istenmeyen ileti kurallarına uyun. Yanıt etiketleri tahminidir; insan tarafından incelenmelidir.