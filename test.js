const fs = require("fs");

// Đọc file và chuyển đổi nội dung thành mảng các dòng
const fileContent = fs.readFileSync("qa.txt", "utf-8");
const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

// Khởi tạo mảng kết quả
const result = [];

// Lặp qua từng dòng và chuyển đổi thành đối tượng JSON
for (let i = 0; i < lines.length; i += 4) {
  const question = lines[i].split(":")[1].trim();
  console.log(question);
  const options = [
    lines[i + 1].split(".")[1].trim(),
    lines[i + 2].split(".")[1].trim(),
    lines[i + 3].split(".")[1].trim(),
  ];

  result.push({
    question,
    answer: options,
    selected: "",
  });
}
console.log(result);

// Lưu kết quả vào file JSON
fs.writeFileSync("output.json", JSON.stringify(result, null, 2));

console.log("Chuyển đổi thành công và lưu vào file output.json");
