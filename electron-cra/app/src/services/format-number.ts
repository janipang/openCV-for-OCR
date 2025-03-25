export function formatNumberRanges(numbers: number[]) {
  if (!numbers.length) return "";

  numbers.sort((a, b) => a - b); // เรียงลำดับตัวเลข
  let result = [];
  let start = numbers[0];
  let end = start;

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === end + 1) {
      end = numbers[i]; // ขยายช่วงต่อเนื่อง
    } else {
      result.push(start === end ? `${start}` : `${start}-${end}`);
      start = numbers[i];
      end = start;
    }
  }
  
  result.push(start === end ? `${start}` : `${start}-${end}`); // เพิ่มตัวสุดท้าย
  
  return result.join(","); // number -> string
}

export function parseNumberRanges(input: string): number[] {
  if (!input.trim()) return []; // ถ้าเป็นค่าว่างให้คืนค่าเป็น []

  let numbers: number[] = [];

  input.split(",").forEach((part) => {
    if (part.includes("-")) {
      // ถ้ามีช่วง เช่น "1-3"
      const [start, end] = part.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        numbers.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i));
      }
    } else {
      // ถ้าเป็นตัวเลขเดี่ยว เช่น "5"
      const num = Number(part);
      if (!isNaN(num)) numbers.push(num);
    }
  });

  return numbers; // string -> number
}

export function validateNumberRangeInput(input: string) {
  // ตรวจสอบว่าข้อมูลเป็นค่าว่างหรือไม่
  if (!input.trim()) return { valid: false, error: "ห้ามเว้นว่าง" };

  // ตรวจสอบรูปแบบด้วย Regular Expression
  const pattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
  if (!pattern.test(input)) {
    return { valid: false, error: "รูปแบบไม่ถูกต้อง (ต้องเป็น 1-3,5,7-10)" };
  }

  // แยกข้อมูลเป็นอาร์เรย์
  const parts = input.split(",").map(part => part.trim());

  for (let part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);

      // ตรวจสอบค่าที่อยู่ในช่วง
      if (isNaN(start) || isNaN(end) || start >= end) {
        return { valid: false, error: `ช่วงไม่ถูกต้อง: "${part}" (ตัวเลขแรกต้องน้อยกว่าตัวเลขหลัง)` };
      }
    } else {
      const num = Number(part);
      if (isNaN(num)) {
        return { valid: false, error: `ค่าผิดพลาด: "${part}" ไม่ใช่ตัวเลข` };
      }
    }
  }

  return { valid: true, error: null };
}