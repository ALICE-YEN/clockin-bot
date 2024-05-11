export const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

export const getRandomLocation = (locations) => {
  return locations[Math.floor(Math.random() * locations.length)];
};

export const getButtonLocationByText = async (page, buttonText) => {
  return await page.evaluate(async (text) => {
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
};

export const clickButtonByLocation = async (
  page,
  location,
  maxAttempts = 1
) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Click attempt ${attempt}`);
    await page.mouse.click(location.x, location.y);
    await delay(500);
    // 目前沒有做檢查是否打卡成功
  }
};
