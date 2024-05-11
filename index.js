import puppeteer from "puppeteer";
import "dotenv/config";
import { validLocations } from "./constants.js";
import {
  delay,
  getRandomLocation,
  getButtonLocationByText,
  clickButtonByLocation,
} from "./helpers.js";

const maxAttempts = 3;

const clockIn = async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
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
    const randomLocation = getRandomLocation(validLocations);
    await page.setGeolocation({
      latitude: randomLocation.latitude,
      longitude: randomLocation.longitude,
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

    const buttonLocation = await getButtonLocationByText(
      page,
      process.env.ACTION_TEXT
    );

    if (buttonLocation) {
      clickButtonByLocation(page, buttonLocation, maxAttempts);
    } else {
      console.log("Element not found.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    // await browser.close();
  }
};

clockIn();
