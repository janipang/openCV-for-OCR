export function formatDateTime(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // ตัวเลือกสำหรับฟอร์แมตวันที่
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // ใช้ 24 ชั่วโมง
  };

  return date.toLocaleString("en-GB", options).replace(",", "");
}

// 🔹 ตัวอย่างการใช้งาน:
console.log(formatDateTime(new Date())); // 29 Dec 2024 17:05:00
console.log(formatDateTime("2024-12-29T17:05:00Z")); // 29 Dec 2024 17:05:00