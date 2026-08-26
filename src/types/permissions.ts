export interface FeatureLeaf {
  id: string;
  label: string;
}

export interface FeatureModule {
  id: string;
  number: number;
  title: string;
  items: FeatureLeaf[];
}

export type UserPermissionMap = Record<string, Record<string, boolean>>;
