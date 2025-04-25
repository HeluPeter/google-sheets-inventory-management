# Google Apps Script Setup Guide

<details>
<summary>🇺🇸 English</summary>

# Google Apps Script Setup Guide

## Step 1: Create a Google Sheet

Create a new Google Sheet with the following columns in the first row:

| A   | B    | C     | D             | E     | F     |
| --- | ---- | ----- | ------------- | ----- | ----- |
| ID  | Name | Price | Quantity Sold | Stock | Color |

---

## Step 2: Create a Google Apps Script

In the Google Sheet, go to `Extensions > Apps Script` and paste the following code:

```javascript
function doGet(e) {
  const action = e.parameter.action;

  switch (action) {
    case "getProducts":
      return getProducts();
    default:
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid action",
        })
      ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);

  switch (action) {
    case "addProduct":
      return addProduct(data);
    case "updateProduct":
      return updateProduct(data);
    case "deleteProduct":
      return deleteProduct(data);
    default:
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid action",
        })
      ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  if (values.length === 0) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        products: [],
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const products = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0] === "") continue;

    products.push({
      rowIndex: i + 1,
      id: row[0],
      name: row[1],
      price: row[2],
      quantitySold: row[3],
      stock: row[4],
      color: row[5] || "#0ea5e9",
    });
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      products: products,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function addProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = Math.max(1, sheet.getLastRow());

  if (lastRow === 1 && sheet.getRange(1, 1).getValue() === "") {
    sheet
      .getRange(1, 1, 1, 6)
      .setValues([["ID", "Name", "Price", "Quantity Sold", "Stock", "Color"]]);
  }

  const newId =
    lastRow === 1 ? 1 : parseInt(sheet.getRange(lastRow, 1).getValue()) + 1;

  sheet.appendRow([
    newId,
    data.name,
    data.price,
    data.quantitySold,
    data.stock,
    data.color,
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      product: {
        rowIndex: lastRow + 1,
        id: newId,
        name: data.name,
        price: data.price,
        quantitySold: data.quantitySold,
        stock: data.stock,
        color: data.color,
      },
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function updateProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet
    .getRange(data.rowIndex, 1, 1, 6)
    .setValues([
      [
        data.id,
        data.name,
        data.price,
        data.quantitySold,
        data.stock,
        data.color,
      ],
    ]);

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      product: {
        rowIndex: data.rowIndex,
        id: data.id,
        name: data.name,
        price: data.price,
        quantitySold: data.quantitySold,
        stock: data.stock,
        color: data.color,
      },
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function deleteProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet.getRange(data.rowIndex, 1, 1, 6).clearContent();

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      rowIndex: data.rowIndex,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Step 3: Deploy as Web App

Deploy your code as a Web App:

1. Click **Deploy > New deployment**
2. In the **Select type** section, choose **Web app**
3. Set the following options:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. Grant permission to the app when prompted
6. Copy the Web App URL provided after deployment

---

## Step 4: Connect This App

Use the copied URL to connect your app:

1. Open the connection configuration in your application
2. Paste the **Google Apps Script Web App URL** where required
3. Click **Connect** to complete the integration and start using the API

</details>

<details>
<summary>🇻🇳 Vietnamese</summary>

# Google Apps Script Setup Guide

## Step 1: Create a Google Sheet

Tạo một Google Sheet mới với các cột sau ở hàng đầu tiên:

| A   | B    | C     | D             | E     | F     |
| --- | ---- | ----- | ------------- | ----- | ----- |
| ID  | Name | Price | Quantity Sold | Stock | Color |

---

## Step 2: Create a Google Apps Script

Trong Google Sheet, vào `Extensions > Apps Script` và dán đoạn mã sau:

```javascript
function doGet(e) {
  const action = e.parameter.action;

  switch (action) {
    case "getProducts":
      return getProducts();
    default:
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid action",
        })
      ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);

  switch (action) {
    case "addProduct":
      return addProduct(data);
    case "updateProduct":
      return updateProduct(data);
    case "deleteProduct":
      return deleteProduct(data);
    default:
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid action",
        })
      ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  if (values.length === 0) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        products: [],
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const products = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0] === "") continue;

    products.push({
      rowIndex: i + 1,
      id: row[0],
      name: row[1],
      price: row[2],
      quantitySold: row[3],
      stock: row[4],
      color: row[5] || "#0ea5e9",
    });
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      products: products,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function addProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = Math.max(1, sheet.getLastRow());

  if (lastRow === 1 && sheet.getRange(1, 1).getValue() === "") {
    sheet
      .getRange(1, 1, 1, 6)
      .setValues([["ID", "Name", "Price", "Quantity Sold", "Stock", "Color"]]);
  }

  const newId =
    lastRow === 1 ? 1 : parseInt(sheet.getRange(lastRow, 1).getValue()) + 1;

  sheet.appendRow([
    newId,
    data.name,
    data.price,
    data.quantitySold,
    data.stock,
    data.color,
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      product: {
        rowIndex: lastRow + 1,
        id: newId,
        name: data.name,
        price: data.price,
        quantitySold: data.quantitySold,
        stock: data.stock,
        color: data.color,
      },
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function updateProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet
    .getRange(data.rowIndex, 1, 1, 6)
    .setValues([
      [
        data.id,
        data.name,
        data.price,
        data.quantitySold,
        data.stock,
        data.color,
      ],
    ]);

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      product: {
        rowIndex: data.rowIndex,
        id: data.id,
        name: data.name,
        price: data.price,
        quantitySold: data.quantitySold,
        stock: data.stock,
        color: data.color,
      },
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function deleteProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet.getRange(data.rowIndex, 1, 1, 6).clearContent();

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      rowIndex: data.rowIndex,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Step 3: Deploy as Web App

Thực hiện triển khai mã của bạn dưới dạng Web App:

1. Nhấp vào **Deploy > New deployment**
2. Trong phần **Select type**, chọn **Web app**
3. Đặt các tùy chọn sau:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Nhấp vào **Deploy**
5. Cấp quyền cho ứng dụng khi được yêu cầu
6. Sao chép URL Web App được cung cấp sau khi triển khai

---

## Step 4: Connect This App

Sử dụng URL vừa sao chép để kết nối ứng dụng của bạn:

1. Mở phần cấu hình kết nối trong ứng dụng bạn đang xây dựng
2. Dán **Google Apps Script Web App URL** vào nơi yêu cầu
3. Nhấn **Connect** để hoàn tất kết nối và bắt đầu sử dụng API

</details>
