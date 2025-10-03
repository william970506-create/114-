const guessSubmit = document.querySelector(".guessSubmit");
const guessField = document.querySelector(".guessField");
const result = document.querySelector(".result");
const count = document.querySelector(".count");

let countNum = 0;   //廣域變數
const answer = Math.floor(Math.random() * 100) + 1; //隨機答案

function checkGuess() {
    countNum++;
    count.textContent = "猜測次數：" + countNum;
    const userGuess = Number(guessField.value);  //取得欄位值，並轉為數字

    if (userGuess === answer) {
        result.textContent = "猜測結果：Congratulations!";
    } else if (userGuess < answer) {
        result.textContent = "猜測結果：數字太小!";
    } else if (userGuess > answer) {
        result.textContent = "猜測結果：數字太大!";
    }
    guessField.focus(); //游標焦點預設在輸入欄位裡
}

guessSubmit.addEventListener("click", checkGuess);   //當按鈕被點擊，執行函式