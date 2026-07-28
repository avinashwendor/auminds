import type { CourseContentDef } from './types';
import { introToBackendSystems } from './intro-to-backend-systems';

const COURSE_REGISTRY: Record<string, CourseContentDef> = {
  [introToBackendSystems.slug]: introToBackendSystems,
};

export function getCourseContent(slug: string): CourseContentDef {
  const def = COURSE_REGISTRY[slug];
  if (!def) {
    throw new Error(`No course content definition found for slug: ${slug}`);
  }
  return def;
}

export function listDeliverableCourseSlugs(): string[] {
  return Object.keys(COURSE_REGISTRY);
}

export * from './types';
export { introToBackendSystems, EXISTING_LESSON_IDS, EXISTING_MODULE_IDS } from './intro-to-backend-systems';
