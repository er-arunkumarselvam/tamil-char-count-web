import Aksharas, { TokenType } from "tamil-characters-count";
import { debounce, sanitize } from "./utils";

type AnalysisAkshara = {
  value: string;
  isInvalid: boolean;
};

interface Analysis {
  word: string;
  aksharas: AnalysisAkshara[];
  aksharasCount: number;
  invalidCount: number;
  varnas: string[];
  varnasCount: number;
}

const analysisEle = document.querySelector<HTMLElement>(
  "#app .analysis-content"
);

const analysisPlaceholder = analysisEle?.innerHTML;

const getAnalysis = (input: string): Analysis[] => {
  const wordBoundary = /[\s।॥!,\.\(\)\{\}\[\]&=]/;

  const words = input.split(wordBoundary).filter((word) => !!word);

  return words.reduce((acc: Analysis[], word) => {
    const results = Aksharas.analyse(word);

    const aksharas = results.all
      .filter((token) =>
        [TokenType.Akshara, TokenType.Invalid].includes(token.type)
      )
      .map(({ value, ...token }) => ({
        value,
        isInvalid: token.type === TokenType.Invalid,
      }));

    const varnas = results.varnas.map((varna) => varna.value);

    const analysis = {
      word,
      aksharas,
      aksharasCount: results.aksharas.length,
      invalidCount: results.invalid.length,
      varnas,
      varnasCount: results.varnas.length,
    };

    if (analysis.aksharas.length < 1) return acc;

    return acc.concat(analysis);
  }, []);
};

const createAnalysisItem = (analysis: Analysis): string => {
  const { aksharasCount, invalidCount, varnasCount } = analysis;

  const header = sanitize(analysis.word);

  const aksharasCounter = `<span>${aksharasCount}</span>`.concat(
    invalidCount ? `<span class="invalid">${invalidCount}</span>` : ""
  );

  const aksharasDetailsContent = analysis.aksharas
    .map((akshara) =>
      !akshara.isInvalid
        ? `<span>${akshara.value}</span>`
        : `<span class="invalid">&nbsp;${akshara.value}&nbsp;</span>`
    )
    .join("&nbsp;· ");

  const varnasCounter = `<span>${varnasCount}</span>`;

  const varnasDetailsContent = analysis.varnas.join("&nbsp;· ");

  return `
    <div class="analysis-item">
      <div class="header">${header}</div>
      <div class="details">
        <div class="title">Aksharas</div>
        <div class="counters">${aksharasCounter}</div>
        <div class="content">${aksharasDetailsContent || "N/A"}</div>
      </div>
      <div class="details">
        <div class="title">Varnas</div>
        <div class="counters">${varnasCounter}</div>
        <div class="content">${varnasDetailsContent || "N/A"}</div>
      </div>
    </div>`;
};

const $renderAnalysis = (analyses: Analysis[]) => {
  if (!analysisEle) return;

  let content = analysisPlaceholder || "N/A";

  if (analyses.length > 0) {
    content = analyses.map(createAnalysisItem).join("");
  }

  analysisEle.innerHTML = content;
};

export const renderAnalysis = debounce((input: string) => {
  const analysis = getAnalysis(input);

  $renderAnalysis(analysis);
});
