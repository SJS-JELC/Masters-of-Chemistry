import type {
  ActivityId,
  QuestionRef,
  TeacherCatalogueEntry,
  QuestionProvider,
  Level,
} from '../contracts/index.ts';
const cache = new Map<ActivityId, Promise<readonly TeacherCatalogueEntry[]>>();
const entry = (
  ref: QuestionRef,
  label: string,
  group: string,
  key = ref.questionId + ':' + ref.level,
): TeacherCatalogueEntry => ({ key, label, group, ref });
function fixed(provider: QuestionProvider): TeacherCatalogueEntry[] {
  return provider.coverage.flatMap((c) =>
    c.kind === 'fixed'
      ? c.questionIds.flatMap((id) => {
          const ref = provider.resolveLink(id);
          if (!ref) throw Error(`Missing teacher route: ${id}`);
          const question = provider.restore(ref);
          return [
            entry(ref, `${question.title} · ${id} · Level ${ref.level}`, 'Fixed question bank'),
          ];
        })
      : [],
  );
}
/** Enumerate source configurations. Seeds reproduce numerical instances, not a sampled bank. */
export function teacherCatalogue(
  activityId: ActivityId,
): Promise<readonly TeacherCatalogueEntry[]> {
  const existing = cache.get(activityId);
  if (existing) return existing;
  const result = load(activityId);
  cache.set(activityId, result);
  return result;
}
async function load(id: ActivityId): Promise<readonly TeacherCatalogueEntry[]> {
  switch (id) {
    case 'alevel/acid-base-calculations': {
      const [{ acidEngine }, { acidRef, acidAvailableLevels }] = await Promise.all([
        import('../activities/alevel/acid-base-calculations/engine.js'),
        import('../activities/alevel/acid-base-calculations/provider.ts'),
      ]);
      return [
        ...acidEngine.templates.flatMap((t) =>
          acidAvailableLevels(t.id).map((level) =>
            entry(
              acidRef(acidEngine.generate(t.id, level, 1)),
              `${t.label} · ${t.id} · Level ${level}`,
              t.familyLabel,
            ),
          ),
        ),
      ];
    }
    case 'igcse/calorimetry': {
      const { calorimetryConfigurations, calorimetryCode, calorimetryRef } = await import(
        '../activities/igcse/calorimetry/provider.ts'
      );
      return calorimetryConfigurations().map((c) =>
        entry(
          calorimetryRef(calorimetryCode(c, 1)),
          `${c.example} · ${c.target} · Level ${c.difficulty} · ${c.massRoute} / ${c.amountRoute} / ${c.temperatureRoute} · ${c.structure}`,
          c.setup,
          JSON.stringify(c),
        ),
      );
    }
    case 'igcse/bond-enthalpy': {
      const [{ core }, { bondCode, bondRef, bondSource }] = await Promise.all([
        import('../chemistry/thermochemistry/bond-enthalpy-core.js'),
        import('../activities/igcse/bond-enthalpy/provider.ts'),
      ]);
      return core.reactions.flatMap((r) =>
        r.allowedLevels.flatMap((level) =>
          (level === 1 ? ['enthalpy-change'] : ['enthalpy-change', 'unknown-bond']).map(
            (family) => {
              let ref: QuestionRef | undefined;
              for (let seed = 1; seed <= 1000; seed++) {
                const code = bondCode(r.id, level, seed);
                if (bondSource(code).questionType === family) {
                  ref = bondRef(code);
                  break;
                }
              }
              if (!ref) throw Error(`Missing bond route: ${r.id}/${level}/${family}`);
              return entry(ref, `${r.name} · ${family} · Level ${level}`, r.equation);
            },
          ),
        ),
      );
    }
    case 'alevel/electron-configurations': {
      const [{ variants, matchingFamilies, matchingFromId, format }, { data }] = await Promise.all([
        import('../chemistry/electron-configuration/identity.ts'),
        import('../chemistry/electron-configuration/data.js'),
      ]);
      const rows = variants.flatMap((v) =>
        ([1, 2, 3] as Level[])
          .filter((l) => l >= v.minimumLevel)
          .map((level) =>
            entry(
              { activityId: id, questionId: v.questionId, seed: 0, level },
              `${data.species.find((s) => s.id === v.speciesId)!.name} · ${v.direction} · ${v.representation} · ${v.questionId} · Level ${level}`,
              v.group,
            ),
          ),
      );
      for (let mask = 1; mask < 16; mask++) {
        const groups = data.groups.filter((_g, i) => mask & (2 ** i)).map((g) => g.id),
          items = data.species.filter((s) => groups.includes(s.group));
        for (const family of matchingFamilies) {
          const positives = items.filter((s) => s.counts.join(',') === family.counts.join(','));
          if (positives.length < 2 || items.length - positives.length < 3) continue;
          let ref: QuestionRef | undefined;
          for (let seed = mask; seed < 160000; seed += 16) {
            const q = matchingFromId(format('ECB', seed));
            if (q.counts.join(',') === family.counts.join(',')) {
              ref = { activityId: id, questionId: q.questionId, level: 3, seed };
              break;
            }
          }
          if (!ref) throw Error(`Missing matching family: ${family.templateId}/${mask}`);
          rows.push(
            entry(
              ref,
              `${family.templateId} / ${groups.join(', ')} / Level 3`,
              'Matching configuration families',
              family.templateId + ':' + mask,
            ),
          );
        }
      }
      return rows;
    }
    case 'alevel/dot-and-cross':
    case 'igcse/dot-and-cross': {
      const m =
        id === 'alevel/dot-and-cross'
          ? await import('../activities/alevel/dot-and-cross/provider.ts')
          : await import('../activities/igcse/dot-and-cross/provider.ts');
      return m.teacherQuestionIds.flatMap((qid) => {
        const q = m.getRecord(qid);
        return (q.grades.length ? q.grades : [1 as Level]).map((level) =>
          entry(
            { activityId: id, questionId: qid, seed: 0, level },
            `${q.name} · ${'displayFormula' in q ? q.displayFormula : q.formula} · ${qid}${q.grades.length ? '' : ' / Teacher reference, outside pupil pools'} · Level ${level}`,
            q.category,
          ),
        );
      });
    }
    case 'alevel/electrons-bonding':
      return fixed(
        (await import('../activities/alevel/electrons-bonding/provider.ts'))
          .electronsBondingProvider,
      );
    case 'alevel/ph-titration-curves':
      return fixed(
        (await import('../activities/alevel/ph-titration-curves/provider.ts')).titrationProvider,
      );
    case 'igcse/structure-and-bonding':
      return fixed(
        (await import('../activities/igcse/structure-and-bonding/provider.ts')).structureProvider,
      );
    case 'igcse/energy-enthalpy':
      return fixed(
        (await import('../activities/igcse/energy-enthalpy/provider.ts')).energyProvider,
      );
    case 'igcse/energetics-practical':
      return fixed(
        (await import('../activities/igcse/energetics-practical/provider.ts')).practicalProvider,
      );
    case 'alevel/c3l6-organic-reactions':
      return [];
  }
}
