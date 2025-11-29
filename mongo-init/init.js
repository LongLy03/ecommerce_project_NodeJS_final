// Tự động import tất cả các file .json trong thư mục /mongo-init

// Lấy danh sách file JSON qua shell
var files = run("bash", "-lc", "ls /mongo-init/*.json").split("\n");

var dbName = "ecommerce";
db = db.getSiblingDB(dbName);

files.forEach(path => {
  if (!path.endsWith(".json")) return;

  // Tên file
  var fileName = path.split("/").pop();

  // Collection = tên file bỏ đuôi .json
  var collection = fileName.replace(".json", "");

  print(`>>> Importing ${fileName} into collection ${collection}`);

  var data = JSON.parse(cat(path));

  db[collection].drop();
  db[collection].insertMany(data);
});

print(">>> DONE IMPORTING ALL JSON FILES <<<");