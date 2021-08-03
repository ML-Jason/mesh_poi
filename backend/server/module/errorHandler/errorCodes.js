const codes = [
  // E001xxx
  // 一般通用
  { code: 'E001001', http: 401, message: { zh: '沒有權限', en: 'Permission denied.' } },
  { code: 'E001002', http: 429, message: { zh: '超過存取次數限制', en: 'Access limits exceeded.' } },
  { code: 'E001003', http: 403, message: { zh: '不允許的存取', en: 'Access not permitted.' } },
  { code: 'E001004', http: 401, message: { zh: '錯誤的登入驗證', en: 'Invalid token.' } },
  { code: 'E001005', http: 401, message: { zh: '登入已經過期', en: 'Token expired.' } },
  { code: 'E001006', http: 400, message: { zh: '無效的資料', en: 'Invalid data.' } },
  { code: 'E001007', http: 400, message: { zh: '沒有這筆資料', en: 'There is no matching data for your query.' } },
  { code: 'E001008', http: 400, message: { zh: '錯誤的檔案格式', en: 'Invalid data format.' } },
  { code: 'E001009', http: 400, message: { zh: '錯誤的日期格式', en: 'Invalid date fromat.' } },
  { code: 'E001010', http: 400, message: { zh: '起始日期不能大於終止日期', en: 'Start date can not larger than end date.' } },

  // E002xxx
  // user相關
  { code: 'E002001', http: 400, message: { zh: '錯誤的帳號密碼', en: 'Username or password is incorrect.' } },
  { code: 'E002002', http: 400, message: { zh: '錯誤的Email格式', en: 'Invalid Email fromat.' } },
  { code: 'E002003', http: 400, message: { zh: '密碼為長度為5-20的英文數字混合，可以允許@_及.，其他特殊字元不可使用', en: 'Password must be 5-20 alphanumeric characters, inclusion of @ _ and . is allowed. Inclusion of any other special character is prohibited.' } },
  { code: 'E002004', http: 400, message: { zh: '錯誤的驗證碼', en: 'Invalid verification code.' } },
  { code: 'E002005', http: 400, message: { zh: '錯誤的權限設定', en: 'Invalid permission settings.' } },
  { code: 'E002006', http: 400, message: { zh: 'Email已經被使用', en: 'Email has already been taken.' } },
  { code: 'E002007', http: 400, message: { zh: '沒有這個使用者', en: 'Invalid user.' } },
  { code: 'E002008', http: 400, message: { zh: '登入錯誤五次，請稍候再試', en: 'Login failed 5 times, please try again later' } },
  { code: 'E002009', http: 400, message: { zh: '錯誤的圖像驗證碼', en: 'Invalid verification code.' } },
  { code: 'E002010', http: 400, message: { zh: '帳號登入錯誤次數過多，帳號鎖定，請重設密碼', en: '' } },
  { code: 'E002011', http: 400, message: { zh: '您的帳號或密碼有誤，請再次確認並填入正確帳號密碼再登入！(您仍有{{$msg}}次嘗試機會)', en: 'Login failed. You have $msg times to try.' } },
  { code: 'E002012', http: 400, message: { zh: '此帳號已被停止使用', en: 'The account currently stopped' } },

  // E003xxx
  // organization相關
  { code: 'E003001', http: 400, message: { zh: '錯誤的公司名稱', en: 'Invalid company name.' } },
  { code: 'E003002', http: 400, message: { zh: '錯誤的統一編號', en: 'Invalid tax ID number.' } },
  { code: 'E003003', http: 400, message: { zh: '錯誤的產業別', en: 'Invalid industry.' } },
  { code: 'E003004', http: 400, message: { zh: '請填寫聯絡人姓名', en: 'Please fill in contact information.' } },
  { code: 'E003005', http: 400, message: { zh: '錯誤的性別', en: 'Please select  gender.' } },
  { code: 'E003006', http: 400, message: { zh: '錯誤的Email格式', en: 'Invalid Email format.' } },
  { code: 'E003007', http: 400, message: { zh: '請至少填寫一個聯絡電話', en: 'Please fill in at least 1 contact number.' } },
  { code: 'E003008', http: 400, message: { zh: '該公司資料已經存在', en: 'The company has been taken.' } },
  { code: 'E003009', http: 400, message: { zh: '沒有這個公司', en: 'There is no matching company.' } },

  // E004xxx
  // project相關
  { code: 'E004001', http: 400, message: { zh: '錯誤的專案名稱', en: 'Invalid project name.' } },
  { code: 'E004002', http: 400, message: { zh: '錯誤的產業別', en: 'Invalid industry.' } },
  { code: 'E004003', http: 400, message: { zh: '請選擇使用時間', en: 'Please select period of usage.' } },
  { code: 'E004004', http: 400, message: { zh: '請選擇專案所屬的會員', en: 'Please select members of the project.' } },
  { code: 'E004005', http: 400, message: { zh: '沒有這個專案', en: 'There is no matching project.' } },
  { code: 'E004006', http: 400, message: { zh: '無效的模組代號', en: 'Invalid module code.' } },
  { code: 'E004007', http: 400, message: { zh: '相同的專案名稱已經存在', en: 'The project name has been taken.' } },
  { code: 'E004008', http: 400, message: { zh: '此模組無法存取此種資料', en: 'The module is not allowed to access the data.' } },
  { code: 'E004009', http: 400, message: { zh: '此專案沒有使用此模組', en: 'The project is not allowed to use this module.' } },

  // E005xxx
  // media相關
  { code: 'E005001', message: '請填寫網站名稱', message_en: 'Please fill in website name.' },
  { code: 'E005002', message: '錯誤的網址', message_en: 'Invalid url.' },
  { code: 'E005003', message: '已經有相同的網址', message_en: 'The url has been taken.' },
  { code: 'E005004', message: '錯誤的產業類型名稱', message_en: 'Invalid industy type.' },
  { code: 'E005005', message: '錯誤的產業標籤名稱', message_en: 'Invalid industry tag.' },
  { code: 'E005006', message: '相同的名稱已經存在', message_en: 'The name has been taken.' },

  // E007xxx，Hinet Ad相關
  { code: 'E007001', message: '請填寫至少三個網址', message_en: 'At least three domains needed.' },
  { code: 'E007002', message: '錯誤的性別參數', message_en: 'Invalid gender parameter.' },
  { code: 'E007003', message: '授權失敗', message_en: 'Authorization failure.' },
  { code: 'E007004', message: '請填寫受眾包名稱', message_en: 'Audience package name is required.' },
  { code: 'E007005', message: '請選擇最少一個投放場域', message_en: 'Please select at least one cm field.' },

  // E011xxx
  // 系統內部錯誤，僅顯示簡單訊息
  { code: 'E011001', http: 400, message: { zh: '系統錯誤，無效的ID', en: 'System error: invalid ID.' } },
  { code: 'E011002', http: 400, message: { zh: '系統錯誤，無效的方法', en: 'System error: invalid method.' } },
  { code: 'E011003', http: 400, message: { zh: '系統錯誤，無效的資料', en: 'System error: invalid data.' } },
  { code: 'E011004', http: 500, message: { zh: '系統錯誤 (E0011004)', en: 'System error (E0011004).' } },
  { code: 'E011005', http: 500, message: { zh: '系統錯誤 (E0011005) {{$msg}}', en: 'System error (E0011005). {{$msg}}' } },
];

// 轉換成Object，速度應該會比搜尋整個Array快一點
const codesMap = {};
codes.forEach((v) => {
  codesMap[v.code] = v;
});

const _public = {};

// 用code字串來回傳error的物件
_public.get = (c) => {
  const found = codesMap[c];
  if (found) return found;
  return { code: '', http: 500, message: { zh: '未知的錯誤', en: 'Unexpectped error.' } };
};

_public.toMessage = (errobj, texts = [], lang = 'zh') => {
  const _texts = (Array.isArray(texts) ? texts : [texts]);
  let errmsg = '';
  const msgs = errobj.message[lang].split('{{$msg}}');
  for (let i = 0; i < msgs.length; i += 1) {
    errmsg += msgs[i];
    if (_texts[i]) errmsg += _texts[i];
  }
  return errmsg;
};

_public.codeMessage = (code, texts = [], lang = 'zh') => {
  const errobj = _public.get(code);
  return _public.toMessage(errobj, texts, lang);
};

module.exports = _public;
