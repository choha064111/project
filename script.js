"use strict";

const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const resultBox = document.querySelector("#result");
const appStatus = document.querySelector("#app-status");
const titleInput = document.querySelector("#news-title");
const bodyInput = document.querySelector("#news-body");
const promptArea = document.querySelector("#prompt-area");
const promptInput = document.querySelector("#ai-prompt");
const copyPromptButton = document.querySelector("#copy-prompt-button");
const copyStatus = document.querySelector("#copy-status");

const ELS_INTERVAL = 2;
const sensationalWords = ["충격", "경악", "대박", "폭로", "긴급", "단독", "소름", "믿을 수 없는", "역대급"];
const absoluteExpressions = ["무조건", "전부", "완벽하게", "확실히", "역대 최초", "100%", "누구나", "절대", "확정"];
const uncertaintyExpressions = ["가능성", "추정", "검토", "전망", "의혹", "잠정", "일부", "알려졌다", "예상"];
const contradictionExpressions = ["아니다", "부인", "사실과 다르", "확인되지 않", "근거가 없", "오해", "반박", "제외"];
const stopWords = new Set([
  "이것",
  "관련",
  "대한",
  "통해",
  "에서",
  "으로",
  "했다",
  "한다",
  "있는",
  "없는",
  "이후",
  "오늘",
  "최근",
]);

function splitSentences(text) {
  return text
    .split(/(?<=[.!?。！？])\s*|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractELS(sentences, interval) {
  if (sentences.length <= interval) return sentences;
  return sentences.filter((sentence, index) => index % interval === 0);
}

function findSensationalWords(title) {
  const normalizedTitle = title.toLowerCase();
  return sensationalWords.filter((word) =>
    normalizedTitle.includes(word.toLowerCase()),
  );
}

function includesAny(text, expressions) {
  const normalizedText = text.toLowerCase();
  return expressions.filter((expression) =>
    normalizedText.includes(expression.toLowerCase()),
  );
}

function extractKeywords(text) {
  return [...new Set(text.match(/[가-힣A-Za-z0-9]{2,}/g) || [])].filter(
    (word) => !stopWords.has(word),
  );
}

function getMeaningfulKeywords(text) {
  return extractKeywords(text).filter((word) => word.length > 1 && !/^\d+$/.test(word));
}

function getNumberClaims(text) {
  return text.match(/\d+(?:\.\d+)?%?|\d+억|\d+만|\d+명/g) || [];
}

function analyzeArticle(title, body, sampledSentences) {
  const titleKeywords = getMeaningfulKeywords(title);
  const bodySentences = splitSentences(body);
  const meaningfulBody = getMeaningfulKeywords(body);
  const matchedKeywords = titleKeywords.filter((keyword) => meaningfulBody.includes(keyword));
  const keywordCoverage = titleKeywords.length ? matchedKeywords.length / titleKeywords.length : 0;
  const detectedWords = findSensationalWords(title);
  const absoluteSignals = includesAny(title, absoluteExpressions);
  const uncertaintySignals = includesAny(body, uncertaintyExpressions);
  const contradictionSignals = includesAny(body, contradictionExpressions);
  const titleNumbers = getNumberClaims(title);
  const bodyNumbers = getNumberClaims(body);
  const evidenceSentences = bodySentences.filter((sentence) =>
    /(?:자료|보고서|통계|연구|발표|조사|전문가|관계자|근거|수치|결과|따르면)/.test(sentence),
  ).length;
  const emotionalPunctuation = (title.match(/[!?]{1,}/g) || []).length;

  const headlineScore = Math.min(100, detectedWords.length * 20 + absoluteSignals.length * 16 + emotionalPunctuation * 8 + (title.length < 14 ? 8 : 0));
  let contextMismatchScore = Math.round((1 - keywordCoverage) * 58 + (evidenceSentences === 0 ? 12 : 0));
  let logicScore = absoluteSignals.length * 15 + (evidenceSentences === 0 ? 12 : 0);
  const reasons = [];

  if (titleNumbers.length && !titleNumbers.some((value) => bodyNumbers.includes(value))) {
    contextMismatchScore += 24;
  }

  if (absoluteSignals.length && uncertaintySignals.length) {
    contextMismatchScore += 15;
    logicScore += 20;
  }

  if (contradictionSignals.length) {
    contextMismatchScore += 15;
    logicScore += 20;
  }

  contextMismatchScore = Math.min(100, contextMismatchScore);
  logicScore = Math.min(100, logicScore + (titleNumbers.length && !bodyNumbers.length ? 20 : 0));
  const riskScore = Math.round(headlineScore * 0.32 + contextMismatchScore * 0.38 + logicScore * 0.3);

  reasons.push(headlineScore >= 35
    ? `제목에 ${[...detectedWords, ...absoluteSignals].join(", ") || "감정적 강조와 단정 표현"}이 있어 사실 전달보다 반응을 유도하는 신호가 큽니다.`
    : "제목의 감정적 강조, 단정 표현, 과도한 구두점 신호가 비교적 낮습니다.");
  reasons.push(titleNumbers.length && !titleNumbers.some((value) => bodyNumbers.includes(value))
    ? `제목의 수치(${titleNumbers.join(", ")})가 본문에서 같은 근거로 확인되지 않아 주장과 근거 사이에 간극이 있습니다.`
    : keywordCoverage < 0.5
      ? `제목 핵심어 중 ${matchedKeywords.length}/${titleKeywords.length || 1}개만 본문 의미어와 연결되어 맥락 일치도가 낮습니다.`
      : `제목 핵심어 ${matchedKeywords.length}개가 본문에도 연결되어 기본 주제 일치가 확인됩니다.`);
  reasons.push(contradictionSignals.length || (absoluteSignals.length && uncertaintySignals.length)
    ? `본문의 ${[...contradictionSignals, ...uncertaintySignals].join(", ")} 표현이 제목의 단정과 충돌해 과장 또는 논리적 비약을 시사합니다.`
    : evidenceSentences > 0
      ? `본문에서 자료·보고서·발표 등 근거를 제시하는 문장이 ${evidenceSentences}개 확인되어 판단의 근거성이 보완됩니다.`
      : "본문에 명시적인 근거 출처가 충분하지 않아 추가 원문 확인이 필요합니다.");

  return {
    score: Math.min(100, riskScore),
    headlineScore,
    contextMismatchScore,
    logicScore,
    detectedWords,
    matchedKeywords,
    reasons: reasons.slice(0, 3),
  };
}

function getJudgement(score) {
  if (score >= 80) {
    return "낚시성 위험 높음";
  }

  if (score >= 40) {
    return "주의해서 확인";
  }

  return "낚시성 위험 낮음";
}

function createPrompt(title, analysis, sampledSentences) {
  const samples = sampledSentences.length
    ? sampledSentences.map((sentence) => `- ${sentence}`).join("\n")
    : "- 추출된 문장 없음";

  return `다음 뉴스의 낚시성 여부를 검토해 주세요.

[뉴스 제목]
${title}

[ELS 및 AI 추론 분석 결과]
- 최종 위험도: ${analysis.score}%
- 낚시성 헤드라인 점수: ${analysis.headlineScore}%
- 본문 맥락 불일치 점수: ${analysis.contextMismatchScore}%
- 논리 오류 및 과장성 점수: ${analysis.logicScore}%
- 분석 이유: ${analysis.reasons.join(" / ")}

[등간격 추출 문장]
${samples}

추출 문장이 제목의 주장과 실제로 연관되는지, 과장이나 오해의 소지가 있는 표현이 있는지 근거와 함께 설명해 주세요.`;
}

function showAnalysis() {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    resultBox.textContent = "제목과 본문을 모두 입력해 주세요.";
    resultBox.classList.remove("is-success");
    appStatus.textContent = "입력 필요";
    appStatus.classList.remove("is-running");
    return;
  }

  const sentences = splitSentences(body);
  const sampledSentences = extractELS(sentences, ELS_INTERVAL);
  const analysis = analyzeArticle(title, body, sampledSentences);
  const judgement = getJudgement(analysis.score);

  resultBox.replaceChildren();

  const scoreLine = document.createElement("p");
  scoreLine.className = "analysis-score";
  scoreLine.textContent = `최종 가짜뉴스 위험도: ${analysis.score}%`;
  const judgementLine = document.createElement("p");
  judgementLine.className = "analysis-judgement";
  judgementLine.textContent = `판별 결과: ${judgement}`;
  const metricList = document.createElement("ul");
  metricList.className = "metric-list";
  [
    `낚시성 헤드라인 여부: ${analysis.headlineScore}%`,
    `본문과의 맥락 불일치: ${analysis.contextMismatchScore}%`,
    `논리적 오류 및 과장성: ${analysis.logicScore}%`,
  ].forEach((metric) => {
    const item = document.createElement("li");
    item.textContent = metric;
    metricList.append(item);
  });
  const reasonHeading = document.createElement("p");
  reasonHeading.className = "result-heading";
  reasonHeading.textContent = "AI 추론 근거";
  const reasonList = document.createElement("ul");
  reasonList.className = "reason-list";
  analysis.reasons.forEach((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    reasonList.append(item);
  });
  const sampleHeading = document.createElement("p");
  sampleHeading.className = "result-heading";
  sampleHeading.textContent = `ELS 추출 요약 문장 (매 ${ELS_INTERVAL}번째)`;
  const sampleList = document.createElement("ul");
  sampleList.className = "els-list";

  if (sampledSentences.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "추출할 문장이 없습니다. 본문을 두 문장 이상 입력해 주세요.";
    sampleList.append(emptyItem);
  } else {
    sampledSentences.forEach((sentence) => {
      const item = document.createElement("li");
      item.textContent = sentence;
      sampleList.append(item);
    });
  }

  resultBox.append(
    scoreLine,
    judgementLine,
    metricList,
    reasonHeading,
    reasonList,
    sampleHeading,
    sampleList,
  );
  promptInput.value = createPrompt(title, analysis, sampledSentences);
  promptArea.hidden = false;
  copyStatus.textContent = "";
  resultBox.classList.add("is-success");
  appStatus.textContent = "분석 완료";
  appStatus.classList.add("is-running");
}

function resetAnalysis() {
  titleInput.value = "";
  bodyInput.value = "";
  resultBox.textContent = "제목과 본문을 입력한 뒤 분석하기를 눌러 주세요.";
  promptInput.value = "";
  promptArea.hidden = true;
  copyStatus.textContent = "";
  resultBox.classList.remove("is-success");
  appStatus.textContent = "시작 준비";
  appStatus.classList.remove("is-running");
}

startButton.addEventListener("click", showAnalysis);
resetButton.addEventListener("click", resetAnalysis);
copyPromptButton.addEventListener("click", async () => {
  if (!promptInput.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(promptInput.value);
    copyStatus.textContent = "복사되었습니다.";
  } catch {
    promptInput.select();
    document.execCommand("copy");
    copyStatus.textContent = "복사되었습니다.";
  }
});