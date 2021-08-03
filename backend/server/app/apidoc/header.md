### 概略說明
SKYLENS 2.0大部分的API都改成為GraphQL，可以透過瀏覽器打開 `/gql/2.0` 查看GraphQL的schema。

現階段會用到一般RESTful API的只有少數，例如：圖像驗證、或是需要上傳、下載檔案的時候。

### SKYLENS AP1啟動方式
本機啟動
```
cd ./ap1/backend
node server
```

stage模式
```
npm run stage
```

---

### GraphQL playgroud
用瀏覽器打開 `/gql/2.0` 就會進入 playgroud，在這邊可以看到GQL的schema以及說明。  
需要注意的是，playground預設 **不會傳送cookies** ，因此要自己打開：  
在playground的頁面右上角點擊設定符號，將 `request.credentials`設定為`same-origin`即可。  
另外，由於playground會一直對後端long polling，因此可以將`schema.polling.interval`設定高一點，以免造成主機loading。(預設是2秒一次，建議改高一點)

若是不想開啟`request.credentials`，SKYLENS也允許使用header帶入access_token：
```
Authorization: Bearer ${access_token}
```

---

### 登入驗證
SKYLENS 2.0的登入步驟跟1.0差不多，都需要雙重登入。  
登入過後系統會自動把JWT寫入client的cookies裡，之後系統也會自動去驗證，所以前端不需要考量太多。  
JWT在cookies裡的變數為`__SLT`，是httpOnly以及signed，因此前端無法直接存取。如果需要判斷該使用者是否為登入狀態，可以透過 GQL 的 `user_me` 得知狀態。

---

### Cookies的規定
中華會針對網站進行弱掃，依照中華的規範：
- cookies一定要是sercure
- cookies**不可以**設定expires

因此，若是有部分資訊不希望因為瀏覽器關閉而消失，請儲存於local-storage。

---

### 語系
SKYLENS 2.0預計支援的語系為中文(zh)、英文(en)以及日文(ja)。  
基本上系統會先抓取瀏覽器預設的語系，如果使用者有登入並且有將語系資訊寫入到cookies裡，則會以cookies裡的設定為優先。  
如果使用者的語系不屬於zh、en、ja，則會預設為en。

語系資訊儲存在cookies裡的`__lang`變數裡。

為了不跟前端流程產生衝突，**後端不會主動改變**cookies裡`__lang`的值，僅判斷`__lang`的值來決定回傳資料的語言種類，前端頁面呈現的語系切換權由前端自己處理。  
如果需要切換語系，前端可以在使用者登入後取得該使用者語系後，自行複寫`__lang`即可。

---

### 透過GraphQL進行資料的更新
後端這邊會判斷前端是否有帶入需更新的欄位，有帶值的欄位才會被更新，**空字串或是空陣列也會被視為是有值**。  
因此若是該欄位不需更新，則不要賦予該欄位任何的值。

### 透過GraphQL刪除資料的回傳值
只要是刪除資料，GraphQL只會回傳`OK`的字串。

---

### 模組的設定
因為SKYLENS 2.0會有非常多模組，每個模組的設定值也都不同，很難用GraphQL的schema來表達(會非常繁複)。所以模組的設定將會採用JSON字串的方式儲存，需要取得設定資料時，再從字串還原成物件。  
但也因為模組的設定值是前後端都需要處理的，仍然需要定義每一個模組的設定值規格，因此在GraphQL的`module_code_all`裡有一個`setting_template`的欄位，定義了該模組的設定值樣板。前端傳來的設定需要遵守樣板的規格，否則後端將會產生錯誤。

在存取分析資料時，後端將會依照`project_id`、`module_code`來取得該專案該模組可以存取的資料範圍，並回傳給前端。 |

### 其他的
還沒想到，想到會繼續補上。