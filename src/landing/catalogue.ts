import raw from './catalogue-data.json';
import type { Course } from '../contracts/identity';
export interface LandingGroup {
  key: string;
  name: string;
  colour: string;
  topics: [number, string, string[]][];
}
export interface LandingActivity {
  label: string;
  type?: string;
  typeLabel?: string;
  note?: string;
  availableGrades?: number[];
}
export interface DisplayGem {
  id: string;
  name: string;
  group: LandingGroup;
  topicNumber: number;
  topicName: string;
}
export interface LandingCatalogue {
  groups: LandingGroup[];
  activities: Record<string, LandingActivity>;
  display: {
    hiddenGems: string[];
    redirects: Record<string, string>;
    identities?: Record<string, string>;
  };
}
export const catalogues = raw as unknown as Record<Course, LandingCatalogue>;
export function displayGems(course: Course): DisplayGem[] {
  const catalogue = catalogues[course];
  return catalogue.groups
    .flatMap((group) =>
      group.topics.flatMap(([topicNumber, topicName, names]) =>
        names.map((name, index) => ({
          id:
            catalogue.display.identities?.[`${group.key}-${topicNumber}-${index + 1}`] ??
            `${group.key}-${topicNumber}-${index + 1}`,
          name,
          group,
          topicNumber,
          topicName,
        })),
      ),
    )
    .filter((gem) => !catalogue.display.hiddenGems.includes(gem.id));
}
