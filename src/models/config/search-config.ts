import { LighthouseBrandListDisplayItem } from '../lighthouse/lighthouse-source-search';
import { SearchFilter } from '../search/search-filter';

export interface SearchConfig {
  searchFilter?: SearchFilter;
  selectedBrand?: LighthouseBrandListDisplayItem;
  showSearchByLocation?: boolean;
}
