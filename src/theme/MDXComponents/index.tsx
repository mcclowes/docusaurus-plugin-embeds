import MDXComponents from '@theme-original/MDXComponents';
import { GitHubRepoCard, NpmPackageCard, YouTube } from '../../client';
import RichLinkCard from './RichLinkCard';

export default {
  ...MDXComponents,
  GitHubRepoCard,
  NpmPackageCard,
  YouTube,
  RichLinkCard,
  LinkCard: RichLinkCard,
};
