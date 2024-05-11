const puppeteer = require("puppeteer");
require("dotenv").config();

const maxAttempts = 3;

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const clickButtonByText = async (page, buttonText) => {
  // 尋找按鈕位置
  const location = await page.evaluate(async (text) => {
    const elements = Array.from(document.querySelectorAll("button"));
    const targetElement = elements.find((el) => el.textContent.includes(text));

    // 確保按鈕可見
    await targetElement.scrollIntoView();

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return null;
  }, buttonText);

  // 點擊按鈕
  if (location) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Click attempt ${attempt}`);
      await page.mouse.click(location.x, location.y);
      await delay(500);
      // 目前沒有做檢查是否打卡成功
    }
    return true;
  } else {
    console.log("Element not found.");
    return false;
  }
};

const clockIn = async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: false });
  const context = browser.defaultBrowserContext();

  // 允許網站使用位置資訊
  await context.overridePermissions(process.env.URL, [
    "geolocation",
    "notifications",
  ]);

  try {
    const page = await browser.newPage();
    await page.goto(process.env.URL);
    console.log("進入登入頁面");

    // 更改網站使用位置資訊
    await page.setGeolocation({
      latitude: Number(process.env.LATITUDE),
      longitude: Number(process.env.LONGITUDE),
      accuracy: 50,
    });

    // 登入
    await page.type('input[name="inputCompany"]', process.env.ENTITY);
    await page.type('input[name="inputID"]', process.env.ACCOUNT);
    await page.type('input[name="inputPassword"]', process.env.PASSWORD);
    await page.click(
      "button.el-button.login-button.el-button--primary.por-button"
    );
    console.log("輸入登入資訊");

    // 等待頁面導航完成
    await page.waitForNavigation();
    console.log("登入後頁面導航完成");

    await delay(2000);
    console.log("等兩秒鐘");

    clickButtonByText(page, process.env.ACTION_TEXT);
  } catch (error) {
    console.error(error);
  } finally {
    // await browser.close();
  }
};

clockIn();
