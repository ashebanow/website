import CustomMDX from "@/components/custom-mdx";
import NavTree, { NavTreeNode } from "@/components/nav-tree";
import { H1, P } from "@/components/text";
import RootLayout from "@/layouts/root-layout";
import {
  DocsPageData,
  loadAllDocsPageSlugs,
  loadDocsPage,
} from "@/lib/fetch-docs";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import s from "./DocsPage.module.css";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { navTreeToBreadcrumbs } from "@/lib/nav-tree-to-breadcrumbs";

// This is the location that we expect our docs mdx files to be located,
// relative to the root of the Next.js project.
const DOCS_DIRECTORY = "./docs";
const GITHUB_REPO_URL = "https://github.com/ghostty-org/website";
// This is the URL path for all of our docs pages
const DOCS_PAGES_ROOT_PATH = "/docs";

export async function getStaticPaths() {
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);
  return {
    paths: docsPageSlugs.map((slug: string): StaticPropsParams => {
      return {
        params: {
          path: slug.split("/"),
        },
      };
    }),
    fallback: false,
  };
}

interface StaticPropsParams {
  params: {
    path: Array<string>;
  };
}

export async function getStaticProps({ params: { path } }: StaticPropsParams) {
  const activePageSlug = path.join("/");
  const navTreeData = await loadDocsNavTreeData(DOCS_DIRECTORY, activePageSlug);
  const docsPageData = await loadDocsPage(DOCS_DIRECTORY, activePageSlug);
  const breadcrumbs = navTreeToBreadcrumbs(
    "Ghostty Docs",
    DOCS_PAGES_ROOT_PATH,
    navTreeData,
    activePageSlug
  );
  return {
    props: {
      navTreeData,
      docsPageData,
      breadcrumbs,
    },
  };
}

interface DocsPageProps {
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}

export default function DocsPage({
  navTreeData,
  docsPageData: { title, description, content, relativeFilePath },
  breadcrumbs,
}: DocsPageProps) {
  return (
    <RootLayout meta={{ title, description }}>
      <div className={s.docsPage}>
        <div className={s.sidebar}>
          <div className={s.sidebarContentWrapper}>
            <NavTree
              rootPath={DOCS_PAGES_ROOT_PATH}
              className={s.sidebarNavTree}
              nodes={navTreeData}
            />
          </div>
        </div>
        <main className={s.contentWrapper}>
          <div className={s.breadcrumbsBar}>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>

          <div className={s.heading}>
            <H1>{title}</H1>
            <P>{description}</P>
          </div>

          <CustomMDX content={content} />
          <br />
          <div>
            <a href={`${GITHUB_REPO_URL}/edit/main/${relativeFilePath}`}>
              Edit on GitHub
            </a>
          </div>
        </main>
      </div>
    </RootLayout>
  );
}