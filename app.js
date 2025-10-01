const API = "https://backend-6i2t.onrender.com/predict"; // 백엔드 predict 엔드포인트
const $file = document.getElementById("file");
const $btn = document.getElementById("btn");
const $result = document.getElementById("result");
const $preview = document.getElementById("preview");
const $loading = document.getElementById("loading");

// 이미지 선택 시 미리보기
$file.addEventListener("change", () => {
  const f = $file.files[0];
  if (f) {
    $preview.src = URL.createObjectURL(f);
  } else {
    $preview.src = "";
  }
});

// 예측 버튼 클릭
$btn.addEventListener("click", async () => {
  const f = $file.files[0];
  if (!f) {
    alert("이미지를 선택하세요!");
    return;
  }

  const fd = new FormData();
  fd.append("file", f);

  // 로딩 표시
  $loading.style.display = "inline-block";
  $result.textContent = "";

  try {
    const res = await fetch(API, { method: "POST", body: fd });
    const json = await res.json();

    if (!res.ok) throw new Error(json.error || "요청 실패");

    // 백엔드 predictions 배열 구조에 맞춰 출력
    if (json.predictions && json.predictions.length > 0) {
      let text = "Top Predictions:\n";
      json.predictions.forEach((p, idx) => {
        text += `${idx + 1}. Label: ${p.label}\n`;
      });
      $result.textContent = text;
    } else if (json.error) {
      $result.textContent = "백엔드 에러: " + json.error;
    } else {
      $result.textContent = "예측 결과를 받지 못했습니다.";
    }
  } catch (e) {
    $result.textContent = "에러: " + e.message;
  } finally {
    // 요청 끝나면 로딩 숨김
    $loading.style.display = "none";
  }
});

