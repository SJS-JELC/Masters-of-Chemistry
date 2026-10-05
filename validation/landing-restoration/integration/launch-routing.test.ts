import test from 'node:test';
import assert from 'node:assert/strict';
import { productionRegistry } from '../../../src/foundation/registry.ts';
import {
  routeCourse,
  routeView,
  sameRevisionSelection,
  validateLandingLaunch,
} from '../../../src/shell/navigation-view.ts';
import { selectPracticeQuestion } from '../../../src/domain/session/practice.ts';
import type { Course, CurriculumTarget } from '../../../src/contracts/identity.ts';
import type { LandingLaunchRequest } from '../../../src/contracts/landing.ts';

test('all 41 registered target levels map exactly to their 16 gems and source providers', async () => {
  let gems = 0,
    targets = 0;
  for (const course of ['alevel', 'igcse'] as Course[])
    for (const registration of productionRegistry.curriculumFor(course)) {
      const provider = await registration.provider();
      for (const gem of registration.gems) {
        gems++;
        const revision = validateLandingLaunch(
          { id: 'revision', kind: 'revision', course, gemIds: [gem.id] },
          productionRegistry,
        );
        assert.equal(revision?.kind, 'revision');
        if (revision?.kind !== 'revision') throw Error('No revision mapping');
        assert.deepEqual(
          revision.targets.map((target) => target.level),
          gem.supportedLevels,
        );
        for (const level of gem.supportedLevels) {
          targets++;
          const request = validateLandingLaunch(
            {
              id: gem.id + level,
              kind: 'practice',
              course,
              gemId: gem.id,
              selection: 'fixed-level',
              level,
            },
            productionRegistry,
          );
          assert.equal(request?.kind, 'practice');
          if (request?.kind !== 'practice') throw Error('No practice mapping');
          assert.deepEqual(request.target, {
            course,
            activityId: registration.id,
            gemId: gem.id,
            level,
          });
          const ref = provider.select({ ...request.target, seed: 13579, previousQuestionIds: [] });
          assert.equal(ref.activityId, registration.id);
          assert.equal(ref.level, level);
          assert.deepEqual(provider.restore(ref).ref, ref);
        }
        const mastery = validateLandingLaunch(
          { id: 'mastery', kind: 'practice', course, gemId: gem.id, selection: 'mastery' },
          productionRegistry,
        );
        assert.equal(mastery?.kind, 'practice');
        if (mastery?.kind !== 'practice') throw Error('No mastery mapping');
        const summaries = gem.supportedLevels.map((level, index) => ({
          gemId: gem.id,
          level,
          score: index ? null : 1,
          count: index ? 0 : 4,
          mastered: !index,
          lastCompletedAt: index ? null : Date.now(),
        }));
        const choice = selectPracticeQuestion({
          session: {
            kind: 'practice',
            namespace: { course, profileId: 'test' },
            id: 'current-session',
            target: mastery.target,
            selection: mastery.selection,
            currentAttemptId: null,
            previousQuestionIds: [],
          },
          provider,
          summaries,
          seed: 2468,
        });
        if (gem.supportedLevels.length > 1) assert.equal(choice?.ref.level, gem.supportedLevels[1]);
        else assert.equal(choice, null);
        for (const level of [1, 2, 3] as const)
          if (!gem.supportedLevels.includes(level))
            assert.equal(
              validateLandingLaunch(
                {
                  id: 'unsupported',
                  kind: 'practice',
                  course,
                  gemId: gem.id,
                  selection: 'fixed-level',
                  level,
                },
                productionRegistry,
              ),
              null,
            );
      }
    }
  assert.equal(gems, 16);
  assert.equal(targets, 41);
});
test('display-only, hidden alias, Olympiad and cross-course leaves cannot enable curriculum content', () => {
  for (const course of ['alevel', 'igcse'] as Course[]) {
    const unsupported = ['no-such-gem', 'alevel/c3l6-organic-reactions', 'rocket-recall'];
    for (const reg of productionRegistry.curriculumFor(course))
      for (const gem of reg.gems)
        unsupported.push(
          ...gem.mastery.historicalAliases.filter(
            (id) =>
              !productionRegistry
                .curriculumFor(course)
                .some((r) => r.gems.some((g) => g.id === id)),
          ),
        );
    for (const gemId of unsupported)
      assert.equal(
        validateLandingLaunch(
          { id: 'reject', kind: 'practice', course, gemId, selection: 'mastery' },
          productionRegistry,
        ),
        null,
      );
    const other = productionRegistry.curriculumFor(course === 'alevel' ? 'igcse' : 'alevel')[0]!
      .gems[0]!.id;
    assert.equal(
      validateLandingLaunch(
        { id: 'cross', kind: 'revision', course, gemIds: [other] },
        productionRegistry,
      ),
      null,
    );
  }
  assert.equal(
    validateLandingLaunch(
      { id: '', kind: 'practice', course: 'alevel', gemId: 'x', selection: 'mastery' },
      productionRegistry,
    ),
    null,
  );
  assert.equal(
    validateLandingLaunch(
      { id: 'empty', kind: 'revision', course: 'alevel', gemIds: [] },
      productionRegistry,
    ),
    null,
  );
});
test('course precedence and Home default retain explicit old links and entry preferences', () => {
  const url = (query: string) => new URL(query, 'https://new.invalid/alevel.html');
  assert.equal(routeCourse(url(''), 'igcse', 'alevel'), 'igcse');
  assert.equal(routeCourse(url(''), null, 'alevel'), 'alevel');
  assert.equal(routeCourse(url('?course=alevel'), 'igcse', 'igcse'), 'alevel');
  assert.equal(routeCourse(url('?activity=igcse/calorimetry'), 'alevel', 'alevel'), 'igcse');
  assert.equal(
    routeCourse(
      url(
        '?legacy=' +
          encodeURIComponent(
            '/Masters-of-IGCSE-Chemistry/activities/calorimetry/index.html?question=CAL-1-1',
          ),
      ),
      'alevel',
      'alevel',
    ),
    'igcse',
  );
  assert.equal(routeCourse(url('#u6-t1-1-2'), 'igcse', 'igcse'), 'alevel');
  assert.equal(routeCourse(url('#fourth-3-1'), 'alevel', 'alevel'), 'igcse');
  assert.equal(routeCourse(url('#lower-10-3'), 'alevel', 'alevel'), 'igcse');
  assert.equal(routeCourse(url('#upper-4-1'), 'alevel', 'alevel'), 'igcse');
  assert.equal(routeView(url(''), 'alevel'), 'home');
  assert.equal(routeView(url('?view=home'), 'alevel'), 'home');
  assert.equal(routeView(url('?activity=igcse/calorimetry'), 'igcse'), 'practice');
  assert.equal(routeView(url('?question=CAL-1-1'), 'igcse'), 'teacher');
  assert.equal(routeView(url('?session=revision'), 'alevel'), 'revision');
  assert.equal(routeView(url('?view=olympiad'), 'igcse'), 'home');
  assert.equal(
    routeView(
      url(
        '?legacy=' +
          encodeURIComponent(
            '/activities/calorimetry/index.html?leaf=lower-10-3&fresh=1&mode=teacher',
          ),
      ),
      'igcse',
    ),
    'teacher',
  );
  assert.equal(
    routeView(
      url(
        '?legacy=' +
          encodeURIComponent('/activities/calorimetry/index.html?leaf=lower-10-3&fresh=1'),
      ),
      'igcse',
    ),
    'practice',
  );
});
test('revision selection comparison ignores ordering but preserves exact course and supported level set', () => {
  const request: LandingLaunchRequest = {
    id: 'selection',
    kind: 'revision',
    course: 'alevel',
    gemIds: productionRegistry.curriculumFor('alevel')[0]!.gems.map((gem) => gem.id),
  };
  const validated = validateLandingLaunch(request, productionRegistry);
  assert.equal(validated?.kind, 'revision');
  if (validated?.kind !== 'revision') throw Error('No mapping');
  assert(sameRevisionSelection(validated.targets, [...validated.targets].reverse()));
  assert(!sameRevisionSelection(validated.targets, validated.targets.slice(1)));
  assert(
    !sameRevisionSelection(
      validated.targets,
      validated.targets.map((target) => ({ ...target, course: 'igcse' }) as CurriculumTarget),
    ),
  );
});
