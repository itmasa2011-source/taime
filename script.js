
const $ = id => document.getElementById(id);

// 現在時刻をdatetime-local形式に変換
function localDateTime(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset)
    .toISOString().slice(0, 16);
}

// 初期設定
const defaults = {
  title: "MISSION 01",
  brand: "VIVANT",
  brandSub: "25",
  missionNo: "MISSION 00",
  label: "極秘任務開始まであと",
  start: localDateTime(),
  target: "2026-12-1T21:00",
  after: "MISSION START",
  footer: "© 2026 MISSION PROJECT",
  accent: "#16c8f2",
  seconds: true
};

let cfg = { ...defaults };

// 保存済み設定を読み込む
try {
  const saved = localStorage.getItem("missionTimerConfig");

  if (saved) {
    cfg = { ...defaults, ...JSON.parse(saved) };
  }
} catch (error) {
  console.error("設定読み込みエラー", error);
}

// 数字を2桁にする
function pad(n) {
  return String(n).padStart(2, "0");
}

// 設定画面に値を表示
function fillForm() {
  $("missionTitleInput").value = cfg.title;
  $("brandInput").value = cfg.brand;
  $("brandSubInput").value = cfg.brandSub;
  $("missionNoInput").value = cfg.missionNo;
  $("countLabelInput").value = cfg.label;
  $("startInput").value = cfg.start;
  $("targetInput").value = cfg.target;
  $("afterInput").value = cfg.after;
  $("footerInput").value = cfg.footer;
  $("accentInput").value = cfg.accent;
  $("secondsInput").checked = cfg.seconds;
}

// タイマー表示
function render() {

  const now = Date.now();
  const start = new Date(cfg.start).getTime();
  const target = new Date(cfg.target).getTime();

  const valid =
    Number.isFinite(start) &&
    Number.isFinite(target) &&
    target > start;

  document.documentElement.style.setProperty(
    "--accent",
    cfg.accent
  );

  $("missionTitle").textContent = cfg.title;
  $("brand").firstChild.textContent = cfg.brand;
  $("brandSub").textContent = cfg.brandSub;
  $("missionTag").textContent = cfg.missionNo;
  $("countLabel").textContent = cfg.label;
  $("copyright").textContent = cfg.footer;

  $("clock").style.display =
    cfg.seconds ? "block" : "none";

  if (!valid) {
    $("days").textContent = "---";
    $("clock").textContent = "--:--:--";
    $("status").textContent = "INVALID DATE";
    $("ringProgress").style.strokeDashoffset = 565.49;
    return;
  }

  // 円形ゲージの計算
  const remaining = Math.max(0, target - now);
  const duration = target - start;

  const progress = Math.max(
    0,
    Math.min(1, remaining / duration)
  );

  const circumference = 2 * Math.PI * 90;

  $("ringProgress").style.strokeDasharray =
    circumference;

  $("ringProgress").style.strokeDashoffset =
    circumference * (1 - progress);

  // 目標日時の表示
  const date = new Date(cfg.target);

  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  $("dateDisplay").textContent =
    month + "." + day;

  const weekdays = [
    "SUN", "MON", "TUE", "WED",
    "THU", "FRI", "SAT"
  ];

  $("weekday").textContent =
    " (" + weekdays[date.getDay()] + ")";

  const hour = date.getHours();
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  $("startDisplay").textContent =
    ampm + " " + hour12 + ":" +
    pad(date.getMinutes()) + " START";

  // 終了判定
  if (remaining <= 0) {
    $("days").textContent = "0";
    $("clock").textContent = "00:00:00";
    $("status").textContent = cfg.after;
    return;
  }

  // 残り時間の計算
  const total = Math.floor(remaining / 1000);

  const days = Math.floor(total / 86400);
  const hours = Math.floor(total % 86400 / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const seconds = total % 60;

  $("days").textContent = String(days);

  $("clock").textContent =
    pad(hours) + ":" +
    pad(minutes) + ":" +
    pad(seconds);

  $("status").textContent =
    "MISSION IN PROGRESS";
}

// 設定画面を開く
$("openSettings").onclick = () => {
  fillForm();
  $("settingsDialog").showModal();
};

// 設定画面を閉じる
$("closeSettings").onclick = () => {
  $("settingsDialog").close();
};

// 設定を保存
$("settingsForm").onsubmit = event => {

  event.preventDefault();

  const start = $("startInput").value;
  const target = $("targetInput").value;

  // 日時の入力チェック
  if (
    !start ||
    !target ||
    new Date(target).getTime() <=
    new Date(start).getTime()
  ) {
    alert("終了日時は開始日時より後に設定してください。");
    return;
  }

  cfg = {
    title: $("missionTitleInput").value,
    brand: $("brandInput").value,
    brandSub: $("brandSubInput").value,
    missionNo: $("missionNoInput").value,
    label: $("countLabelInput").value,
    start: start,
    target: target,
    after: $("afterInput").value,
    footer: $("footerInput").value,
    accent: $("accentInput").value,
    seconds: $("secondsInput").checked
  };

  // ブラウザに保存
  try {
    localStorage.setItem(
      "missionTimerConfig",
      JSON.stringify(cfg)
    );
  } catch (error) {
    alert("設定を保存できませんでした。");
    return;
  }

  render();

  $("settingsDialog").close();
};

// 初期設定に戻す
$("resetButton").onclick = () => {

  cfg = {
    ...defaults,
    start: localDateTime()
  };

  localStorage.removeItem("missionTimerConfig");

  fillForm();
  render();
};

// 最初の表示
fillForm();
render();

// 1秒ごとに自動更新
setInterval(render, 1000);
