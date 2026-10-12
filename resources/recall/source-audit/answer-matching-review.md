# Answer matching suggestions

These are review decisions in the CSV, not implemented app behaviour.
Allowed answer 1 is the preferred model answer for each part. Other allowed
answers are marking alternatives and should not all appear in model feedback.

| Answer matching | Intended behaviour |
| --- | --- |
| exact | Match a complete listed alternative after safe normalisation of prose case, surrounding spaces, repeated spaces and terminal punctuation. Formula alternatives must retain element-symbol case, atom counts and charge; recognise equivalent chemical notation explicitly. |
| phrase | Match a listed alternative as whole words within a longer response, with reviewed rules for surrounding wording, contradictions and sequence. Never use an unrestricted substring search or silently ignore unknown claims. |
| numeric range | Parse a numeric response and accept values between Numeric minimum and Numeric maximum, inclusively. Equal endpoints specify one value. |
| MCQ selection | Check the selected option against the correct option. Text matching is not applicable. |

Exact is suggested for names, formulae, isolated colours, short list entries and
fill-in-the-blank definitions. Phrase is suggested for procedures, observations,
longer definitions, uses and explanatory statements. This is a per-answer-part
suggestion: different parts of one question can use different modes.

Phrase matching still needs listed wording alternatives. For example, "melts
into a ball" does not literally contain "melts to form a ball". It must reject
negated or contradictory answers and preserve the order of colour changes and
procedure steps. A blanket ban on words such as "not" would also be wrong:
"Many polymers do not biodegrade" is itself an accepted answer. Short chemical
formulae embedded in procedure aliases still require chemical notation checks.

The remaining chemical tests were shortened to match the teacher's review:
brief instructions, concise observations, and the preferred answer first.
Anhydrous copper(II) sulphate, reagent order, both carbonate-test steps, and the
pressure condition for the boiling-point check remain explicit. Omitted
aqueous/dilute qualifiers in short halide answers follow the teacher's sulphate
test convention; the intended laboratory reagents remain solutions and dilute
acid. These recall answers are not full practical instructions.

All pre-existing cells through spreadsheet row 81 and every manually populated
Needs further work cell were preserved. An existing unresolved review issue
remains: ammonium Test - Part II lacks its ID/metadata, while its question still
declares two required parts. Warming and damp litmus are absent from its edited
wording. These need resolving before importing the bank into the app.

The pre-pass file is saved as review-source/before-answer-matching.csv.
scripts/update_rocket_recall_matching_review.py records the transformation and
refuses repeat execution to protect later teacher edits. Validation results are
in answer-matching-validation.json. This remains the IGCSE teacher review bank;
no OCR A Level coverage audit or app update was performed.
