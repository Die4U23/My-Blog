import { hydrateRoot } from 'react-dom/client';
import { StarHero } from './StarHero';

import { ArticleExplorer } from './ArticleExplorer';

const root = document.getElementById('sky-root');
if (root) hydrateRoot(root, <StarHero />);

const explorer = document.getElementById('explorer-root');
const data = document.getElementById('archive-data')?.textContent;
if (explorer && data) hydrateRoot(explorer, <ArticleExplorer posts={JSON.parse(data)} />);
