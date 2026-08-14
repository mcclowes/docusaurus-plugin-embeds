import { usePluginData } from '@docusaurus/useGlobalData';
import BaseRichLinkCard, { type RichLinkCardProps } from '../../components/RichLinkCard';
import type { LinkMetadata } from '../../server/linkMetadata';

interface EmbedsPluginData {
  links?: Record<string, LinkMetadata>;
}

export default function RichLinkCard(props: RichLinkCardProps) {
  const data = usePluginData('docusaurus-plugin-embeds') as EmbedsPluginData;
  return <BaseRichLinkCard {...props} metadata={props.metadata ?? data.links?.[props.url]} />;
}
