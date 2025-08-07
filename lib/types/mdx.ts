export interface MDXFrontmatter {
  title: string;
  description?: string;
  breadcrumbs: Array<{
    label: string;
    href: string;
  }>;
  publishedAt?: string;
  updatedAt?: string;
  tableOfContents?:
    | boolean
    | {
        enabled?: boolean;
        maxLevel?: number;
        selector?: string;
      };
}
