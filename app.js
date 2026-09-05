"use strict";

/*
 * AI.SW 부천연합해커톤 오후 프로젝트 스타터
 *
 * 이 파일의 예시 기능은 실행 환경 확인용입니다.
 * 프로젝트 기획이 승인되면 팀의 핵심 기능으로 교체하세요.
 *
 * 작업 원칙:
 * 1. 한 번에 기능 하나만 구현합니다.
 * 2. AI가 수정한 내용을 두 팀원이 함께 확인합니다.
 * 3. 실행하고 테스트한 뒤 커밋합니다.
 * 4. 개인정보나 API 키를 코드에 입력하지 않습니다.
 */

const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const resultBox = document.querySelector("#result");
const appStatus = document.querySelector("#app-status");
const headlineInput = document.querySelector("#headline-input");
const characterCount = document.querySelector("#character-count");

const sensationalPatterns = [
  { pattern: /충격|경악|소름|발칵|난리/, label: "강한 감정 표현" },
  { pattern: /비밀|전부 공개|아무도 몰랐|믿기 힘든/, label: "호기심을 자극하는 표현" },
  { pattern: /무조건|100%|절대|역대급|최고의/, label: "단정적·과장 표현" },
];

function showRunningMessage() {
  const headline = headlineInput.value.trim();

  if (!headline) {
    resultBox.textContent = "헤드라인을 입력한 뒤 분석해 주세요.";
    resultBox.classList.remove("is-success");
    appStatus.textContent = "입력 필요";
    headlineInput.focus();
    return;
  }

  const matchedPatterns = sensationalPatterns.filter(({ pattern }) =>
    pattern.test(headline),
  );

  if (matchedPatterns.length > 0) {
    resultBox.innerHTML = `<strong>주의가 필요한 표현이 ${matchedPatterns.length}개 발견되었습니다.</strong><span>${matchedPatterns.map(({ label }) => label).join(" · ")}<br />표현만으로 사실 여부를 판단할 수 없으니 원문과 출처를 함께 확인하세요.</span>`;
    resultBox.classList.remove("is-success");
    appStatus.textContent = "주의 표현 감지";
    return;
  }

  resultBox.innerHTML = "<strong>눈에 띄는 낚시성 표현이 발견되지 않았습니다.</strong><span>다만 제목만으로 기사의 신뢰성을 보장할 수는 없습니다. 본문과 출처를 확인하세요.</span>";
  resultBox.classList.add("is-success");
  appStatus.textContent = "1차 점검 완료";
}

function updateCharacterCount() {
  characterCount.textContent = `${headlineInput.value.length} / 200`;
}

function resetDemo() {
  resultBox.textContent =
    "헤드라인을 입력하면 분석 결과가 표시됩니다.";

  resultBox.classList.remove("is-success");

  appStatus.textContent = "분석 대기";
  headlineInput.value = "";
  updateCharacterCount();
}

startButton.addEventListener("click", showRunningMessage);
resetButton.addEventListener("click", resetDemo);
headlineInput.addEventListener("input", updateCharacterCount);

/*
 * TODO: 아래 순서로 팀 프로젝트를 구현하세요.
 *
 * 1. PROJECT_PLAN.md에 핵심 기능과 완료 기준을 작성합니다.
 * 2. index.html의 시연 영역을 프로젝트에 맞게 수정합니다.
 * 3. 사용자의 입력을 가져옵니다.
 * 4. 규칙 또는 데이터에 따라 결과를 계산합니다.
 * 5. 계산 결과와 판단 이유를 화면에 표시합니다.
 * 6. 정상 입력, 잘못된 입력, 경계값을 테스트합니다.
 * 7. TEST_CHECKLIST.md와 AI_LOG.md를 작성합니다.
 *
 * 규칙 기반 AI 예시:
 *
 * function makeRecommendation(score) {
 *   if (score >= 80) {
 *     return {
 *       result: "추천",
 *       reason: "안전 기준을 충분히 통과했습니다."
 *     };
 *   }
 *
 *   return {
 *     result: "다시 확인",
 *     reason: "사용자가 직접 검토할 항목이 남아 있습니다."
 *   };
 * }
 */
