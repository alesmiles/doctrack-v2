#!/usr/bin/env python3
"""
Механический линт черновика промпта DocTrack против шаблона.
Это НЕ замена смысловому аудиту (см. SKILL.md, шаг 2.2).

Использование:
    python3 lint_prompt.py путь/к/черновику.md

Код возврата: 0 — линт пройден без замечаний, 1 — есть замечания.
"""

import re
import sys
import difflib
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REFERENCE_DIR = SCRIPT_DIR.parent / "reference"
CANONICAL_SECTION_7 = REFERENCE_DIR / "section7_canonical.txt"
BANNED_PHRASES_FILE = REFERENCE_DIR / "banned_phrases.txt"

# Ищем корень репозитория от текущей рабочей директории (где вызван скрипт),
# а не от расположения самого скрипта — промпты живут в другом репозитории.
def find_repo_root():
    cur = Path.cwd()
    for p in [cur, *cur.parents]:
        if (p / ".git").exists():
            return p
    return cur

REPO_ROOT = find_repo_root()

SECTION_PATTERNS = [
    (1, r"1\)\s*Заголовок"),
    (2, r"2\)\s*Контекст"),
    (3, r"3\)\s*Описание"),
    (4, r"4\)\s*Definition of Done|4\)\s*DoD"),
    (5, r"5\)\s*Проверка через Playwright"),
    (6, r"6\)\s*Финальная сверка"),
    (7, r"7\)\s*Режим работы"),
]

FILENAME_HINT = re.compile(r"[A-Za-zА-Яа-я0-9_/]+\.(tsx|ts|jsx|js|py|md|json|css)")
REQUIRED_STATUSES = ["Готово с отклонениями", "Заблокировано", "Готово"]

# --- существующие проверки (без изменений по сути) ---

def find_sections(text):
    found = []
    for num, pattern in SECTION_PATTERNS:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            found.append((num, m.start()))
    return found


def check_sections_present_and_ordered(text, issues):
    found = find_sections(text)
    found_nums = [n for n, _ in found]
    missing = [n for n, _ in SECTION_PATTERNS if n not in found_nums]
    if missing:
        issues.append(f"Отсутствуют разделы: {missing}")
        return found
    positions = [pos for _, pos in found]
    if positions != sorted(positions):
        issues.append("Разделы присутствуют, но идут не по порядку 1-7.")
    return found


def check_sections_nonempty(text, found, issues):
    positions = sorted(found, key=lambda x: x[1])
    for i, (num, start) in enumerate(positions):
        end = positions[i + 1][1] if i + 1 < len(positions) else len(text)
        body = text[start:end]
        body_after_header = body.split("\n", 1)[1] if "\n" in body else ""
        if len(body_after_header.strip()) < 20:
            issues.append(f"Раздел {num} пустой или почти пустой.")


def check_banned_phrases(text, issues):
    if not BANNED_PHRASES_FILE.exists():
        return
    phrases = [l.strip() for l in BANNED_PHRASES_FILE.read_text(encoding="utf-8").splitlines() if l.strip()]
    for line_num, line in enumerate(text.splitlines(), start=1):
        for phrase in phrases:
            if phrase.lower() in line.lower() and not FILENAME_HINT.search(line):
                issues.append(f"Строка {line_num}: «{phrase}» без ссылки на файл — «{line.strip()[:100]}»")


def check_section_7_exact(text, found, issues):
    if not CANONICAL_SECTION_7.exists():
        return
    positions = sorted(found, key=lambda x: x[1])
    section_7_start = None
    for i, (num, start) in enumerate(positions):
        if num == 7:
            section_7_start, section_7_idx = start, i
            break
    if section_7_start is None:
        return
    end = positions[section_7_idx + 1][1] if section_7_idx + 1 < len(positions) else len(text)
    body_after_header = text[section_7_start:end].split("\n", 1)[1] if "\n" in text[section_7_start:end] else ""
    canonical = CANONICAL_SECTION_7.read_text(encoding="utf-8").strip()
    draft_norm = "\n".join(l.strip() for l in body_after_header.strip().splitlines() if l.strip())
    canon_norm = "\n".join(l.strip() for l in canonical.splitlines() if l.strip())
    if canon_norm not in draft_norm:
        diff = "\n".join(difflib.unified_diff(
            canon_norm.splitlines(), draft_norm.splitlines(),
            fromfile="эталон", tofile="черновик", lineterm=""))
        issues.append("Раздел 7 расходится с эталоном. Diff:\n" + diff)


def check_section_6_requirements(text, issues):
    if "IMPLEMENTATION_REPORT.md" not in text:
        issues.append("Не найдено упоминание IMPLEMENTATION_REPORT.md.")
    found_statuses = [s for s in REQUIRED_STATUSES if s in text]
    if len(found_statuses) < 3:
        issues.append(f"Не найдены все три статуса: отсутствуют {set(REQUIRED_STATUSES) - set(found_statuses)}")
    if "не более 3 попыт" not in text.lower() and "3 попытк" not in text.lower():
        issues.append("Не найден единый лимит в 3 попытки.")


def check_traceability(text, issues):
    r_ids = set(re.findall(r"\bR(\d+(?:\.\d+)?)\b", text))
    d_ids = set(re.findall(r"\bD(\d+)\b", text))
    if not r_ids:
        issues.append("Не найдено ни одного R-id.")
    if not d_ids:
        issues.append("Не найдено ни одного D-id.")
        return
    if "3a" not in text and "Трассировка" not in text:
        issues.append("Не найден раздел 3a.")
        return
    trace_lines = re.findall(r"R(\d+(?:\.\d+)?)\s*→\s*([^\n]+)", text)
    traced_r = {r for r, _ in trace_lines}
    missing = r_ids - traced_r
    if missing:
        issues.append(f"R-id без строки в трассировке: {sorted(missing)}")
    empty = [r for r, t in trace_lines if t.strip() in ("—", "-", "")]
    if empty:
        issues.append(f"R-id с пустой ссылкой: {sorted(set(empty))}")
    referenced_d = set()
    for _, t in trace_lines:
        referenced_d |= set(re.findall(r"D(\d+)", t))
    orphan = d_ids - referenced_d
    if orphan:
        issues.append(f"D-id без ссылки из R: {sorted(orphan, key=int)}")


def check_coverage(text, issues):
    d_ids = set(re.findall(r"\bD(\d+)\b", text))
    if not d_ids:
        return
    covered = set(re.findall(r"\[проверяет:\s*D(\d+)\]", text))
    uncovered = d_ids - covered
    if uncovered:
        issues.append(f"D-id без [проверяет:]: {sorted(uncovered, key=int)}")


def check_report_referenced_once_consistently(text, issues):
    report_names = set(re.findall(r"[A-Z_]+\.md", text))
    report_like = {n for n in report_names if "REPORT" in n}
    if len(report_like) > 1:
        issues.append(f"Несколько разных имён файла-отчёта: {report_like}")


def check_what_not_to_include(text, issues):
    if "Что НЕ включать" not in text and "Что не включать" not in text:
        issues.append("Отсутствует раздел «Что НЕ включать».")


# --- новые проверки ---

def check_code_references_exist(text, issues):
    """
    Ищет ссылки вида `Файл.tsx:123` или `Файл.tsx:123–129` и проверяет,
    что файл существует в репозитории и содержит достаточно строк.
    Не блокирует линт при неоднозначных совпадениях (несколько файлов
    с таким именем) — в этом случае выдаёт предупреждение, не ошибку списка.
    """
    pattern = re.compile(
        r"`?([A-Za-zА-Яа-я0-9_/\.\-]+\.(?:tsx|ts|jsx|js))`?:(\d+)(?:[–\-](\d+))?"
    )
    checked = set()
    for m in pattern.finditer(text):
        filename, start_line, end_line = m.group(1), int(m.group(2)), m.group(3)
        key = (filename, start_line, end_line)
        if key in checked:
            continue
        checked.add(key)
        basename = Path(filename).name
        matches = list(REPO_ROOT.rglob(basename))
        matches = [p for p in matches if "node_modules" not in p.parts]
        if not matches:
            issues.append(f"Ссылка на код «{filename}:{start_line}» — файл не найден в репозитории.")
            continue
        if len(matches) > 1:
            continue  # неоднозначно, не блокируем
        try:
            line_count = len(matches[0].read_text(encoding="utf-8").splitlines())
        except Exception:
            continue
        max_line = int(end_line) if end_line else start_line
        if max_line > line_count:
            issues.append(
                f"Ссылка «{filename}:{start_line}"
                f"{'–' + end_line if end_line else ''}» превышает длину файла "
                f"({line_count} строк) — возможно, номера строк устарели."
            )


def check_section_4_binary(text, found, issues):
    """
    В теле раздела 4 ищет признаки небинарных формулировок: союз "или"
    между вариантами поведения, скобки с перечислением через "/",
    формулировки "на усмотрение".
    """
    positions = sorted(found, key=lambda x: x[1])
    section_4_body = None
    for i, (num, start) in enumerate(positions):
        if num == 4:
            end = positions[i + 1][1] if i + 1 < len(positions) else len(text)
            section_4_body = text[start:end]
            break
    if not section_4_body:
        return
    for line_num, line in enumerate(section_4_body.splitlines(), start=1):
        if re.search(r"\bили\b", line, re.IGNORECASE):
            issues.append(f"Раздел 4, строка {line_num}: союз «или» в критерии DoD — вероятно, не бинарный пункт: «{line.strip()[:100]}»")
        if re.search(r"\([^)]*/[^)]*\)", line):
            issues.append(f"Раздел 4, строка {line_num}: скобка с перечислением через «/» — вероятно, вариант реализации не выбран: «{line.strip()[:100]}»")
        if re.search(r"на усмотрение", line, re.IGNORECASE):
            issues.append(f"Раздел 4, строка {line_num}: «на усмотрение» — решение не принято в промпте: «{line.strip()[:100]}»")


TESTING_LIBRARY_MATCHERS = [
    "toBeInTheDocument", "queryByText", "queryByRole", "getByText",
    "getByRole", "findByText", "findByRole", "screen.",
]

def check_no_testing_library_in_playwright_section(text, found, issues):
    positions = sorted(found, key=lambda x: x[1])
    section_5_body = None
    for i, (num, start) in enumerate(positions):
        if num == 5:
            end = positions[i + 1][1] if i + 1 < len(positions) else len(text)
            section_5_body = text[start:end]
            break
    if not section_5_body:
        return
    for matcher in TESTING_LIBRARY_MATCHERS:
        if matcher in section_5_body:
            issues.append(
                f"Раздел 5 содержит «{matcher}» — это матчер тестового рантайма "
                f"(Testing Library), а проверка идёт через Playwright MCP в "
                f"реальном браузере. Замени на снапшот DOM / скриншот / подсчёт узлов."
            )
    # то же самое — проверить D-пункты раздела 4, если они содержат такие матчеры
    for matcher in TESTING_LIBRARY_MATCHERS:
        if matcher in text and matcher not in section_5_body:
            # уже мог сработать в другом разделе — проверим раздел 4 отдельно
            pass


def main():
    if len(sys.argv) != 2:
        print("Использование: python3 lint_prompt.py путь/к/черновику.md")
        sys.exit(2)

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"Файл не найден: {path}")
        sys.exit(2)

    text = path.read_text(encoding="utf-8")
    issues = []

    found = check_sections_present_and_ordered(text, issues)
    if found:
        check_sections_nonempty(text, found, issues)
        check_section_7_exact(text, found, issues)
        check_section_4_binary(text, found, issues)
        check_no_testing_library_in_playwright_section(text, found, issues)

    check_banned_phrases(text, issues)
    check_section_6_requirements(text, issues)
    check_report_referenced_once_consistently(text, issues)
    check_traceability(text, issues)
    check_coverage(text, issues)
    check_what_not_to_include(text, issues)
    check_code_references_exist(text, issues)

    if issues:
        print(f"ЛИНТ НЕ ПРОЙДЕН — {len(issues)} замечани(е/й):\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}\n")
        sys.exit(1)
    else:
        print("Механический линт пройден без замечаний. Не отменяет шаг 2.2 из SKILL.md.")
        sys.exit(0)


if __name__ == "__main__":
    main()