const API = "https://backend-6i2t.onrender.com/predict";

const $dropArea = document.getElementById("drop-area");
const $file = document.getElementById("file");
const $preview = document.getElementById("preview");
const $btn = document.getElementById("btn");
const $result = document.getElementById("result");
const $loader = document.getElementById("loading");
const $scanLine = document.querySelector(".scan-line");
const $resultText = document.getElementById("resultText");

// 드래그 & 드롭
["dragenter", "dragover"].forEach(eventName => {
  $dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
    $dropArea.classList.add("highlight");
  }, false);
});

["dragleave", "drop"].forEach(eventName => {
  $dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
    $dropArea.classList.remove("highlight");
  }, false);
});

$dropArea.addEventListener("drop", e => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    $file.files = files;
    showPreview(files[0]);
  }
});

// 파일 선택 시 미리보기
$file.addEventListener("change", () => {
  if ($file.files.length > 0) {
    showPreview($file.files[0]);
  }
});

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = e => {
    $preview.onload = () => {
      $scanLine.style.width = $preview.clientWidth + "px";
    };
    $preview.src = e.target.result;

    $result.textContent = "";
    $resultText.innerHTML = "";
  };
  reader.readAsDataURL(file);
}

// 서버 업로드 & 예측
$btn.addEventListener("click", async () => {
  if (!$file.files.length) {
    alert("이미지를 선택하세요!");
    return;
  }

  const fd = new FormData();
  fd.append("file", $file.files[0]);

  // 로딩 시작
  $loader.style.display = "inline-block";
  $scanLine.style.display = "block";
  $result.textContent = "";
  $resultText.innerHTML = "";

  try {
    const res = await fetch(API, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "요청 실패");

    // 모델 예측 결과 출력
    if (data.predictions && data.predictions.length > 0) {
      let text = "Top Predictions:\n";
      data.predictions.forEach((p, idx) => {
        text += `${idx + 1}. Label: ${p.label}\n`;
      });
      $result.textContent = text;
    } else if (data.error) {
      $result.textContent = "백엔드 에러: " + data.error;
    } else {
      $result.textContent = "예측 결과를 받지 못했습니다.";
    }

    // DB 세탁법 정보 출력
    if (data.ko_name) {
      $resultText.innerHTML = `
        <h3>${data.ko_name} (${data.predicted_fabric})</h3>
        <p>🧺 세탁법: ${data.wash_method}</p>
        <p>🌬️ 건조법: ${data.dry_method}</p>
        <p>⚠️ 주의사항: ${data.special_note}</p>
      `;
    }

  } catch (e) {
    $result.textContent = "에러: " + e.message;
    $resultText.innerText = "에러: " + e.message;
  } finally {
    // 로딩 종료
    $loader.style.display = "none";
    $scanLine.style.display = "none";
  }
});



