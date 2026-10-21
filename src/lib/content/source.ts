/**
 * The seam between the content provider and wherever the content lives.
 *
 * A source returns *everything* — scheduled journeys, draft articles — and
 * does no filtering. The provider (`./index.ts`) applies the publishing rules
 * in one place, so a new adapter cannot accidentally leak a draft.
 *
 * To move to a CMS: write `sources/<cms>.ts` implementing `ContentSource`,
 * mapping the CMS documents onto the types in `./types.ts`, then change the one
 * line below. Nothing in the UI changes. See docs/redesign/ARCHITECTURE.md.
 */
import type {
  Experience,
  JournalArticle,
  Journey,
  Navigation,
  PageCopy,
  SiteSettings,
} from './types';
import { localSource } from './sources/local';

export interface ContentSource {
  /** For logs and debugging, e.g. 'local', 'sanity'. */
  readonly name: string;
  /** Every journey, scheduled ones included. */
  journeys(): Promise<readonly Journey[]>;
  /** Every journal entry, drafts included. */
  journal(): Promise<readonly JournalArticle[]>;
  experiences(): Promise<readonly Experience[]>;
  siteSettings(): Promise<SiteSettings>;
  navigation(): Promise<Navigation>;
  pageCopy(): Promise<PageCopy>;
}

/** The active source. The single line a CMS migration changes. */
export const source: ContentSource = localSource;
