import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
export const QuestionChromeContext = createContext(undefined);
export const useQuestionChrome = () => useContext(QuestionChromeContext);
/** These providers append a source review code to the title, in addition to the stable ref ID. */
export function questionDisplayTitle(question) {
    const separator = question.title.lastIndexOf(' · ');
    if (separator < 0)
        return question.title;
    const suffix = question.title.slice(separator + 3);
    const reviewPrefixes = {
        'alevel/dot-and-cross': 'DAC',
        'igcse/dot-and-cross': 'DC',
        'alevel/ph-titration-curves': 'TC',
        'igcse/energy-enthalpy': 'EE',
    };
    const prefix = reviewPrefixes[question.ref.activityId];
    const sourceReviewCode = !!prefix && new RegExp(`^${prefix}-[A-Z0-9]{6}$`).test(suffix);
    return suffix === question.ref.questionId || sourceReviewCode
        ? question.title.slice(0, separator)
        : question.title;
}
/** Only repeated activity labels are suppressed; specific scientific titles stay visible. */
export function repeatsQuestionSubtopic(title, header) {
    const normalise = (value) => value
        .toLocaleLowerCase('en-GB')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
    return !!header && normalise(title) === normalise(header.subtopic);
}
export function QuestionChrome({ course, metadata, onBack, }) {
    const courseTitle = course === 'alevel' ? 'A Level Chemistry' : 'IGCSE Chemistry';
    return (_jsxs("header", { className: "question-masthead", children: [_jsxs("div", { className: "question-brand", children: [_jsx("button", { type: "button", className: "question-brand-mark", "aria-label": "Back to course map", onClick: onBack, disabled: !onBack, children: _jsx("img", { src: `${import.meta.env.BASE_URL}assets/SJS-Eagle.svg`, alt: "" }) }), _jsxs("div", { className: "question-brand-title", children: [_jsx("p", { className: "question-wordmark", children: "MASTERS OF CHEMISTRY" }), _jsxs("h1", { className: "question-subject", children: [courseTitle, " - ", metadata.subtopic] })] })] }), _jsxs("div", { className: "question-header-actions", children: [metadata.questionId && (_jsx("span", { className: "header-question-code", "aria-label": "Question ID", children: metadata.questionId })), _jsx("button", { type: "button", className: "question-back", "aria-label": "Back to course map", title: "Back to course map", onClick: onBack, disabled: !onBack, children: _jsx("span", { "aria-hidden": "true", children: "\u2190" }) })] })] }));
}
